# CONTINUAR — Núñez Gil (handoff sesión)

> Cuando Alex diga "continuar": seguir desde aquí, **sin preguntar y sin re-auditar** todo.

## Estado actual (actualizado 2026-05-27)
App Next.js 15 (App Router + TS + Tailwind 3.4) en `web/`. E-commerce B2B (limpieza/hostelería).
Decisiones cliente: **precios públicos** ("I.V.A. no incluido"), **solo solicitud de pedido/presupuesto** (sin pago online), login opcional. **Rework en curso**: diseño **industrial premium**, **Supabase nativo** (`supabase-js` + RLS, Prisma retirado), **código TODO en español**, responsive sin bugs. Ver `03-PLAN-REWORK.md`.

## 🔴 DECISIÓN PENDIENTE — PRIMERO AL RETOMAR
**El cliente quiere la web DINÁMICA, no estática.** Ahora las páginas de catálogo usan **ISR** (`revalidate = 3600`) + `generateStaticParams` → se prerenderizan y los cambios en Supabase tardan ~1h en verse. Hay que pasarlas a **render dinámico** (SSR en cada visita, datos siempre frescos):
- Añadir `export const dynamic = 'force-dynamic'` (o `export const revalidate = 0`) en las páginas de catálogo: `app/page.tsx`, `app/[departamento]/page.tsx`, `app/[departamento]/[subcategoria]/page.tsx`, `app/producto/[slug]/page.tsx`, `app/marcas/page.tsx`, `app/marcas/[marca]/page.tsx`, `app/novedades|ofertas|outlet/page.tsx`. (`buscador` y `api/search` ya son dinámicas.)
- Quitar `revalidate = 3600` de esas páginas. `generateStaticParams` puede quedarse (se ignora con force-dynamic) o quitarse.
- Las legales/quiénes-somos/contacto pueden seguir estáticas (contenido fijo). **Falta confirmar alcance con el cliente**: ¿solo catálogo dinámico (recomendado) o TODO dinámico? Se preguntó y NO llegó a responder.

## 🔧 GIT (IMPORTANTE)
- `Trabajo_nuñez_gil/` tiene **repo git DEDICADO** → `origin = https://github.com/alexxmihai24/Web_nu-ez_gil.git` (rama `main`, pusheado).
- ⚠️ `C:/Users/Alex` ENTERA es OTRO repo (`metalica_arroyo.git`). NO ejecutar git para este proyecto desde fuera de `Trabajo_nuñez_gil`.
- `investigacion/data/crawl-report.json` en `.gitignore` (token Mapbox `sk.` → GitHub lo bloquea). Cliente debería rotar ese token si sigue activo.

## 🟢 SUPABASE (Fase A — HECHA)
- Proyecto del cliente: `https://tropuorwkphtanlrrrnu.supabase.co`. Claves en `web/.env.local` (`NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`). **Gitignored, NO al repo.**
- ⚠️ El **MCP de Supabase de la sesión apunta a una cuenta ANTIGUA** → NO usarlo. Trabajar con las claves del `.env.local` y el SQL Editor del dashboard.
- **El cliente YA ejecutó** `web/supabase/01-esquema.sql` (tablas español + RLS lectura pública) y `web/supabase/02-seed.sql`. Verificado por lectura: **50 categorías · 52 marcas · 34 productos · 34 variantes · 24 imágenes**. La web ya sirve el catálogo desde Supabase (con fallback al dataset estático si fallara).
- Imágenes: aún apuntan al CDN ajeno `workcrm.com`. **Pendiente**: migrarlas a **Supabase Storage** (quitar dependencia).

## Hecho en la sesión 2026-05-27
- **HOME premium** en español (`components/inicio/`: Portada con vitrina, FranjaConfianza, TarjetaUniverso con foto real, BloqueSeccion). Carruseles, bloque confianza.
- **Cimientos diseño**: tokens `z-index` reales (arreglan el solapamiento del menú/buscador que se montaba sobre las tarjetas — causa raíz era `z-megamenu`/`z-modal` inexistentes), Inter (cuerpo) + Archivo (titulares), atmósfera "tinta" + grano.
- **Bugs corregidos**: universos grises → foto real; SVGs institucionales del footer creados; enlaces rotos (`/novedades`-`/ofertas`-`/outlet` creadas; slugs legales del footer corregidos).
- **Migración a Supabase**: `lib/supabase/cliente.ts`, `lib/data/supabasedata.ts` (consultas en español), `lib/data/index.ts` (despacha Supabase→fallback estático). **Prisma retirado** (borrados `lib/db.ts`, `productdb.ts`, `dbavailable.ts`, `prisma/`, deps). `scripts/gen-seed-sql.ts` genera el seed.
- **Consolidación español**: `scripts/codemod-espanol.mjs` renombró ~27 componentes + imports a español (Cabecera, PiePagina, MenuMega, NavegacionMovil, BuscadorSugerencias, TarjetaProducto, RejillaProductos, TarjetaCategoria, MarcoCatalogo, BarraDepartamentos, BarraHerramientas, GaleriaProducto, CajaCompra, BotonAnadirSolicitud, SelectorCantidad, Boton, Contenedor, Titulo, Precio, MigasDePan, EstadoVacio, Paginacion, Esqueleto, ImagenProducto, MarcaNG, Carrusel, universos/UNIVERSOS…). **Excepción**: el componente UI `Badge` se mantiene en inglés (choca con el TIPO de datos `Badge` del contrato). Huérfanos borrados (`home/{Hero,Section,ValueProps}.tsx`).
- **Verificado**: `npm run build` verde. QA visual previa (home + páginas internas) a 390/768/1280: 0 solapamientos, 0 imágenes rotas. Conexión Supabase validada.

## Pendiente ⏳ (orden sugerido)
1. **Render dinámico** (ver sección 🔴 arriba) — confirmar alcance e implementar.
2. **QA visual final** con datos de Supabase (home/categoría/ficha/marcas/buscador a 390/768/1280) — había un `web/.qa/qa.mjs` listo (gitignored). Confirmar 0 bugs + que se ve el catálogo de Supabase.
3. **Migrar imágenes a Supabase Storage** (quitar workcrm.com).
4. **GA4 con nonce** en `layout.tsx` (`NEXT_PUBLIC_GA_ID` en `lib/env.ts`; nonce en `x-nonce`, ver SECURITY.md §2).
5. **Fase 3**: solicitud de pedido (carrito "Solicitud" → email a `info@nunezgil.com`) + Área Clientes (login opcional). Tablas usuarios/pedidos NO creadas aún en Supabase.
6. Accesibilidad AA + rendimiento.

## Notas de proceso
- Los **subagentes en background NO pueden escribir** (no pueden pedir permisos) → ejecutar implementación en el hilo principal o agentes en foreground.
- ⚠️ Alex expresó **descontento con cómo se trabajó la sesión del 26-27 may** (pendiente de concretar qué mejorar). Probables fricciones: demasiadas preguntas, demasiados tokens/tiempo, varias correcciones de rumbo (MCP Supabase antiguo, estáticas vs dinámicas). Al retomar, preguntar 1 vez qué cambiar y ajustar.

## Pendiente del cliente (no bloquear)
Horario Google Business, handles RRSS, geo lat/lng de Montilla, logos oficiales FEDER/Junta (hoy hay placeholders dignos en `public/logos-institucionales/`).
