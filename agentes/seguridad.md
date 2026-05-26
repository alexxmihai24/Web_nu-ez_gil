# Threat Model + Estándar de Código Seguro — nunezgil.com (Next.js)

**Proyecto:** Reconstrucción e-commerce B2B Núñez Gil (Montilla, Córdoba)
**Fase:** Planificación / Spec de seguridad
**Autor:** Security Engineer
**Fecha:** 2026-05-26
**Versión:** 1.0
**Entradas:** `01-INFORME-AUDITORIA.md` (hallazgos S1–S6) · `investigacion/data/crawl-report.json`

> Este documento es el **contrato de seguridad** del build Next.js. Todo lo aquí descrito es obligatorio salvo lo marcado como *opcional*. El equipo de implementación debe tratar cada snippet como referencia copy-paste, adaptando nombres a la estructura final del repo.

---

## 0. Supuestos de stack (a confirmar con el equipo)

Como la spec de implementación aún no está escrita, se asume un stack moderno coherente con el informe. Si cambia, revisar las secciones marcadas con (★).

| Capa | Elección asumida | Alternativa válida |
|------|------------------|--------------------|
| Framework | **Next.js 14/15 App Router** (Server Components + Server Actions) | — |
| Hosting | **Vercel** (Edge + Functions) | Node self-host detrás de Nginx/Caddy |
| Base de datos (★) | **PostgreSQL + Prisma** (ORM con consultas parametrizadas) | Drizzle / Supabase Postgres |
| Auth (★) | Sesiones propias con cookie opaca + tabla `Session`, o **Auth.js (NextAuth) en modo *database session*** | Lucia, Clerk (marketplace Vercel) |
| Hashing | **argon2id** (`@node-rs/argon2`) | bcrypt (cost ≥ 12) si argon2 no es viable |
| Validación | **Zod** en todo límite de confianza | Valibot |
| Rate-limit | **@upstash/ratelimit + Upstash Redis** (o Vercel KV) | Redis propio + token bucket |
| Email transaccional | Proveedor con API server-side (Resend/SES) | — |
| Pagos (★) | **Sin tarjeta en el servidor**: pedido B2B = "solicitar presupuesto" / pago aplazado, o redirect a pasarela PCI (Redsys/Stripe Checkout) | — |

**Decisión de alcance de pago:** el sitio actual es catálogo B2B con "Área Clientes" y carrito, sin evidencia de pago con tarjeta en línea. **Recomendación: NO procesar tarjetas en nuestro servidor.** Si se requiere cobro, usar pasarela hosted (Redsys/Stripe Checkout) para mantener el alcance fuera de PCI-DSS. El modelo de amenazas asume este enfoque.

---

## 1. Threat Model (STRIDE)

### 1.1 Visión del sistema y flujos de datos

```
[Navegador cliente B2B]
        │ HTTPS (TLS 1.3, HSTS)
        ▼
[Vercel Edge / WAF / Rate-limit]
        │
        ▼
[Next.js App Router]
  ├─ Server Components (render catálogo)
  ├─ Server Actions / Route Handlers (login, carrito, contacto, pedido)
  └─ middleware.ts (headers + nonce + auth gating)
        │ Prisma (consultas parametrizadas, conexión TLS)
        ▼
[PostgreSQL]   [Redis rate-limit]   [Email API]   [Mapbox (token PÚBLICO pk.)]
```

**Clasificación de datos:**
- **PII de cliente B2B** (nombre comercial, CIF, persona de contacto, email, teléfono, dirección de envío/facturación) → RGPD/LOPD.
- **Credenciales** (hash de contraseña, tokens de sesión, tokens de reset).
- **Datos comerciales** (historial de pedidos, precios negociados/tarifas por cliente, condiciones).
- **Secretos de servidor** (cadena de conexión DB, claves de email, secreto de sesión, tokens de proveedores).
- **Público** (catálogo, fichas de producto, contenido legal).

### 1.2 Trust boundaries

