# Estándar de Código Seguro — nunezgil.com

**Stack:** Next.js 15 (App Router, TS estricto) · PostgreSQL/Prisma · Hosting Vercel
**Alcance de pago:** sin pago online (solo solicitud de pedido/presupuesto) → **fuera de PCI-DSS**.
**Datos sensibles:** PII B2B (nombre comercial, CIF, contacto, dirección), credenciales (Fase 3), secretos de servidor.
**Referencias:** `agentes/seguridad.md` (threat model STRIDE) · `01-INFORME-AUDITORIA.md` (hallazgos S1–S6) · `02-SPEC-IMPLEMENTACION.md`.

Este documento es el contrato de seguridad del repo. Es de obligado cumplimiento para cualquier
código que entre a `main`. Los hallazgos del informe (S1–S6) se mapean a controles concretos abajo.

---

## 1. Arquitectura de seguridad implementada

| Módulo | Fichero | Runtime | Responsabilidad |
|--------|---------|---------|-----------------|
| Cabeceras + CSP por nonce | `middleware.ts` | Edge | Emite CSP estricta por nonce + HSTS y resto de cabeceras en cada respuesta navegable. |
| Constructor de CSP/cabeceras | `lib/security/headers.ts` | Edge-safe | Genera nonce (Web Crypto), construye la CSP y el set de cabeceras estáticas; allowlist centralizada. |
| CSRF | `lib/security/csrf.ts` | Node (server-only) | Verificación de Origin/Referer + double-submit token para Server Actions/Route Handlers que mutan. |
| Rate limiting | `lib/security/rate-limit.ts` | Edge/Node | Limitadores en memoria para login (IP+cuenta), formularios y buscador. |
| Hashing de contraseñas | `lib/auth/password.ts` | Node (server-only) | argon2id (OWASP), verificación con igualación de timing (anti enumeración). |
| Sesión | `lib/auth/session.ts` | Node (server-only) | Sesión opaca server-side revocable; cookie `HttpOnly+Secure+SameSite=Lax`; store inyectable (Prisma en Fase 3). |

### Límite Edge ↔ Node (regla dura)
- `middleware.ts` corre en **Edge**: solo `lib/security/headers.ts` y `lib/security/rate-limit.ts` (edge-safe) pueden importarse ahí.
- `node:crypto` y `@node-rs/argon2` son **solo Node**: viven en `lib/auth/**` y `lib/security/csrf.ts`, marcados con `import 'server-only'`. **Nunca** importar estos módulos desde Client Components ni desde el middleware.

---

## 2. Content-Security-Policy (estado actual)

CSP **estricta basada en nonce**, construida en `lib/security/headers.ts` y emitida por `middleware.ts`.
Un nonce nuevo por petición se propaga al render mediante la cabecera de petición `x-nonce`.

```
default-src 'self';
script-src 'self' 'nonce-<rnd>' 'strict-dynamic' https://www.googletagmanager.com [+ 'unsafe-eval' SOLO en dev];
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob: https://workcrm.com https://*.tile.openstreetmap.org https://www.googletagmanager.com https://www.google-analytics.com;
font-src 'self' data:;
connect-src 'self' https://www.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com;
frame-src 'none';
frame-ancestors 'none';
base-uri 'self';
form-action 'self';
object-src 'none';
manifest-src 'self';
upgrade-insecure-requests
```

Decisiones de allowlist (alineadas con la app real, no con el stack hipotético):
- **GA4**: `googletagmanager.com` (carga del script) + `google-analytics.com` (envío de beacons).
- **Imágenes**: CDN actual `workcrm.com` (catálogo migrado) + tiles `*.tile.openstreetmap.org` (mapa de contacto). El antiguo Mapbox con token `sk.` queda **eliminado** (hallazgo S2 — sin token secreto en cliente).
- `script-src` **no** lleva `'unsafe-inline'`: todo script inline propio debe llevar el nonce.
- `style-src` mantiene `'unsafe-inline'` (compromiso conocido de Next con estilos inline de `next/font`/componentes). No afecta a la seguridad de scripts.
- `'unsafe-eval'` se añade **solo en desarrollo** (Fast Refresh de Next). Jamás en producción.

### Acción para el orquestador: cablear el nonce en el layout
La CSP por nonce solo es efectiva si **cualquier `<script>`/`<style>` inline propio** (p. ej. el snippet de GA4) lleva el nonce. El nonce se expone vía la cabecera de petición `x-nonce`. El layout (Server Component) debe leerlo y pasarlo a `<Script nonce={...}>`:

```tsx
// app/layout.tsx (lo cablea el orquestador — fichero fuera del alcance de Security)
import { headers } from 'next/headers';

export default async function RootLayout({ children }) {
  const nonce = (await headers()).get('x-nonce') ?? undefined;
  // ...pasar `nonce` a <Script ... nonce={nonce} /> del snippet GA4
}
```

> Mientras GA se cargue con `next/script strategy="afterInteractive"`, Next propaga el nonce automáticamente si está presente en la petición; aun así, pasar `nonce` explícitamente al `<Script>` de GA es la garantía recomendada. Si no hay scripts inline propios, no hay nada más que cablear.

