# Cesta de solicitud + Acceso — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Terminar el modelo "cesta de solicitud" B2B: página `/solicitud` con líneas editables y formulario, envío por email (Resend), contador en la cabecera y `/acceso` resuelto — para que el icono de la cesta deje de dar 404.

**Architecture:** La cesta vive en `localStorage['ng:solicitud']` (ya lo escribe `BotonAnadirSolicitud`). La página `/solicitud` es una isla client que lee esas líneas, las enriquece con datos de producto vía `GET /api/solicitudes/resolver`, y envía la solicitud por `POST /api/solicitudes`, que valida y manda un email con Resend (modo simulado si no hay clave). Un contador en la cabecera escucha el evento `ng:solicitud:update` que ya se emite.

**Tech Stack:** Next.js 15 (App Router), React, TypeScript, Tailwind, Supabase (capa `@/lib/data`), Resend (email), Vitest (tests unitarios), playwright-core (e2e).

**Spec:** `docs/superpowers/specs/2026-05-27-cesta-solicitud-design.md`

**Rama:** `feat/cesta-solicitud` (ya creada; la spec está commiteada ahí).

**Nota Windows/PowerShell:** los comandos `npm`/`node` se ejecutan dentro de `web/`. Todo el código y comentarios en español (decisión de cliente).

---

## Estructura de archivos

| Archivo | Responsabilidad | Acción |
|---|---|---|
| `web/lib/solicitud/tipos.ts` | Tipos + constantes compartidas (clave LS, nombre de evento) | Crear |
| `web/lib/solicitud/validar.ts` | Validación pura del payload de solicitud | Crear |
| `web/lib/solicitud/validar.test.ts` | Tests unitarios de la validación | Crear |
| `web/lib/solicitud/email.ts` | Construcción + envío del email (Resend / simulado) | Crear |
| `web/lib/data/supabasedata.ts` | + `obtenerProductosPorSlugs` | Modificar |
| `web/lib/data/index.ts` | + `getProductsBySlugs` (con respaldo) | Modificar |
| `web/lib/data/static-store.ts` | (lectura) base para el respaldo por slugs | Sin cambios |
| `web/app/api/solicitudes/resolver/route.ts` | GET: datos de producto por slugs | Crear |
| `web/app/api/solicitudes/route.ts` | POST: valida + envía email | Crear |
| `web/components/layout/ContadorSolicitud.tsx` | Badge del nº de líneas en la cabecera | Crear |
| `web/components/layout/Cabecera.tsx` | Insertar contador + quitar enlace "Acceder" | Modificar |
| `web/components/solicitud/Cesta.tsx` | Lista de líneas editable (isla client) | Crear |
| `web/components/solicitud/FormularioSolicitud.tsx` | Formulario B2B + envío | Crear |
| `web/app/solicitud/page.tsx` | Página de la cesta (wrapper + metadata) | Crear |
| `web/app/acceso/page.tsx` | "Área de clientes — próximamente" | Crear |
| `web/components/catalog/BotonAnadirSolicitud.tsx` | Importar clave/evento desde `tipos.ts` (DRY) | Modificar |
| `web/vitest.config.ts` | Config de Vitest (resuelve alias `@/`) | Crear |
| `web/package.json` | + deps + script `test` | Modificar |
| `web/screenshots/e2e-solicitud.cjs` | E2E de la cesta (playwright-core, gitignored) | Crear |

---

## Task 1: Dependencias + Vitest

**Files:**
- Modify: `web/package.json`
- Create: `web/vitest.config.ts`
- Create: `web/lib/solicitud/smoke.test.ts` (temporal de verificación)

- [ ] **Step 1: Instalar dependencias**

Run (en `web/`):
```bash
npm install resend
npm install -D vitest vite-tsconfig-paths
```
Expected: se añaden a `package.json`, sin errores.

- [ ] **Step 2: Añadir script de test**

En `web/package.json`, dentro de `"scripts"`, añade:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 3: Crear `web/vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

// Tests unitarios de lógica pura (validación, helpers). Entorno node (sin DOM):
// no probamos componentes React aquí — eso lo cubre el e2e de Playwright.
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    include: ['lib/**/*.test.ts'],
  },
});
```

- [ ] **Step 4: Smoke test**

Crear `web/lib/solicitud/smoke.test.ts`:
```ts
import { describe, it, expect } from 'vitest';

describe('vitest', () => {
  it('funciona', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 5: Ejecutar**

Run (en `web/`): `npm test`
Expected: PASS (1 test). Si falla por resolución de `@/`, revisar que `vite-tsconfig-paths` está instalado y que `tsconfig.json` tiene `paths: { "@/*": ["./*"] }`.

- [ ] **Step 6: Borrar el smoke y commit**

```bash
rm lib/solicitud/smoke.test.ts
git add package.json package-lock.json vitest.config.ts
git commit -m "chore: añadir Resend + Vitest (infra de tests)"
```

---

## Task 2: Tipos y constantes compartidas

**Files:**
- Create: `web/lib/solicitud/tipos.ts`
- Modify: `web/components/catalog/BotonAnadirSolicitud.tsx`

- [ ] **Step 1: Crear `web/lib/solicitud/tipos.ts`**

```ts
/**
 * Contrato compartido de la "cesta de solicitud" (B2B, sin cuentas ni pago).
 * La cesta vive en localStorage del navegador; estas constantes y tipos los usan
 * el botón de añadir, el contador de la cabecera y la página /solicitud.
 */