| Frontera | De | A | Controles obligatorios |
|----------|----|----|------------------------|
| Internet → App | Usuario | Edge/Next | TLS 1.3, HSTS, WAF/rate-limit, CSP por nonce |
| Cliente → Server Action | Browser | Server Action | Validación Zod, CSRF (Origin check + token), auth, autorización por recurso |
| App → DB | Next.js | Postgres | Prisma parametrizado, usuario DB de mínimo privilegio, conexión cifrada |
| App → servicios externos | Next.js | Mapbox/Email/Redis | Solo desde server, secretos en env, allowlist de hosts (anti-SSRF) |
| Build/CI → Repo | Dev/CI | GitHub/Vercel | Secrets scanning, SAST, SCA, sin secretos en cliente |

### 1.3 Análisis STRIDE por componente

| Amenaza | Componente | Escenario de ataque | Severidad | Mitigación |
|---------|------------|---------------------|-----------|------------|
| **S**poofing | Login / Área Clientes | Credential stuffing, robo de cookie de sesión (hereda S1/S3 actuales) | Crítica | Cookie de sesión opaca `HttpOnly+Secure+SameSite=Lax`; sesión server-side revocable; rate-limit por IP+cuenta; 2FA opcional |
| **S**poofing | Reset de contraseña | Enumeración de cuentas, token de reset adivinable/reutilizable | Alta | Token aleatorio 256-bit, hash en DB, TTL 30 min, un solo uso, respuesta genérica (no revela si el email existe) |
| **T**ampering | Carrito / pedido | Manipular `precio`/`cantidad` en el payload del cliente | Alta | **Nunca confiar en precios del cliente**; recalcular en servidor desde DB; Zod con `int().positive()` para cantidades |
| **T**ampering | Server Actions | Replay / petición forjada cross-site (CSRF) | Alta | Origin/Host check en middleware + token CSRF en mutaciones sensibles; `SameSite=Lax` |
| **R**epudiation | Acciones de cuenta/pedido | Cliente niega haber hecho un pedido o cambio | Media | Audit log inmutable (actor, acción, IP, timestamp, recurso) fuera del response |
| **I**nfo Disclosure | Token Mapbox (S2) | Token `sk.` (secreto) servido en HTML → abuso de cuenta | Crítica | Revocar/rotar token (§2.2); usar **solo token público `pk.`** con URL restrictions; nunca `sk.` en cliente |
| **I**nfo Disclosure | Respuestas de error | Stack trace / esquema DB / rutas internas filtradas | Media | `error.tsx` genérico; logging estructurado server-side; nunca devolver `error.message` crudo |
| **I**nfo Disclosure | API/área cliente (IDOR/BOLA) | `/api/pedido/123` accesible por otro cliente | Alta | Autorización por propietario en cada query (`where: { id, userId }`); IDs opacos (cuid/uuid) |
| **D**enial of Service | Login, contacto, buscador | Fuerza bruta, flood de formularios, búsquedas costosas | Alta | Rate-limit (Upstash), reCAPTCHA/Turnstile en contacto, límite de tamaño de payload, paginación obligatoria en buscador |
| **D**oS | SSRF vía URLs externas | Si se procesan URLs/webhooks (mapa, imágenes remotas) | Media | Allowlist de hosts en `next.config` `images.remotePatterns`; no fetch a URLs controladas por usuario |
| **E**levation of Privilege | Área cliente / admin | Manipular rol en cliente, IDOR a funciones admin, mass assignment | Crítica | Rol siempre server-side desde DB/sesión; nunca aceptar `role` del cliente; Zod con `.strict()` (rechaza campos extra); RBAC comprobado en cada acción |
| **E**oP | Upload (si existe: logos, adjuntos) | Subida de ejecutable / SVG con XSS / path traversal | Alta | Validar magic bytes + MIME allowlist, renombrar a UUID, almacenar fuera de webroot (Blob), `Content-Disposition: attachment` |

