# Spec de Implementación — Nueva nunezgil.com

**Cliente:** Núñez Gil Mayorista de Hostelería e Industrial S.L. (Montilla, Córdoba · CIF B14784235)
**Stack:** Next.js (App Router) + Tailwind + PostgreSQL/Prisma · Hosting Vercel
**Objetivo:** versión moderna, rápida, segura y bien posicionada del e-commerce B2B actual, reutilizando fotos, datos y textos existentes.
**Base:** `01-INFORME-AUDITORIA.md`. **Estado: COMPLETO (6/6 agentes).**

---

## Decisiones confirmadas por el cliente

| Tema | Decisión |
|---|---|
| **Precios** | **Públicos** — visibles para todos sin login, con la nota **"I.V.A. no incluido"**. |
| **Compra** | **Solo solicitud de pedido/presupuesto** — **sin pago online**. El carrito se renombra **"Solicitud"** y el flujo termina en *"Enviar solicitud de pedido"*. |
| **Login / Área Clientes** | **Opcional** (no obligatorio para ver precios ni para solicitar). Sirve como acelerador B2B: histórico y repetición de pedidos. |
| **Implicación de seguridad** | Al no haber pago con tarjeta, **no hay alcance PCI-DSS** ni datos de tarjeta en servidor → menos superficie de riesgo. |

---

## Documentos de referencia (entregables de agentes) — todos ✅

| Área | Documento |
|---|---|
| Frontend (Next.js) | `agentes/frontend.md` |
| Backend / datos / migración | `agentes/backend.md` |
| Seguridad / código seguro | `agentes/seguridad.md` |
| SEO técnico + contenido | `agentes/seo.md` |
| Diseño visual / tokens | `agentes/diseno-ui.md` |
| UX / arquitectura de información | `agentes/ux-arquitectura.md` |

---

## Decisiones de arquitectura

### Frontend
Next.js App Router, Server Components por defecto; islas Client solo para Solicitud (carrito), filtros, autosuggest, formularios y mapa. Rutas alineadas con las actuales + 301 de las antiguas. `next/image` (AVIF/WebP + `srcset`) sustituye a lazysizes → **elimina por diseño el bug de cards vacías** (placeholders 1×1). ISR (revalidate ~1h) + revalidación on-demand por tags; Solicitud/cuenta `no-store`. Objetivos: **LCP < 2,5 s · Lighthouse Perf > 90 / A11y > 95 / SEO 100 · JS inicial < 120 KB**.

### Backend
API propia + PostgreSQL + Prisma dentro de Next (Route Handlers). Árbol de categorías de 3 niveles (Departamento → Categoría → Subcategoría → Producto), Product→Variant(SKU), ~75 marcas (incl. propias NG), flags Novedad/Oferta/Outlet, precios en céntimos **sin IVA** y **públicos**. Búsqueda **Postgres FTS + `pg_trgm`** (fase 1; upgrade a Meilisearch si se requiere tolerancia a typos). **Pedido = solicitud sin pago** (se genera un pedido en estado "solicitado" + email al cliente y a `info@nunezgil.com`; sin pasarela). **Se descartan Redsys/Stripe** por la decisión de "solo solicitud". Infra ~35–55 €/mes (fase 1).

### Seguridad (código seguro)
- **P0 inmediato:** revocar/rotar el **token secreto Mapbox `sk.`** filtrado en el HTML actual (panel inmowork/Movatec); en la web nueva, mapa OSM/embed sin token secreto, o token público `pk.` restringido por dominio. Claves a `vercel env` + validación con `lib/env.ts`.
- HTTPS + **HSTS** forzado; **CSP por nonce** vía `middleware.ts` + cabeceras completas (X-Frame-Options/`frame-ancestors 'none'`, X-Content-Type-Options, Referrer-Policy, Permissions-Policy).
- Cookie de sesión opaca **`HttpOnly+Secure+SameSite`**, sesión server-side revocable.
- Auth Área Clientes: **argon2id**, rate-limit login (IP+cuenta), reset sin enumeración, regeneración anti-fixation.
- **CSRF** (Origin + double-submit) y **Zod `.strict()`** en toda Server Action; validación en todo límite de confianza.
- Fuera **jQuery 1.12 / Bootstrap 3**. CI con **SCA (npm audit/Trivy) + SAST (Semgrep) + secrets scan (Gitleaks)**. Checklist de QA en `agentes/seguridad.md`.

### Diseño (UI) — de `agentes/diseno-ui.md`
Concepto **"almacén profesional, limpio y ordenado"**: confianza por claridad. Color marca **azul Núñez Gil** (navegación) + **acento TEAL** reservado al CTA *"Añadir a la solicitud"* (contraste AA verificado). Tipografía **Inter** self-host, escala modular, `tabular-nums` para precios/referencias. Componentes: **ProductCard con foto `object-contain` + altura fija + precio + "I.V.A. no incluido"** (resuelve las cards rotas), mega-menú sobrio, hero con propuesta de valor + buscador, badges Novedad/Oferta/Outlet, breadcrumbs, footer que **mantiene los logos FEDER/Junta sin recolorear**. Estados hover/focus/activo/disabled/loading con `prefers-reduced-motion`.