/** Clave de localStorage donde se persiste la cesta del invitado. */
export const LS_CESTA = 'ng:solicitud';
/** Evento que se emite al cambiar la cesta (lo escucha el contador de la cabecera). */
export const EVENTO_CESTA = 'ng:solicitud:update';

/** Línea tal como se guarda en localStorage (mínima: el resto se resuelve por slug). */
export interface LineaCesta {
  id: string;
  slug: string;
  name: string;
  qty: number;
}

/** Datos de contacto del formulario B2B. */
export interface ContactoSolicitud {
  nombre: string;
  empresa?: string;
  email: string;
  telefono: string;
  cif?: string;
  mensaje?: string;
  consentimiento: boolean;
}

/** Cuerpo que la página envía a POST /api/solicitudes. */
export interface SolicitudPayload {
  lineas: LineaCesta[];
  contacto: ContactoSolicitud;
}
```

- [ ] **Step 2: Reutilizar la constante en el botón (DRY, cambio mínimo)**

En `web/components/catalog/BotonAnadirSolicitud.tsx`:
- Añade el import: `import { LS_CESTA, EVENTO_CESTA, type LineaCesta } from '@/lib/solicitud/tipos';`
- Sustituye `const LS_KEY = 'ng:solicitud';` por usar `LS_CESTA`.
- En `handleAdd`, cambia el tipo local `Array<{ id; slug; name; qty }>` por `LineaCesta[]` y usa `LS_CESTA` en `getItem/setItem` y `EVENTO_CESTA` en el `dispatchEvent`.

Resultado de `handleAdd` (referencia exacta):
```ts
  const handleAdd = () => {
    try {
      const raw = localStorage.getItem(LS_CESTA);
      const lines: LineaCesta[] = raw ? JSON.parse(raw) : [];
      const existing = lines.find((l) => l.id === productId);
      if (existing) existing.qty += quantity;
      else lines.push({ id: productId, slug: productSlug, name, qty: quantity });
      localStorage.setItem(LS_CESTA, JSON.stringify(lines));
      window.dispatchEvent(new CustomEvent(EVENTO_CESTA, { detail: { count: lines.length } }));
    } catch {
      /* localStorage no disponible (modo privado) → no bloquea la UI */
    }
    setState('added');
    window.setTimeout(() => setState('idle'), 2200);
  };
```

- [ ] **Step 3: Verificar tipos y commit**

Run (en `web/`): `npm run typecheck`
Expected: sin errores nuevos.
```bash
git add lib/solicitud/tipos.ts components/catalog/BotonAnadirSolicitud.tsx
git commit -m "feat(solicitud): tipos y constantes compartidas de la cesta"
```

---

## Task 3: Validación de la solicitud (TDD)

**Files:**
- Create: `web/lib/solicitud/validar.test.ts`
- Create: `web/lib/solicitud/validar.ts`

- [ ] **Step 1: Escribir el test (falla)**

Crear `web/lib/solicitud/validar.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { validarSolicitud } from './validar';

const lineaOk = { id: 'p1', slug: 'prod-1', name: 'Producto 1', qty: 2 };
const contactoOk = {
  nombre: 'Ana López',
  email: 'ana@bar.com',
  telefono: '600123123',
  consentimiento: true,
};

describe('validarSolicitud', () => {
  it('acepta un payload válido', () => {
    const r = validarSolicitud({ lineas: [lineaOk], contacto: contactoOk });
    expect(r.ok).toBe(true);
  });

  it('rechaza la cesta vacía', () => {
    const r = validarSolicitud({ lineas: [], contacto: contactoOk });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errores).toContain('La solicitud no tiene productos.');
  });

  it('rechaza email inválido', () => {
    const r = validarSolicitud({ lineas: [lineaOk], contacto: { ...contactoOk, email: 'no-es-email' } });
    expect(r.ok).toBe(false);
  });

  it('rechaza sin consentimiento', () => {
    const r = validarSolicitud({ lineas: [lineaOk], contacto: { ...contactoOk, consentimiento: false } });
    expect(r.ok).toBe(false);
  });

  it('rechaza cantidad fuera de rango y la normaliza al fallar', () => {
    const r = validarSolicitud({ lineas: [{ ...lineaOk, qty: 0 }], contacto: contactoOk });
    expect(r.ok).toBe(false);
  });

  it('rechaza nombre o teléfono vacíos', () => {
    expect(validarSolicitud({ lineas: [lineaOk], contacto: { ...contactoOk, nombre: '' } }).ok).toBe(false);
    expect(validarSolicitud({ lineas: [lineaOk], contacto: { ...contactoOk, telefono: '' } }).ok).toBe(false);
  });
});
```

- [ ] **Step 2: Ejecutar (debe fallar)**

Run: `npm test`
Expected: FAIL — "Cannot find module './validar'" o similar.

- [ ] **Step 3: Implementar `web/lib/solicitud/validar.ts`**

```ts
import type { LineaCesta, SolicitudPayload } from './tipos';

export type ResultadoValidacion =
  | { ok: true; value: SolicitudPayload }
  | { ok: false; errores: string[] };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_LINEAS = 100;
const MAX_QTY = 999;
const MAX_TEXTO = 2000;

/**
 * Valida y normaliza el cuerpo de una solicitud. Pura (sin I/O) → testeable.
 * Reglas: ≥1 línea, qty 1..999, nombre/email/teléfono obligatorios, email con
 * formato, consentimiento marcado. Trunca textos largos para evitar abuso.
 */