### 1.4 Superficie de ataque (inventario)

- **Externa:** páginas públicas de catálogo (SSR), formulario de contacto (POST), buscador (GET con `terminobuscar`), login/registro, reset de contraseña, mapa de contacto.
- **Autenticada:** Área Clientes (perfil, direcciones), carrito, creación de pedido/presupuesto, historial.
- **Datos:** consultas Prisma, caché de Next, logs, email saliente.
- **Cadena de suministro:** dependencias npm, scripts de terceros (GA4, reCAPTCHA/Turnstile, Mapbox GL).

---

## 2. Remediación concreta S1–S6

### 2.1 S1 — HTTPS forzado + HSTS

En Vercel el TLS y el redirect 308 HTTP→HTTPS son automáticos; **aun así se fuerza HSTS** y se documenta para self-host.

- HSTS se emite vía cabeceras (§3).
- Self-host (★): redirect 308 en Nginx/Caddy + HSTS. No confiar solo en la app.
- Activar HSTS preload solo tras verificar que **todo** (incl. subdominios) va por HTTPS.

### 2.2 S2 — Revocar/rotar token Mapbox filtrado y mover claves a server-side

**El token `sk.eyJ1IjoiaW5tb3dvcmsi...` es SECRETO y está públicamente expuesto. Asumir comprometido.** Plan de respuesta:

1. **Revocar YA** el token filtrado en el panel de Mapbox de la cuenta `inmowork` (es del proveedor Movatec, contactar para que lo revoque, o crear cuenta Mapbox propia de Núñez Gil).
2. **Rotar**: crear una cuenta/clave Mapbox propia del cliente. Generar **solo un token público `pk.`** con **URL restrictions** (allowlist: `https://nunezgil.com/*`, `https://*.vercel.app/*` para previews).
3. El token público va a `NEXT_PUBLIC_MAPBOX_TOKEN` (es público por diseño; la protección real es la restricción de URL + cuota).
4. **Cualquier clave secreta** (`sk.`, API de email, DB) **nunca** lleva prefijo `NEXT_PUBLIC_` y **nunca** se referencia en componentes cliente.
5. Si solo se necesita un mapa estático, preferir **iframe de OSM/Google Maps Embed** o imagen estática sin token expuesto, eliminando la dependencia.

```bash
# Gestión de secretos en Vercel (vercel env)
vercel env add NEXT_PUBLIC_MAPBOX_TOKEN production   # token pk. con URL restrictions
vercel env add DATABASE_URL production               # secreto server-only
vercel env add AUTH_SECRET production                # 32+ bytes aleatorios
vercel env add EMAIL_API_KEY production
vercel env add UPSTASH_REDIS_REST_TOKEN production
# Nunca commitear .env. Local: .env.local (en .gitignore)
```

```ts
// lib/env.ts — validación de entorno en arranque (falla rápido si falta un secreto)
import { z } from "zod";

const serverEnv = z.object({
  DATABASE_URL: z.string().url(),
  AUTH_SECRET: z.string().min(32),
  EMAIL_API_KEY: z.string().min(1),
  UPSTASH_REDIS_REST_URL: z.string().url(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
});
// Solo claves NEXT_PUBLIC_* pueden leerse en cliente:
const publicEnv = z.object({
  NEXT_PUBLIC_MAPBOX_TOKEN: z.string().startsWith("pk."), // rechaza un sk. por error
});

export const env = serverEnv.parse(process.env);
export const publicConfig = publicEnv.parse({
  NEXT_PUBLIC_MAPBOX_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
});
```

### 2.3 S3 — Cookie de sesión endurecida

Reemplaza `PHPSESSID; path=/` sin flags por una cookie opaca y endurecida. **Sesión server-side** (tabla `Session`) para poder revocar.