### Despliegue de la CSP (recomendado)
1. Primer despliegue: validar en `Content-Security-Policy-Report-Only` con endpoint de reporte; revisar violaciones reales (Search Console / logs).
2. Tras confirmar 0 violaciones legítimas → modo enforce (estado por defecto del middleware).
3. Endurecer `style-src` (eliminar `'unsafe-inline'`) cuando sea viable.

---

## 3. Cabeceras de seguridad emitidas

| Cabecera | Valor | Hallazgo |
|----------|-------|----------|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | S1 |
| `Content-Security-Policy` | (ver §2) | S4 |
| `X-Content-Type-Options` | `nosniff` | S4 |
| `X-Frame-Options` | `DENY` (refuerzo de `frame-ancestors`) | S4 |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | S4 |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), payment=(), usb=(), …, interest-cohort=()` | S4 |
| `Cross-Origin-Opener-Policy` | `same-origin` | defensa en profundidad |
| `Cross-Origin-Resource-Policy` | `same-origin` | defensa en profundidad |
| `X-Powered-By` | **ausente** (`poweredByHeader: false` en `next.config.mjs`) | S4 |

HSTS `preload`: activar el envío a la lista de preload **solo** tras verificar que todo (incl. subdominios) va por HTTPS.

---

## 4. Reglas de código seguro (obligatorias)

### 4.1 Validación de entrada (todo límite de confianza)
- **Toda** Server Action / Route Handler valida con **Zod `.strict()`** (rechaza campos extra → anti mass-assignment).
- Cantidades: `z.coerce.number().int().positive().max(9999)`. Buscador: `z.string().trim().min(2).max(100)` + paginación obligatoria.
- **Nunca confiar en precios/totales del cliente**: recalcular en servidor desde la BD.
- El texto del usuario es **dato**, nunca se interpola en HTML/SQL/comandos sin escapar/parametrizar.

### 4.2 CSRF (`lib/security/csrf.ts`)
- Mutaciones sensibles (login, registro, cambio de contraseña/email, solicitud de pedido, contacto) llaman a `assertCsrf(formToken)` al inicio.
- `issueCsrfToken()` emite el token; renderizarlo en `<input type="hidden" name="csrf">`.
- Verificación: Origin/Referer same-origin (fail-closed si faltan en una mutación) + double-submit token en tiempo constante.

### 4.3 Rate limiting (`lib/security/rate-limit.ts`)
- Login: `limiters.loginByIp` + `limiters.loginByAccount`. Formularios públicos: `limiters.form`. Buscador: `limiters.search`.
- Combinar con CAPTCHA (Turnstile/reCAPTCHA v3 server-verified) en formularios públicos.
- **Limitación conocida:** store en memoria de proceso → no compartido entre instancias serverless. Para garantías estrictas, sustituir el store por Upstash/Vercel KV **manteniendo la interfaz `limit()`**.

### 4.4 Autenticación (Fase 3 — cimientos listos)
- Contraseñas: `hashPassword` / `verifyPassword` (argon2id, `lib/auth/password.ts`). Política ≥ 12 caracteres (validar con Zod).
- Login: usar `verifyPasswordTimingSafe(user?.passwordHash, password)` aunque el usuario no exista (anti enumeración por timing). Mensajes de error **genéricos**.
- Tras login correcto: `destroySession()` + `createSession(userId)` (anti session fixation).
- Reset de contraseña: token 256-bit, hash en BD, TTL 30 min, un solo uso, respuesta genérica; al completar → `destroyAllSessions(userId)`.

### 4.5 Sesión (`lib/auth/session.ts`)
- Cookie `ng_session`: `HttpOnly`, `Secure` (en prod), `SameSite=Lax`, `path=/`, TTL 8 h.
- Al cliente va el token; en el store se guarda **solo su hash SHA-256** (BD filtrada ⇒ tokens inservibles).
- En Fase 3, implementar `SessionStore` contra la tabla Prisma `Session` e inyectarlo con `setSessionStore()` en el bootstrap. El store por defecto (en memoria) es **solo para desarrollo/tests**.

### 4.6 Autorización (anti-IDOR/BOLA)
- Cada query de recurso de cliente filtra por propietario: `where: { id, userId }`. IDs opacos (cuid/uuid).
- El rol/permiso se lee **siempre** server-side desde sesión/BD; nunca se acepta `role` del cliente.

### 4.7 Secretos
- Solo claves `NEXT_PUBLIC_*` son accesibles en cliente. Cualquier secreto (`DATABASE_URL`, `SESSION_SECRET`, `RESEND_API_KEY`) vive solo en servidor y se valida en `lib/env.ts`.
- Nunca commitear `.env*`. Sin secretos en HTML, JS de cliente, logs ni repo.

### 4.8 Manejo de errores
- `error.tsx` genérico; nunca devolver `error.message`/stack trace/esquema de BD al cliente.
- Logging estructurado server-side; eventos de seguridad (login, reset, pedido) en audit log **sin** datos sensibles ni contraseñas.

---

## 5. Checklist de QA verificable

> Marca cada ítem con evidencia (comando, captura o test). Bloqueante para release.

### Transporte / cabeceras (S1, S4)
- [ ] `http://nunezgil.com` redirige 308 a `https://` (Vercel automático; verificar en self-host).
- [ ] `curl -sI https://nunezgil.com` muestra `Strict-Transport-Security` con `max-age` ≥ 1 año + `includeSubDomains`.
- [ ] `Content-Security-Policy` presente en modo enforce; `script-src` **sin** `'unsafe-inline'` ni `'unsafe-eval'` en producción.
- [ ] Presentes: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`.
- [ ] `frame-ancestors 'none'`: incrustar la home/login en un `<iframe>` externo → **bloqueado**.
- [ ] Sin `X-Powered-By` ni cabeceras que revelen versión.
- [ ] Cada respuesta HTML trae un `nonce` distinto; los scripts inline propios lo incluyen (no hay violaciones en consola).

### Secretos (S2)
- [ ] Ningún token Mapbox `sk.` en el HTML/bundle (el mapa usa tiles OSM sin token). `grep -r "sk\." .next/` → vacío.
- [ ] Ningún secreto en el bundle de cliente: `grep -rE "(SESSION_SECRET|DATABASE_URL|RESEND_API_KEY)" .next/static/` → vacío.
- [ ] Gitleaks en verde en el PR.

### Sesión / cookies (S3)
- [ ] Cookie `ng_session` con `HttpOnly`, `Secure` (prod), `SameSite=Lax`.
- [ ] El valor de la cookie no aparece en texto plano en la BD (se guarda solo el hash).
- [ ] Logout (`destroySession`) y cambio de contraseña (`destroyAllSessions`) invalidan la sesión server-side (reusar la cookie antigua → 401/redirect a login).
- [ ] Tras login se regenera la sesión (la cookie cambia) → sin session fixation.

### Auth (S6)
- [ ] Contraseñas con argon2id; ningún texto plano en BD/logs.
- [ ] Rate-limit en login por IP y por cuenta verificado (11.º intento por IP → bloqueado; 6.º por cuenta → bloqueado).
- [ ] Mensajes de login/reset genéricos (email inexistente vs. contraseña incorrecta → respuesta y timing indistinguibles).
- [ ] Token de reset: un solo uso, TTL 30 min, hasheado en BD.

### CSRF / validación (S6)
- [ ] Mutaciones sensibles llaman a `assertCsrf`: petición cross-origin (Origin distinto) → rechazada.
- [ ] Petición sin Origin ni Referer a una Server Action mutadora → rechazada (fail-closed).
- [ ] Toda Server Action valida con Zod `.strict()`; payload con campo extra → rechazado.
- [ ] Manipular `precio`/`cantidad` en el payload de la solicitud → ignorado/recalculado en servidor.
- [ ] Formulario de contacto: CAPTCHA verificado server-side + consentimiento RGPD obligatorio.

### Autorización
- [ ] IDOR: cliente A no puede leer pedido/dirección de cliente B (probado con IDs reales).
- [ ] Enviar `role`/`isAdmin` en el payload no escala privilegios (rol leído de BD).

### Dependencias / CI
- [ ] Sin jQuery 1.12 / Bootstrap 3 / libs EOL en el bundle (`npm ls` + inspección del build).
- [ ] `npm audit --audit-level=high` sin CRITICAL/HIGH.
- [ ] (Recomendado) Semgrep (`p/owasp-top-ten p/typescript p/nextjs`), Trivy (`fs`, CRITICAL/HIGH) y Gitleaks en verde en cada PR.
- [ ] `npm ci` con lockfile íntegro; versiones pineadas; revisar paquetes nuevos (typosquatting).

### Errores / logs
- [ ] `error.tsx` genérico; ningún stack trace ni esquema de BD en respuestas (probar 500 forzado).
- [ ] Audit log de eventos de seguridad sin datos sensibles (sin contraseñas/tokens).

---

## 6. Pipeline CI recomendado (SAST + SCA + secretos)

```yaml
# .github/workflows/security.yml  (lo añade el orquestador / DevOps)
name: security
on: { pull_request: { branches: [main] } }
jobs:
  sast:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: semgrep/semgrep-action@v1
        with: { config: 'p/owasp-top-ten p/typescript p/nextjs' }
  deps:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm audit --audit-level=high
      - uses: aquasecurity/trivy-action@master
        with: { scan-type: fs, severity: 'CRITICAL,HIGH', exit-code: '1' }
  secrets:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - uses: gitleaks/gitleaks-action@v2
        env: { GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }} }
```

---

## 7. Reporte de vulnerabilidades
Contacto de seguridad: **info@nunezgil.com**. No divulgar públicamente hasta que exista parche.
Prioridad de respuesta: Crítica (RCE/auth bypass/SQLi) inmediata · Alta 72 h · Media próximo sprint.