### UX / Arquitectura de información — de `agentes/ux-arquitectura.md`
Las 13 macro-categorías se reagrupan en **6 universos** (Limpieza e Higiene · Mesa/Sala · Cocina/Maquinaria · Consumibles · Sanidad · Equipamiento/Automoción), conservando el árbol real de 3 niveles y los slugs (no romper SEO). **Mega-menú monopanel por columnas** en desktop, **drawer drill-down** en móvil, operable por teclado. **Buscador protagonista** en el header (combobox accesible). "Cesta" → **"Solicitud"**. Flujo: buscar → ficha → añadir → *"Enviar solicitud de pedido"* (sin pago, sin login obligatorio, invitado permitido). Mobile-first, CTA sticky en ficha móvil (tap-target 44px). Un H1 por plantilla, skip-link, landmarks, foco visible, alt obligatorio, contraste AA como gate.

### SEO — de `agentes/seo.md`
Matriz de metadatos por plantilla (title ≤60, description ≤155, **un H1**), canonical, OG/Twitter; JSON-LD **Organization + LocalBusiness + Product + BreadcrumbList**; **redirect HTTP→HTTPS+www** que recupera el equity del sitemap 2022; `sitemap.ts` + `robots.ts` dinámicos. Como **los precios son públicos**, el `Product` JSON-LD incluye `offers` con precio y disponibilidad (mejor elegibilidad para rich results). 7 clústeres de keywords + plan editorial de 12 posts/6 meses (sustituye "noticia-ejemplo"). Corregir "Nuñez"→"Núñez".

---

## Plan de migración desde Movatec / workcrm  *(decidido)*

**Vía A (preferente) — Export oficial.** Solicitar a **Movatec** (proveedor actual): export completo del **catálogo** (productos, SKUs, categorías/subcategorías, marcas, precios, stock, descripciones y referencias de imagen) en CSV/Excel o volcado de BD; export de **cuentas de clientes** (sin contraseñas); y acceso a las **imágenes** alojadas en `workcrm.com`. *Texto sugerido para el cliente:* «Solicito una exportación completa de los datos de mi tienda (catálogo, clientes e imágenes) en formato CSV/Excel o copia de base de datos, para migrar a una nueva plataforma de la que soy titular.»

**Vía B (plan B, si Movatec no coopera) — Reconstrucción por scraping del propio sitio** (el cliente es titular del contenido): crawl de las ~200 páginas de categoría/subcategoría + fichas de producto de `nunezgil.com`, extracción de datos estructurados y descarga de imágenes. Reutiliza la infraestructura Playwright ya montada en `investigacion/`.

**ETL común:** carga **idempotente por SKU** a Postgres; **imágenes reoptimizadas a Vercel Blob/R2** (se elimina la dependencia de `workcrm.com`); **clientes** importados sin contraseña → **reset forzado** en el primer acceso.

---

## SEO local / presencia  *(recomendado por defecto — confirmar con cliente)*

- **Google Business Profile:** crear/reclamar ficha — Nombre "Núñez Gil — Mayorista de Hostelería e Industrial", categoría principal *Proveedor de equipos para hostelería* (+ secundaria *Empresa de productos de limpieza*), dirección C/ Pilas de Panchía 2, 14550 Montilla (Córdoba), tel. 957 65 53 88, web y fotos del almacén/exposición.
- **Horario sugerido (a confirmar):** L–V 9:00–14:00 y 17:00–20:00; Sáb 9:00–13:30. *(No inventado como dato real — pendiente de que el cliente lo confirme.)*
- **RRSS (hoy vacías):** recomendado abrir/enlazar **Instagram + Facebook + LinkedIn** (B2B) desde el footer. *(Handles a confirmar.)*
- **NAP** idéntico en web, JSON-LD y directorios.

---

## Roadmap por fases

### Fase 0 — Urgencia (ya)
Revocar/rotar el token Mapbox `sk.` filtrado. Forzar HTTPS+HSTS y endurecer cookies sobre la web actual mientras se reconstruye.

### Fase 1 — Cimientos
Repo Next.js + Tailwind + Prisma; `vercel env` + `lib/env.ts`; `middleware.ts` (CSP+cabeceras); **design tokens** (color teal/azul + Inter, de `diseno-ui.md`); modelo de datos Prisma + migraciones; pipeline de migración (catálogo/fotos/clientes).

### Fase 2 — Catálogo público
**6 universos** de navegación + mega-menú monopanel (de `ux-arquitectura.md`); home, categoría, subcategoría, ficha de producto **con precio**, marcas, buscador con autosuggest; SEO técnico por plantilla (Metadata API + JSON-LD + breadcrumbs); `next/image`.

### Fase 3 — Solicitud y Área Clientes
Solicitud (carrito) → **enviar solicitud de pedido/presupuesto** (sin pago); email al cliente y a `info@nunezgil.com`. Área Clientes opcional (registro/login seguro, histórico, repetición de pedido).

### Fase 4 — Contenido, SEO local y lanzamiento
Blog/noticias real (sustituir placeholders); legales y "Quiénes somos"; `sitemap.ts` + `robots.ts`; **301 desde URLs antiguas**; GBP/NAP/RRSS; conectar GA4 (`G-RWL5CKME4Q`) + Search Console.

### Fase 5 — QA y verificación
Checklist de seguridad (`seguridad.md`), accesibilidad WCAG 2.1 AA, Core Web Vitals, pruebas de migración. Mantener logos/leyenda **FEDER/Junta de Andalucía** (obligatorio por subvención).

---

## Estado final
Spec **100% consolidado** con los 6 entregables. Listo para arrancar la **Fase 0–1** cuando el cliente dé luz verde y facilite el acceso de migración (Movatec o vía B) y confirme horario/RRSS.