```ts
// lib/session.ts
import { cookies } from "next/headers";
import { randomBytes, createHash } from "node:crypto";

const COOKIE = "ng_session";

export async function createSession(userId: string) {
  // Token opaco de 256 bits; en DB se guarda solo el HASH (si se filtra la DB, no sirve)
  const token = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 8); // 8 h

  await prisma.session.create({ data: { userId, tokenHash, expiresAt } });

  (await cookies()).set(COOKIE, token, {
    httpOnly: true,          // no accesible desde JS → mitiga robo por XSS
    secure: true,            // solo HTTPS
    sameSite: "lax",         // anti-CSRF básico; "strict" rompe enlaces externos al área cliente
    path: "/",
    maxAge: 60 * 60 * 8,
    // domain: NO fijar a menos que se necesiten subdominios (evita scope amplio)
  });
}

export async function destroySession() {
  const c = await cookies();
  const token = c.get(COOKIE)?.value;
  if (token) {
    const tokenHash = createHash("sha256").update(token).digest("hex");
    await prisma.session.deleteMany({ where: { tokenHash } }); // revocación real server-side
  }
  c.delete(COOKIE);
}
```
- Regenerar sesión tras login (evita session fixation): destruir cualquier sesión anónima y crear una nueva.
- Invalidar todas las sesiones al cambiar contraseña.

### 2.4 S4 — Cabeceras de seguridad (ver §3 completo)

### 2.5 S5 — Dependencias obsoletas

- **Eliminar jQuery 1.12, Bootstrap 3, bxslider, fancybox, sweetalert legacy.** Next + React + Tailwind/CSS modules cubren UI sin jQuery.
- Mapbox GL solo si aporta; si no, mapa estático/iframe.
- GA4: cargar con `next/script strategy="afterInteractive"` y permitir en CSP.
- reCAPTCHA → considerar **Cloudflare Turnstile** (más privado, sin cookies de seguimiento), o reCAPTCHA v3 server-verified.

### 2.6 S6 — Backend (cubierto en §4 auth, §5 CSRF/validación)

---

## 3. Cabeceras + CSP por nonce + framing

CSP **estricta basada en nonce** requiere nonce por petición (generado en middleware) y `getNonce()` en el layout. El resto de cabeceras estáticas pueden ir en `next.config`, pero la CSP con nonce dinámico se inyecta en el middleware.

```ts
// middleware.ts
import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  const csp = [
    `default-src 'self'`,
    // 'strict-dynamic' permite que los scripts con nonce carguen sus dependencias; ignora allowlists en navegadores modernos
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://www.googletagmanager.com https://challenges.cloudflare.com`,
    `style-src 'self' 'unsafe-inline'`, // Next inyecta estilos inline; si se elimina styled-jsx se puede endurecer con nonce
    `img-src 'self' blob: data: https://workcrm.com https://api.mapbox.com https://www.googletagmanager.com`,
    `font-src 'self'`,
    `connect-src 'self' https://api.mapbox.com https://www.google-analytics.com https://challenges.cloudflare.com`,
    `frame-src https://challenges.cloudflare.com`, // Turnstile/reCAPTCHA
    `frame-ancestors 'none'`,      // anti-clickjacking (reemplaza X-Frame-Options)
    `base-uri 'self'`,
    `form-action 'self'`,
    `object-src 'none'`,
    `upgrade-insecure-requests`,
  ].join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY"); // defensa en profundidad junto a frame-ancestors
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  return response;
}

