# CONTINUAR — Núñez Gil (handoff sesión)

> Cuando Alex diga "continuar": seguir desde aquí, **sin preguntar y sin re-auditar** todo.

## Estado actual (actualizado 2026-05-26 tarde)
App Next.js en `web/` (Next 15 App Router + TS + Tailwind 3.4 con tokens de marca + Archivo).
**Fase 1 y Fase 2 COMPLETAS y verificadas.** Construimos DESDE CERO (sin migración Movatec). Decisiones cliente: **precios públicos** ("I.V.A. no incluido"), **solo solicitud de pedido/presupuesto** (sin pago online, sin PCI), login opcional.

> **OJO:** las sesiones anteriores SÍ ejecutaron Backend y Frontend (sus ficheros ya existen). El handoff antiguo decía "rechazados"; era incorrecto.

### Hecho ✅
- **Fase 1 base:** config, tokens, layout, middleware (CSP nonce vía `x-nonce`), `lib/env.ts`, `lib/data/types.ts` (CONTRATO).
- **SEO:** `lib/seo/**`, `sitemap.ts` (ahora incluye categorías + 52 marcas), `robots.ts`, páginas institucionales y **todas las legales** (privacidad, aviso-legal, condiciones-envio, **cookies**, **como-comprar**).
- **Security:** `middleware.ts`, `lib/security/{headers,csrf,rate-limit}.ts`, `lib/auth/{password,session}.ts`, `SECURITY.md`.
- **Backend (Fase 2):** `prisma/schema.prisma`, `lib/db.ts`, dataset estático real (`lib/data/seeddata.ts`: 13 deptos, 52 marcas, ~35 productos del crawl), `static-store.ts`, `query-utils.ts`, `dbavailable.ts`. **`lib/data/index.ts` ya implementa el contrato** (camino estático + dispatch diferido a `productdb.ts` cuando hay `DATABASE_URL`). `app/api/search/route.ts` (autosuggest con rate-limit). `productdb.ts` con las 7 funciones Prisma (type-checked; sin probar en runtime, falta DB+seed).
- **Frontend (Fase 2):** Header/Footer/MegaMenu reales, todos los `components/**`, HOME definitiva, rutas `[departamento]`, `[departamento]/[subcategoria]`, `producto/[slug]`, `marcas`, `marcas/[marca]`, `buscador`.
- **Build:** `npm run build` OK → **82 páginas** (13 deptos + 52 marcas SSG). Smoke-test prod OK: home con carruseles, departamento hoja con productos, categorías, `/api/search`, página de marca. (Recordar `npx prisma generate` tras clonar.)

### Pendiente ⏳
1. **GA4 con nonce:** `app/layout.tsx` aún NO carga el script de GA4. Añadir `<Script>` GA4 leyendo `headers().get('x-nonce')` (`NEXT_PUBLIC_GA_ID` ya en `lib/env.ts`; ver SECURITY.md §2).
2. **Migración a Postgres (futuro):** `prisma/seed.ts` no existe; el camino DB de `productdb.ts` está implementado pero sin verificar (sin `DATABASE_URL`). Hoy el catálogo corre con el dataset estático.
3. **Fase 3:** solicitud de pedido + Área Clientes (Backend + Frontend + Security).
4. **Fase 4/5:** contenido/SEO local/lanzamiento y QA.

## 🔧 GIT (IMPORTANTE — leer antes de tocar git)
- El proyecto vive en `Trabajo_nuñez_gil/` que tiene **su PROPIO repo git dedicado** con remote `origin = https://github.com/alexxmihai24/Web_nu-ez_gil.git` (rama `main`, pusheado).
- ⚠️ La carpeta de usuario `C:/Users/Alex` ENTERA es OTRO repo git (`origin = metalica_arroyo.git`). NO ejecutar git desde fuera de `Trabajo_nuñez_gil` para este proyecto, ni `add`/`push` en el repo padre.
- `investigacion/data/crawl-report.json` está en `.gitignore` (contiene el token Mapbox `sk.` filtrado → GitHub lo bloquea). El cliente debería **rotar/revocar ese token** en Mapbox si sigue activo.

## ⚡ REWORK EN CURSO (2026-05-26 tarde) — ver `03-PLAN-REWORK.md`
**HOME premium hecha y verificada** (QA visual Edge a 390/768/1280px: 0 solapamientos, 0 imágenes rotas; build verde; commit pusheado). Hecho: cimientos (z-index real que arregla el solapamiento, Inter+Archivo, atmósfera), HOME en español (`components/inicio/*`: Portada, FranjaConfianza, TarjetaUniverso, BloqueSeccion), universos con foto real, páginas `/novedades`-`/ofertas`-`/outlet`, SVGs institucionales, enlaces legales del footer corregidos.
Pendiente: **consolidar español** en el resto de componentes (header/footer/catalog/ui aún en inglés; borrar huérfanos `components/home/{Hero,Section,ValueProps}.tsx`), **Fase C** (catálogo/ficha/marcas/buscador a premium), **Fase A Supabase** (esperando claves del cliente), GA4.
El cliente pidió rework: **diseño industrial premium**, **Supabase nativo (`supabase-js`+RLS, se retira Prisma)**, **código TODO en español** (identificadores incluidos), responsive sin bugs.
- **Fase A (Supabase):** EN ESPERA de que el cliente pase las claves. Preparar SQL tablas+RLS+Storage+seed + capa `lib/datos` en español.
- **Fase B (Diseño/UI):** EN MARCHA sobre el dataset estático actual (sin BD). Agente Frontend rehaciendo sistema de diseño + HOME premium en español, mobile-first, con QA visual a 390/768/1280px. Validar estilo con el cliente antes de seguir.
- **Fase C/D:** catálogo/ficha/marcas/buscador + accesibilidad/rendimiento.
Usar agentes de `AGECNCIA_IA/agency-agents` (UX Architect, UI Designer, Frontend Developer, Backend Architect). NO el "Senior Developer" (Laravel).

## Cómo retomar (orden anterior, ya superado por el rework)
NO relanzar Backend/Frontend con el enfoque viejo. El catálogo Prisma+estático funcionaba, pero se sustituye por Supabase + diseño premium.

## Pendiente del cliente (NO bloquear; usar defaults y seguir)
Horario para Google Business, handles RRSS, geo lat/lng de Montilla. Token Mapbox `sk.` del sitio viejo: el cliente no tiene acceso a Movatec → se ignora (web nueva no lo usa).