export function validarSolicitud(payload: unknown): ResultadoValidacion {
  const errores: string[] = [];
  const p = (payload ?? {}) as Partial<SolicitudPayload>;
  const lineasRaw = Array.isArray(p.lineas) ? p.lineas : [];
  const c = (p.contacto ?? {}) as Partial<SolicitudPayload['contacto']>;

  if (lineasRaw.length === 0) errores.push('La solicitud no tiene productos.');
  if (lineasRaw.length > MAX_LINEAS) errores.push('Demasiados productos en la solicitud.');

  const lineas: LineaCesta[] = [];
  for (const l of lineasRaw) {
    const qty = Number((l as LineaCesta)?.qty);
    const slug = String((l as LineaCesta)?.slug ?? '').trim();
    const id = String((l as LineaCesta)?.id ?? '').trim();
    const name = String((l as LineaCesta)?.name ?? '').trim().slice(0, 300);
    if (!id || !slug || !Number.isFinite(qty) || qty < 1 || qty > MAX_QTY) {
      errores.push('Hay líneas con datos no válidos.');
      break;
    }
    lineas.push({ id, slug, name, qty: Math.floor(qty) });
  }

  const nombre = String(c.nombre ?? '').trim();
  const email = String(c.email ?? '').trim();
  const telefono = String(c.telefono ?? '').trim();
  if (!nombre) errores.push('El nombre es obligatorio.');
  if (!EMAIL_RE.test(email)) errores.push('El email no es válido.');
  if (!telefono) errores.push('El teléfono es obligatorio.');
  if (c.consentimiento !== true) errores.push('Debes aceptar el tratamiento de tus datos.');

  if (errores.length > 0) return { ok: false, errores };

  return {
    ok: true,
    value: {
      lineas,
      contacto: {
        nombre: nombre.slice(0, 200),
        empresa: String(c.empresa ?? '').trim().slice(0, 200) || undefined,
        email: email.slice(0, 200),
        telefono: telefono.slice(0, 50),
        cif: String(c.cif ?? '').trim().slice(0, 50) || undefined,
        mensaje: String(c.mensaje ?? '').trim().slice(0, MAX_TEXTO) || undefined,
        consentimiento: true,
      },
    },
  };
}
```

- [ ] **Step 4: Ejecutar (debe pasar)**

Run: `npm test`
Expected: PASS (todos los casos de `validar.test.ts`).

- [ ] **Step 5: Commit**

```bash
git add lib/solicitud/validar.ts lib/solicitud/validar.test.ts
git commit -m "feat(solicitud): validación pura del payload (TDD)"
```

---

## Task 4: Capa de datos — productos por slugs

**Files:**
- Modify: `web/lib/data/supabasedata.ts`
- Modify: `web/lib/data/index.ts`
- Create: `web/lib/data/por-slugs.test.ts`

- [ ] **Step 1: Implementar en `supabasedata.ts`**

Añade al final de `web/lib/data/supabasedata.ts`:
```ts
/** Lista de productos por un conjunto de slugs (para la cesta de solicitud). */
export async function obtenerProductosPorSlugs(slugs: string[]): Promise<ProductListItem[]> {
  if (slugs.length === 0) return [];
  const { data, error } = await cliente()
    .from('productos')
    .select(SELECT_LISTADO)
    .eq('activo', true)
    .in('slug', slugs);
  if (error) throw error;
  return ((data ?? []) as unknown as FilaListado[]).map(aListItem);
}
```

- [ ] **Step 2: Implementar en `index.ts`**

En `web/lib/data/index.ts`:
- Añade el helper estático (junto a los otros `staticX`):
```ts
function staticProductsBySlugs(slugs: string[]): ProductListItem[] {
  const wanted = new Set(slugs);
  return getStore().listItems.filter((it) => wanted.has(it.slug));
}
```
- Añade la función pública del contrato (junto a las demás):
```ts
export function getProductsBySlugs(slugs: string[]): Promise<ProductListItem[]> {
  return conRespaldo(() => sb.obtenerProductosPorSlugs(slugs), () => staticProductsBySlugs(slugs));
}
```

- [ ] **Step 3: Test (camino estático)**

Crear `web/lib/data/por-slugs.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { getProductsBySlugs } from './index';

describe('getProductsBySlugs', () => {
  it('devuelve [] con lista vacía', async () => {
    expect(await getProductsBySlugs([])).toEqual([]);
  });

  it('devuelve [] para slugs inexistentes', async () => {
    const r = await getProductsBySlugs(['no-existe-xyz-123']);
    expect(Array.isArray(r)).toBe(true);
    expect(r.length).toBe(0);
  });
});
```
Nota: en el entorno de test no hay variables de Supabase → `supabaseConfigurado` es false → usa el dataset estático (sin red).

- [ ] **Step 4: Ejecutar (debe pasar) + typecheck**

Run: `npm test` → PASS.
Run: `npm run typecheck` → sin errores.

- [ ] **Step 5: Commit**

```bash
git add lib/data/supabasedata.ts lib/data/index.ts lib/data/por-slugs.test.ts
git commit -m "feat(data): getProductsBySlugs (Supabase + respaldo estático)"
```

---

## Task 5: Endpoint resolver

**Files:**
- Create: `web/app/api/solicitudes/resolver/route.ts`

- [ ] **Step 1: Implementar la ruta**

```ts
import { NextResponse } from 'next/server';
import { getProductsBySlugs } from '@/lib/data';
import { limiters, clientIpFromHeaders } from '@/lib/security/rate-limit';