export const config = {
  // Excluir estáticos para no romper carga de assets
  matcher: [{ source: "/((?!_next/static|_next/image|favicon.ico).*)" }],
};
```

```tsx
// app/layout.tsx — pasar el nonce a los <Script>
import { headers } from "next/headers";
import Script from "next/script";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const nonce = (await headers()).get("x-nonce") ?? "";
  return (
    <html lang="es-ES">
      <body>{children}</body>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-RWL5CKME4Q"
        strategy="afterInteractive"
        nonce={nonce}
      />
    </html>
  );
}
```

```ts
// next.config.ts — cabeceras estáticas adicionales (no CSP con nonce)
const nextConfig = {
  poweredByHeader: false, // elimina X-Powered-By
  images: {
    // Allowlist anti-SSRF para next/image: solo hosts conocidos del catálogo
    remotePatterns: [
      { protocol: "https", hostname: "workcrm.com" },
      { protocol: "https", hostname: "api.mapbox.com" },
    ],
  },
};
export default nextConfig;
```

> **Validación CSP:** desplegar primero en `Content-Security-Policy-Report-Only` con endpoint de reporte, revisar violaciones reales, y solo entonces poner en modo enforce. `'unsafe-inline'` en `style-src` es un compromiso conocido de Next con styled-jsx; eliminarlo cuando sea posible.

---

## 4. Autenticación segura

### 4.1 Hashing de contraseñas (argon2id)

```ts
// lib/password.ts
import { hash, verify } from "@node-rs/argon2";

const OPTS = { memoryCost: 19456, timeCost: 2, parallelism: 1 }; // OWASP argon2id

export const hashPassword = (pw: string) => hash(pw, OPTS);
export const verifyPassword = (digest: string, pw: string) => verify(digest, pw);
```
- Política: mínimo 12 caracteres, comprobar contra lista de contraseñas filtradas (HIBP k-anonymity *opcional*).
- bcrypt cost ≥ 12 como fallback si argon2 no compila en el runtime.

### 4.2 Login con rate-limit / anti-fuerza bruta

```ts
// app/(auth)/actions.ts
"use server";
import { z } from "zod";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";

const ipLimit = new Ratelimit({ redis: Redis.fromEnv(), limiter: Ratelimit.slidingWindow(10, "10 m") });
const acctLimit = new Ratelimit({ redis: Redis.fromEnv(), limiter: Ratelimit.slidingWindow(5, "15 m") });

const LoginSchema = z.object({
  email: z.string().email().max(254).toLowerCase(),
  password: z.string().min(1).max(200),
}).strict();