/**
 * GET /api/solicitudes/resolver?slugs=a,b,c — datos de producto (foto, referencia,
 * marca, precio) para pintar la cesta. La cesta vive en localStorage y solo guarda
 * id/slug/name/qty; aquí se enriquece. Rate-limit: reutiliza el del buscador (30/min).
 */
const MAX_SLUGS = 100;

export async function GET(request: Request): Promise<Response> {
  const rl = await limiters.search.limit(clientIpFromHeaders(request.headers));
  if (!rl.success) {
    return NextResponse.json({ items: [] }, { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } });
  }

  const { searchParams } = new URL(request.url);
  const slugs = (searchParams.get('slugs') ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, MAX_SLUGS);

  if (slugs.length === 0) return NextResponse.json({ items: [] });

  const items = await getProductsBySlugs(slugs).catch(() => []);
  return NextResponse.json({ items });
}
```

- [ ] **Step 2: Verificar contra el dev server**

Run (en `web/`, dev server arrancado en :3000): 
```bash
curl -s "http://localhost:3000/api/solicitudes/resolver?slugs=copa-vino-vulcania-37-cl-c6" | head -c 400
```
Expected: JSON `{"items":[{"slug":"copa-vino-vulcania-37-cl-c6","name":"Copa de vino Vulcania ...","priceCents":1740,...}]}`.

- [ ] **Step 3: Commit**

```bash
git add app/api/solicitudes/resolver/route.ts
git commit -m "feat(api): resolver de productos por slugs para la cesta"
```

---

## Task 6: Email (Resend) + endpoint POST

**Files:**
- Create: `web/lib/solicitud/email.ts`
- Create: `web/app/api/solicitudes/route.ts`

- [ ] **Step 1: Servicio de email `web/lib/solicitud/email.ts`**

```ts
import type { ProductListItem } from '@/lib/data/types';
import type { SolicitudPayload } from './tipos';

/**
 * Envía la solicitud por email con Resend. Si no hay RESEND_API_KEY, modo SIMULADO:
 * registra el contenido y devuelve { simulado: true } (permite desarrollar sin clave).
 * `productos` son los datos resueltos (para mostrar referencia/precio en el email).
 */
const TO = process.env.SOLICITUDES_EMAIL_TO ?? 'info@nunezgil.com';
const FROM = process.env.SOLICITUDES_EMAIL_FROM ?? 'Núñez Gil <onboarding@resend.dev>';

function eur(cents?: number | null): string {
  return cents == null ? 'Consultar' : (cents / 100).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
}

function construirHtml(p: SolicitudPayload, productos: ProductListItem[]): string {
  const porSlug = new Map(productos.map((x) => [x.slug, x]));
  const filas = p.lineas
    .map((l) => {
      const prod = porSlug.get(l.slug);
      const ref = prod?.reference ?? '—';
      const precio = eur(prod?.priceCents);
      return `<tr><td>${l.qty}×</td><td>${l.name}</td><td>Ref. ${ref}</td><td>${precio}</td></tr>`;
    })
    .join('');
  const { contacto: c } = p;
  return `
    <h2>Nueva solicitud de presupuesto</h2>
    <h3>Productos</h3>
    <table border="1" cellpadding="6" cellspacing="0">${filas}</table>
    <h3>Datos del cliente</h3>
    <ul>
      <li><b>Nombre:</b> ${c.nombre}</li>
      ${c.empresa ? `<li><b>Empresa:</b> ${c.empresa}</li>` : ''}
      <li><b>Email:</b> ${c.email}</li>
      <li><b>Teléfono:</b> ${c.telefono}</li>
      ${c.cif ? `<li><b>CIF/NIF:</b> ${c.cif}</li>` : ''}
      ${c.mensaje ? `<li><b>Mensaje:</b> ${c.mensaje}</li>` : ''}
    </ul>`;
}

export async function enviarSolicitud(
  p: SolicitudPayload,
  productos: ProductListItem[],
): Promise<{ enviado: boolean; simulado: boolean }> {
  const html = construirHtml(p, productos);
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn('[solicitud] RESEND_API_KEY ausente → modo simulado. Email que se enviaría:\n', html);
    return { enviado: false, simulado: true };
  }

  // Import dinámico para no cargar Resend en el bundle si no se usa.
  const { Resend } = await import('resend');
  const resend = new Resend(apiKey);
  await resend.emails.send({
    from: FROM,
    to: TO,
    replyTo: p.contacto.email,
    subject: `Solicitud de presupuesto — ${p.contacto.nombre}`,
    html,
  });
  return { enviado: true, simulado: false };
}
```

- [ ] **Step 2: Endpoint `web/app/api/solicitudes/route.ts`**

```ts
import { NextResponse } from 'next/server';
import { getProductsBySlugs } from '@/lib/data';
import { limiters, clientIpFromHeaders } from '@/lib/security/rate-limit';
import { validarSolicitud } from '@/lib/solicitud/validar';
import { enviarSolicitud } from '@/lib/solicitud/email';

/**
 * POST /api/solicitudes — recibe { lineas, contacto }, valida, resuelve los
 * productos (para el email) y envía la solicitud por email. Rate-limit anti-spam
 * con limiters.form (5/10min por IP). Runtime Node (Resend usa APIs de Node).
 */
export const runtime = 'nodejs';

export async function POST(request: Request): Promise<Response> {
  const rl = await limiters.form.limit(clientIpFromHeaders(request.headers));
  if (!rl.success) {
    return NextResponse.json(
      { ok: false, error: 'Demasiadas solicitudes. Inténtalo en unos minutos.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Cuerpo no válido.' }, { status: 400 });
  }

  const v = validarSolicitud(body);
  if (!v.ok) {
    return NextResponse.json({ ok: false, error: v.errores.join(' ') }, { status: 422 });
  }

  try {
    const productos = await getProductsBySlugs(v.value.lineas.map((l) => l.slug)).catch(() => []);
    const r = await enviarSolicitud(v.value, productos);
    return NextResponse.json({ ok: true, simulado: r.simulado });
  } catch (e) {
    console.error('[solicitud] fallo al enviar:', (e as Error).message);
    return NextResponse.json(
      { ok: false, error: 'No se pudo enviar la solicitud. Inténtalo de nuevo.' },
      { status: 502 },
    );
  }
}
```

- [ ] **Step 3: Verificar contra el dev server (modo simulado)**

Run:
```bash
curl -s -X POST http://localhost:3000/api/solicitudes -H "Content-Type: application/json" \
 -d '{"lineas":[{"id":"p1","slug":"copa-vino-vulcania-37-cl-c6","name":"Copa","qty":2}],"contacto":{"nombre":"Ana","email":"ana@bar.com","telefono":"600","consentimiento":true}}'
```
Expected: `{"ok":true,"simulado":true}` (y en los logs del dev server, el HTML del email).
Comprueba también un payload inválido (sin consentimiento) → `{"ok":false,...}` con status 422.

- [ ] **Step 4: Commit**

```bash
git add lib/solicitud/email.ts app/api/solicitudes/route.ts
git commit -m "feat(api): POST /api/solicitudes con envío Resend (simulado sin clave)"
```

---

## Task 7: Contador en la cabecera

**Files:**
- Create: `web/components/layout/ContadorSolicitud.tsx`
- Modify: `web/components/layout/Cabecera.tsx`

- [ ] **Step 1: Crear `ContadorSolicitud.tsx`**

```tsx
'use client';

import { useEffect, useState } from 'react';
import { LS_CESTA, EVENTO_CESTA, type LineaCesta } from '@/lib/solicitud/tipos';

/** Badge con el nº de líneas en la cesta. Se hidrata desde localStorage y reacciona
 *  al evento ng:solicitud:update y a cambios en otras pestañas (evento storage). */
export function ContadorSolicitud() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const leer = () => {
      try {
        const raw = localStorage.getItem(LS_CESTA);
        const lineas: LineaCesta[] = raw ? JSON.parse(raw) : [];
        setCount(Array.isArray(lineas) ? lineas.length : 0);
      } catch {
        setCount(0);
      }
    };
    leer();
    const onUpdate = () => leer();
    const onStorage = (e: StorageEvent) => { if (e.key === LS_CESTA) leer(); };
    window.addEventListener(EVENTO_CESTA, onUpdate);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(EVENTO_CESTA, onUpdate);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  if (count === 0) return null;
  return (
    <span
      aria-label={`${count} ${count === 1 ? 'producto' : 'productos'} en la solicitud`}
      className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-500 px-1 text-[10px] font-bold leading-none text-white"
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}
```

- [ ] **Step 2: Insertar en `Cabecera.tsx`**

En `web/components/layout/Cabecera.tsx`:
- Añade el import: `import { ContadorSolicitud } from './ContadorSolicitud';`
- Envuelve el enlace de "Solicitud" para anclar el badge. Sustituye el `<Link href="/solicitud" ...>` actual por:
```tsx
            <Link
              href="/solicitud"
              className="relative flex flex-col items-center rounded-md px-2 py-1 text-2xs font-medium text-ink-600 hover:bg-ink-100 hover:text-brand-700"
            >
              <span className="relative">
                <ClipboardList className="h-5 w-5" aria-hidden="true" />
                <ContadorSolicitud />
              </span>
              <span className="hidden sm:inline">Solicitud</span>
            </Link>
```

- [ ] **Step 3: Verificar visualmente (dev server)**

Añade un producto desde una ficha en el navegador y comprueba que aparece el badge sobre el icono "Solicitud". (Se verificará también en el e2e de la Task 10.)

- [ ] **Step 4: Commit**

```bash
git add components/layout/ContadorSolicitud.tsx components/layout/Cabecera.tsx
git commit -m "feat(cesta): contador de la cesta en la cabecera"
```

---

## Task 8: Página /solicitud (cesta + formulario)

**Files:**
- Create: `web/components/solicitud/Cesta.tsx`
- Create: `web/components/solicitud/FormularioSolicitud.tsx`
- Create: `web/app/solicitud/page.tsx`

- [ ] **Step 1: `FormularioSolicitud.tsx`**

```tsx
'use client';

import { useState } from 'react';
import type { ContactoSolicitud, LineaCesta } from '@/lib/solicitud/tipos';

interface Props {
  lineas: LineaCesta[];
  onEnviado: () => void; // limpia la cesta en el padre
}

const VACIO: ContactoSolicitud = {
  nombre: '', empresa: '', email: '', telefono: '', cif: '', mensaje: '', consentimiento: false,
};