export async function login(_: unknown, formData: FormData) {
  await assertCsrf();                       // ver §5
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  if (!(await ipLimit.limit(ip)).success) return { error: "Demasiados intentos. Inténtalo más tarde." };

  const parsed = LoginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Datos inválidos." };
  const { email, password } = parsed.data;

  if (!(await acctLimit.limit(`login:${email}`)).success)
    return { error: "Cuenta bloqueada temporalmente." };

  const user = await prisma.user.findUnique({ where: { email } });
  // Verificar SIEMPRE un hash (aunque no exista el usuario) para evitar timing/enumeración
  const ok = await verifyPassword(user?.passwordHash ?? DUMMY_HASH, password);
  if (!user || !ok) {
    auditLog.warn("login_failed", { email, ip }); // no al cliente
    return { error: "Credenciales incorrectas." }; // mensaje genérico
  }
  await destroySession();                   // anti session fixation
  await createSession(user.id);
  auditLog.info("login_ok", { userId: user.id, ip });
  redirect("/area-clientes");
}
```

### 4.3 Reset de contraseña seguro

- Endpoint "olvidé contraseña" responde **siempre genérico** ("Si el email existe, recibirás un enlace") → sin enumeración.
- Token: 32 bytes aleatorios, **hash sha256 en DB**, TTL 30 min, un solo uso, invalidado tras cambio.
- Rate-limit por email e IP. Al completar reset → invalidar todas las sesiones del usuario.

### 4.4 Gestión de sesión

- Sesión opaca server-side (§2.3), revocable, expiración 8 h, renovación deslizante opcional.
- "Cerrar sesión en todos los dispositivos" → `deleteMany({ where: { userId } })`.
- Middleware protege rutas `/area-clientes/*` y mutaciones de pedido comprobando sesión.

### 4.5 2FA (opcional)

- TOTP (RFC 6238) con `otplib`; secreto cifrado en DB; códigos de recuperación de un solo uso (hasheados). Recomendado para cuentas con permisos de gestión.

---

## 5. CSRF en Server Actions + validación de entrada (Zod)

### 5.1 CSRF

Next Server Actions ya incluyen comprobación de Origin contra Host por defecto (mitiga CSRF clásico), reforzado por `SameSite=Lax`. **Defensa en profundidad** para mutaciones sensibles (login, cambio de email/contraseña, pedido): token CSRF de doble envío + verificación de Origin explícita.

```ts
// lib/csrf.ts
import { cookies, headers } from "next/headers";
import { randomBytes, timingSafeEqual } from "node:crypto";

export async function issueCsrfToken() {
  const token = randomBytes(32).toString("base64url");
  (await cookies()).set("ng_csrf", token, { httpOnly: false, secure: true, sameSite: "lax", path: "/" });
  return token; // se renderiza en un <input type="hidden" name="csrf">
}

export async function assertCsrf(formToken?: string) {
  const h = await headers();
  // 1) Verificación de Origin/Host (bloquea peticiones cross-site)
  const origin = h.get("origin");
  const host = h.get("host");
  if (origin && new URL(origin).host !== host) throw new Error("CSRF: origin mismatch");

  // 2) Double-submit token (cuando se pasa el campo del form)
  if (formToken !== undefined) {
    const cookieToken = (await cookies()).get("ng_csrf")?.value ?? "";
    const a = Buffer.from(cookieToken), b = Buffer.from(formToken);
    if (a.length !== b.length || !timingSafeEqual(a, b)) throw new Error("CSRF: token mismatch");
  }
}
```

### 5.2 Validación de entrada en todo límite de confianza

- **Toda** Server Action / Route Handler valida con Zod `.strict()` (rechaza campos extra → anti mass-assignment).
- Recalcular precios/totales en servidor; nunca confiar en `precio` del cliente.
- Buscador (`terminobuscar`): `z.string().trim().min(2).max(100)`, paginación obligatoria.

```ts
// Ejemplo: contacto (reemplaza el POST sin CSRF detectado en /contacto)
"use server";
import { z } from "zod";

const ContactSchema = z.object({
  nombre: z.string().trim().min(2).max(100),
  email: z.string().email().max(254),
  asunto: z.string().trim().min(2).max(150),
  mensaje: z.string().trim().min(5).max(5000),
  condiciones: z.literal("si"), // consentimiento RGPD obligatorio
  turnstileToken: z.string().min(1),
  csrf: z.string().min(1),
}).strict();

export async function enviarContacto(_: unknown, formData: FormData) {
  const parsed = ContactSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Revisa los campos del formulario." };
  await assertCsrf(parsed.data.csrf);
  await verifyTurnstile(parsed.data.turnstileToken); // verificación server-side del captcha
  // Rate-limit por IP. Email vía API server-side; escapar contenido en la plantilla.
  // Texto del usuario se trata como dato, NUNCA se interpola en HTML sin escapar.
  return { ok: true };
}
```

- **Pedido/carrito:** `cantidad: z.coerce.number().int().positive().max(9999)`; el `productId` se valida contra DB; precio y stock se leen de DB, no del cliente.

---

## 6. Gestión de secretos, dependencias (SCA) y CI

### 6.1 Secretos
- Todos en `vercel env` por entorno (production/preview/development). Nunca en el repo.
- `.env.local` en `.gitignore`. Validación en arranque con `lib/env.ts` (§2.2).
- Prefijo `NEXT_PUBLIC_` solo para valores realmente públicos. Regla de lint que prohíbe importar secretos en componentes cliente.
- Rotación documentada: Mapbox (ya, §2.2), `AUTH_SECRET`, claves de email y DB cada 90 días o ante sospecha.

### 6.2 Dependencias
- `npm audit` en CI; `npm ci` con lockfile íntegro; Dependabot/Renovate para parches.
- Pin de versiones; revisar paquetes nuevos (typosquatting). Generar SBOM (`cyclonedx-npm`).

### 6.3 Pipeline CI (GitHub Actions)

```yaml
name: security
on: { pull_request: { branches: [main] } }
jobs:
  sast:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: semgrep/semgrep-action@v1
        with: { config: "p/owasp-top-ten p/javascript p/typescript p/nextjs" }
  deps:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: aquasecurity/trivy-action@master
        with: { scan-type: fs, severity: "CRITICAL,HIGH", exit-code: "1" }
      - run: npm ci && npm audit --audit-level=high
  secrets:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - uses: gitleaks/gitleaks-action@v2
        env: { GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }} }
```

---

## 7. Checklist de seguridad para QA (verificable)

**Transporte / cabeceras (S1, S4)**
- [ ] `http://nunezgil.com` redirige 308 a `https://`.
- [ ] Cabecera `Strict-Transport-Security` presente (max-age ≥ 1 año, includeSubDomains).
- [ ] CSP en modo enforce, sin `unsafe-inline` en `script-src`; scripts con nonce.
- [ ] Presentes: `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`.
- [ ] `frame-ancestors 'none'` + `X-Frame-Options: DENY` (probar embeber login en iframe → bloqueado).
- [ ] Sin `X-Powered-By` ni cabeceras que revelen versión.

**Secretos (S2)**
- [ ] Token Mapbox `sk.` antiguo REVOCADO (confirmado en panel Mapbox).
- [ ] Solo token `pk.` con URL restrictions en el cliente; ningún `sk.` en el bundle (grep del build).
- [ ] Ningún secreto en HTML, JS de cliente, repo ni logs. Gitleaks en verde.

**Sesión / cookies (S3)**
- [ ] Cookie de sesión con `HttpOnly`, `Secure`, `SameSite=Lax`.
- [ ] Logout y "cambiar contraseña" invalidan la sesión server-side.
- [ ] Sesión se regenera tras login (no session fixation).

**Auth (S6)**
- [ ] Contraseñas con argon2id/bcrypt; ningún texto plano en DB/logs.
- [ ] Rate-limit en login (por IP y por cuenta) verificado.
- [ ] Mensajes de login/reset genéricos (sin enumeración de usuarios).
- [ ] Token de reset: un solo uso, TTL 30 min, hasheado en DB.

**CSRF / validación (S6)**
- [ ] Mutaciones sensibles validan Origin + token CSRF.
- [ ] Toda Server Action valida con Zod `.strict()`; payload con campo extra → rechazado.
- [ ] Precio/total recalculados en servidor; manipular precio en el carrito → ignorado.
- [ ] Formulario de contacto: captcha verificado server-side + consentimiento RGPD obligatorio.

**Autorización**
- [ ] IDOR: cliente A no puede leer pedido/dirección de cliente B (probado).
- [ ] Rol no aceptado desde el cliente; escalada de privilegios mediante payload → bloqueada.

**Dependencias / CI**
- [ ] Sin jQuery 1.12 / Bootstrap 3 / libs EOL en el bundle.
- [ ] `npm audit` sin CRITICAL/HIGH; Trivy y Semgrep en verde en el PR.

**Errores / logs**
- [ ] `error.tsx` genérico; ningún stack trace ni esquema DB en respuestas.
- [ ] Audit log de eventos de seguridad (login, reset, pedido) sin datos sensibles.

---

## 8. Resumen de prioridades

| Prioridad | Acción |
|-----------|--------|
| **P0 (ya)** | Revocar token Mapbox `sk.` filtrado (S2) — asumir comprometido. |
| **P0 (build)** | HTTPS+HSTS, cabeceras+CSP nonce, cookie endurecida, hashing argon2id, rate-limit login. |
| **P1** | CSRF + Zod en todas las mutaciones; autorización por propietario (anti-IDOR); recálculo de precios server-side. |
| **P2** | CI (Semgrep/Trivy/Gitleaks), SBOM, reset seguro, eliminar libs EOL. |
| **P3 (opcional)** | 2FA TOTP, HSTS preload, HIBP en registro. |