/** Formulario B2B de la solicitud. Envía a POST /api/solicitudes. */
export function FormularioSolicitud({ lineas, onEnviado }: Props) {
  const [c, setC] = useState<ContactoSolicitud>(VACIO);
  const [estado, setEstado] = useState<'idle' | 'enviando' | 'ok' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof ContactoSolicitud) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setC((prev) => ({ ...prev, [k]: k === 'consentimiento' ? (e.target as HTMLInputElement).checked : e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (lineas.length === 0) { setError('Tu solicitud está vacía.'); return; }
    setEstado('enviando');
    try {
      const res = await fetch('/api/solicitudes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lineas, contacto: c }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error ?? 'Error al enviar.');
      setEstado('ok');
      onEnviado();
    } catch (err) {
      setEstado('error');
      setError((err as Error).message);
    }
  };

  if (estado === 'ok') {
    return (
      <div role="status" className="rounded-lg border border-success/30 bg-success/5 p-6 text-center">
        <p className="text-lg font-semibold text-ink-900">¡Solicitud enviada!</p>
        <p className="mt-1 text-sm text-ink-600">Núñez Gil te contactará con el presupuesto lo antes posible.</p>
      </div>
    );
  }

  const input = 'h-11 w-full rounded-md border border-ink-300 px-3 text-base outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30';

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <h2 className="text-xl font-bold text-brand-900">Tus datos</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block"><span className="mb-1 block text-sm font-medium">Nombre*</span>
          <input className={input} value={c.nombre} onChange={set('nombre')} required /></label>
        <label className="block"><span className="mb-1 block text-sm font-medium">Empresa</span>
          <input className={input} value={c.empresa} onChange={set('empresa')} /></label>
        <label className="block"><span className="mb-1 block text-sm font-medium">Email*</span>
          <input type="email" className={input} value={c.email} onChange={set('email')} required /></label>
        <label className="block"><span className="mb-1 block text-sm font-medium">Teléfono*</span>
          <input type="tel" className={input} value={c.telefono} onChange={set('telefono')} required /></label>
        <label className="block"><span className="mb-1 block text-sm font-medium">CIF/NIF</span>
          <input className={input} value={c.cif} onChange={set('cif')} /></label>
      </div>
      <label className="block"><span className="mb-1 block text-sm font-medium">Mensaje</span>
        <textarea className="min-h-[96px] w-full rounded-md border border-ink-300 p-3 text-base outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
          value={c.mensaje} onChange={set('mensaje')} /></label>
      <label className="flex items-start gap-2 text-sm text-ink-600">
        <input type="checkbox" checked={c.consentimiento} onChange={set('consentimiento')} required className="mt-1" />
        <span>Acepto que Núñez Gil trate mis datos para responder a esta solicitud (ver <a href="/legal/privacidad" className="underline">privacidad</a>).</span>
      </label>
      {error ? <p role="alert" className="text-sm font-medium text-red-600">{error}</p> : null}
      <button type="submit" disabled={estado === 'enviando' || lineas.length === 0}
        className="h-12 w-full rounded-md bg-accent-500 font-semibold text-white transition-colors hover:bg-accent-600 disabled:opacity-50 sm:w-auto sm:px-8">
        {estado === 'enviando' ? 'Enviando…' : 'Enviar solicitud'}
      </button>
    </form>
  );
}
```

- [ ] **Step 2: `Cesta.tsx`**

```tsx
'use client';

import { useCallback, useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { LS_CESTA, EVENTO_CESTA, type LineaCesta } from '@/lib/solicitud/tipos';
import type { ProductListItem } from '@/lib/data/types';
import { ImagenProducto } from '@/components/ui/ImagenProducto';
import { Precio } from '@/components/ui/Precio';
import { SelectorCantidad } from '@/components/catalog/SelectorCantidad';
import { EstadoVacio } from '@/components/ui/EstadoVacio';
import { FormularioSolicitud } from './FormularioSolicitud';

/** Lee la cesta de localStorage, persiste cambios y re-emite el evento. */
function leerCesta(): LineaCesta[] {
  try {
    const raw = localStorage.getItem(LS_CESTA);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}
function guardarCesta(lineas: LineaCesta[]) {
  try {
    localStorage.setItem(LS_CESTA, JSON.stringify(lineas));
    window.dispatchEvent(new CustomEvent(EVENTO_CESTA, { detail: { count: lineas.length } }));
  } catch { /* modo privado */ }
}

export function Cesta() {
  const [lineas, setLineas] = useState<LineaCesta[]>([]);
  const [productos, setProductos] = useState<Map<string, ProductListItem>>(new Map());
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    setLineas(leerCesta());
    setMontado(true);
  }, []);

  // Enriquecer con datos de producto cuando cambian los slugs.
  useEffect(() => {
    if (lineas.length === 0) { setProductos(new Map()); return; }
    const slugs = lineas.map((l) => l.slug).join(',');
    let cancelado = false;
    fetch(`/api/solicitudes/resolver?slugs=${encodeURIComponent(slugs)}`)
      .then((r) => r.json())
      .then((d: { items: ProductListItem[] }) => {
        if (cancelado) return;
        setProductos(new Map((d.items ?? []).map((p) => [p.slug, p])));
      })
      .catch(() => { /* deja los nombres guardados como respaldo */ });
    return () => { cancelado = true; };
  }, [lineas]);

  const cambiarQty = useCallback((slug: string, qty: number) => {
    setLineas((prev) => {
      const next = prev.map((l) => (l.slug === slug ? { ...l, qty } : l));
      guardarCesta(next);
      return next;
    });
  }, []);

  const quitar = useCallback((slug: string) => {
    setLineas((prev) => {
      const next = prev.filter((l) => l.slug !== slug);
      guardarCesta(next);
      return next;
    });
  }, []);

  const vaciar = useCallback(() => { setLineas([]); guardarCesta([]); }, []);

  if (!montado) return null; // evita parpadeo SSR (la cesta es per-navegador)

  if (lineas.length === 0) {
    return (
      <EstadoVacio
        title="Tu solicitud está vacía"
        description="Añade productos desde el catálogo y pídenos presupuesto sin compromiso."
        action={{ label: 'Ver catálogo', href: '/' }}
      />
    );
  }

  const subtotal = lineas.reduce((acc, l) => acc + (productos.get(l.slug)?.priceCents ?? 0) * l.qty, 0);

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
      <ul className="divide-y divide-ink-200 rounded-lg border border-ink-200 bg-white">
        {lineas.map((l) => {
          const p = productos.get(l.slug);
          return (
            <li key={l.slug} className="flex gap-4 p-4">
              <div className="h-20 w-20 shrink-0">
                <ImagenProducto src={p?.imageUrl ?? null} alt={l.name} sizes="80px" />
              </div>
              <div className="flex flex-1 flex-col">
                <p className="text-sm font-semibold text-ink-900">{p?.name ?? l.name}</p>
                {p?.reference ? <p className="tabular text-xs text-ink-400">Ref. {p.reference}</p> : null}
                <div className="mt-2"><Precio cents={p?.priceCents} oldCents={p?.oldPriceCents} size="sm" /></div>
                <div className="mt-3 flex items-center gap-3">
                  <SelectorCantidad value={l.qty} onChange={(q) => cambiarQty(l.slug, q)} />
                  <button type="button" onClick={() => quitar(l.slug)}
                    aria-label={`Quitar ${l.name}`} className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-red-600">
                    <Trash2 className="h-4 w-4" /> Quitar
                  </button>
                </div>
              </div>
            </li>
          );
        })}
        <li className="flex items-center justify-between p-4 text-sm">
          <button type="button" onClick={vaciar} className="text-ink-500 hover:text-red-600">Vaciar solicitud</button>
          <span className="text-ink-600">Subtotal orientativo (IVA no incl.): <b className="text-ink-900">{(subtotal / 100).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</b></span>
        </li>
      </ul>

      <div className="rounded-lg border border-ink-200 bg-white p-6">
        <FormularioSolicitud lineas={lineas} onEnviado={vaciar} />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: `app/solicitud/page.tsx`**

```tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { Cesta } from '@/components/solicitud/Cesta';

export const metadata: Metadata = {
  title: 'Tu solicitud de presupuesto',
  description: 'Revisa los productos de tu solicitud y pídenos presupuesto sin compromiso.',
  robots: { index: false, follow: true }, // cesta personal, no indexar
  alternates: { canonical: '/solicitud' },
};

export default function PaginaSolicitud() {
  return (
    <div className="bg-ink-50">
      <div className="container-ng py-12 lg:py-16">
        <nav aria-label="Migas de pan" className="mb-6 text-sm text-ink-500">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li><Link href="/" className="hover:text-brand-700">Inicio</Link></li>
            <li aria-hidden="true">/</li>
            <li className="font-medium text-ink-700" aria-current="page">Solicitud</li>
          </ol>
        </nav>
        <h1 className="text-3xl font-extrabold tracking-tight text-brand-900 lg:text-4xl">Tu solicitud de presupuesto</h1>
        <p className="mt-3 max-w-2xl text-ink-700">Revisa los productos, ajusta cantidades y envíanos tus datos. Te responderemos con el presupuesto sin compromiso.</p>
        <div className="mt-10"><Cesta /></div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verificar (dev server)**

Run: `npm run typecheck` → sin errores.
En el navegador: añade un producto → ve a `/solicitud` → debe verse la línea con foto/precio, editar cantidad y quitar funcionando. (Verificación automatizada en Task 10.)

- [ ] **Step 5: Commit**

```bash
git add components/solicitud/ app/solicitud/page.tsx
git commit -m "feat(cesta): página /solicitud con líneas editables y formulario"
```

---

## Task 9: /acceso + quitar enlace "Acceder"

**Files:**
- Modify: `web/components/layout/Cabecera.tsx`
- Create: `web/app/acceso/page.tsx`

- [ ] **Step 1: Quitar el enlace "Acceder"**

En `web/components/layout/Cabecera.tsx`, elimina el bloque `<Link href="/acceso" ...> ... Acceder ... </Link>` (el icono `User`). Si tras quitarlo `User` queda sin usar, elimínalo del import de `lucide-react`.

- [ ] **Step 2: Crear `app/acceso/page.tsx`**

```tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { Boton } from '@/components/ui/Boton';

export const metadata: Metadata = {
  title: 'Área de clientes',
  description: 'El área de clientes de Núñez Gil estará disponible próximamente.',
  alternates: { canonical: '/acceso' },
};

export default function PaginaAcceso() {
  return (
    <div className="bg-ink-50">
      <div className="container-ng flex flex-col items-center py-20 text-center lg:py-28">
        <h1 className="text-3xl font-extrabold tracking-tight text-brand-900 lg:text-4xl">Área de clientes</h1>
        <p className="mt-4 max-w-xl text-lg text-ink-700">
          Estamos preparando el acceso para clientes. Mientras tanto, puedes enviarnos una
          solicitud de presupuesto o contactar directamente con nosotros.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Boton href="/solicitud" variant="primary">Hacer una solicitud</Boton>
          <Boton href="/contacto" variant="secondary">Contactar</Boton>
        </div>
      </div>
    </div>
  );
}
```
Nota: si `Boton` no admite `variant="secondary"`, usa la variante existente equivalente (revisar `components/ui/Boton.tsx`).

- [ ] **Step 3: Verificar**

Run: `npm run typecheck`.
En el navegador: `/acceso` muestra la página (no 404) y la cabecera ya no tiene "Acceder".

- [ ] **Step 4: Commit**

```bash
git add components/layout/Cabecera.tsx app/acceso/page.tsx
git commit -m "feat(acceso): página 'área de clientes' y retirada del enlace Acceder"
```

---

## Task 10: E2E + verificación final

**Files:**
- Create: `web/screenshots/e2e-solicitud.cjs` (carpeta gitignored)

- [ ] **Step 1: Script e2e con playwright-core**

Crear `web/screenshots/e2e-solicitud.cjs`:
```js
/* E2E de la cesta de solicitud contra el dev server local (localhost:3000). */
const { chromium } = require('playwright-core');
const EXE = 'C:\\Users\\Alex\\AppData\\Local\\ms-playwright\\chromium-1224\\chrome-win64\\chrome.exe';
const BASE = 'http://localhost:3000';
const TS = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

(async () => {
  const browser = await chromium.launch({ executablePath: EXE, headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const fails = [];
  try {
    // 1) Sembrar la cesta en localStorage (equivale a pulsar "Añadir").
    await page.goto(BASE + '/', { waitUntil: 'networkidle' });
    await page.evaluate(() => {
      localStorage.setItem('ng:solicitud', JSON.stringify([
        { id: 'p1', slug: 'copa-vino-vulcania-37-cl-c6', name: 'Copa de vino Vulcania', qty: 2 },
      ]));
    });

    // 2) Ir a /solicitud y comprobar que la línea aparece con datos resueltos.
    await page.goto(BASE + '/solicitud', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);
    const tieneLinea = await page.getByText('Vulcania', { exact: false }).count();
    if (tieneLinea === 0) fails.push('La línea de la cesta no aparece en /solicitud');
    const tieneBadge = await page.locator('header').getByText(/^[0-9]+$/).count();
    await page.screenshot({ path: __dirname + '/' + TS + '_e2e_cesta.png', fullPage: true });

    // 3) Rellenar y enviar (modo simulado).
    await page.fill('input[required][type="email"]', 'ana@bar.com');
    await page.locator('input[required]').first().fill('Ana López'); // nombre
    await page.fill('input[type="tel"]', '600123123');
    await page.locator('input[type="checkbox"]').check();
    await page.getByRole('button', { name: /Enviar solicitud/ }).click();
    await page.waitForTimeout(1500);
    const ok = await page.getByText('Solicitud enviada', { exact: false }).count();
    if (ok === 0) fails.push('No apareció la confirmación tras enviar');
    await page.screenshot({ path: __dirname + '/' + TS + '_e2e_enviado.png', fullPage: true });

    // 4) /acceso no da 404.
    await page.goto(BASE + '/acceso', { waitUntil: 'networkidle' });
    const noEncontrada = await page.getByText('Página no encontrada', { exact: false }).count();
    if (noEncontrada > 0) fails.push('/acceso da 404');
  } catch (e) {
    fails.push('Excepción: ' + e.message);
  } finally {
    await browser.close();
  }
  console.log(fails.length === 0 ? 'E2E OK ✅' : 'E2E FALLOS ❌:\n' + fails.join('\n'));
  process.exit(fails.length === 0 ? 0 : 1);
})();
```

- [ ] **Step 2: Ejecutar e2e (con dev server arrancado)**

Run (en `web/`): `node screenshots/e2e-solicitud.cjs`
Expected: `E2E OK ✅`. Si falla, revisar capturas en `web/screenshots/`.

- [ ] **Step 3: Tests unitarios + build verde**

Run (en `web/`):
```bash
npm test
npm run build
```
Expected: tests PASS; build de Next.js sin errores.

- [ ] **Step 4: Commit final + push de la rama**

```bash
git add -A
git commit -m "test(cesta): e2e de la solicitud + verificación de build"
git push -u origin feat/cesta-solicitud
```
(El push despliega un Preview en Vercel para revisar antes de mezclar en main.)

---

## Self-review (cobertura de la spec)

- Página `/solicitud` con líneas editables → Task 8. ✅
- Envío por email (Resend, simulado sin clave) → Task 6. ✅
- Endpoint resolver de productos por slugs → Tasks 4 + 5. ✅
- Contador en la cabecera → Task 7. ✅
- `/acceso` resuelto + sin enlace "Acceder" → Task 9. ✅
- Pruebas (unitarias + e2e) + build → Tasks 3, 4, 10. ✅
- Anti-spam (rate-limit), validación servidor, RGPD → Tasks 3, 6, 8. ✅

## Variables de entorno (configurar en `.env.local` y en Vercel cuando llegue la clave)
- `RESEND_API_KEY` — sin ella, el envío va en modo simulado (la web funciona igual).
- `SOLICITUDES_EMAIL_TO` — destino (por defecto `info@nunezgil.com`).
- `SOLICITUDES_EMAIL_FROM` — remitente (dominio verificado en Resend; por defecto `onboarding@resend.dev` para pruebas).
