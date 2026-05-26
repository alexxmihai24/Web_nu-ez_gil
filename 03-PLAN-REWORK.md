# 03 · Plan de Rework — Núñez Gil (diseño premium + Supabase)

> Documento de diseño aprobado por el cliente (2026-05-26). Fuente de verdad del rework.
> Base previa: `01-INFORME-AUDITORIA.md` y `02-SPEC-IMPLEMENTACION.md` (siguen vigentes).

## Decisiones del cliente (este rework)

| Tema | Decisión |
|---|---|
| **Alcance** | Mantener el *modelo* de datos (entidades + contrato `lib/data/types`). **Rehacer a fondo la capa visual + responsive** hasta nivel premium. |
| **Base de datos** | **Supabase nativo** (`supabase-js`) + **RLS**. Se **retira Prisma**. El dataset actual pasa a ser el *seed*. |
| **Imágenes** | Migrar a **Supabase Storage** re-optimizadas (eliminar dependencia de `workcrm.com`). |
| **Idioma del código** | **Todo en español**: comentarios *y* identificadores (`obtenerProductosPorCategoria`, `TarjetaProducto`, `prioridad`…). |
| **Estilo** | **Industrial premium**: limpio, moderno, mucho blanco, foto grande, azul marca + teal (CTA), microinteracciones sutiles. Objetivo: que el cliente diga "wow". |

## Sistema visual "industrial premium"

- **Color:** azul Núñez Gil = estructura/navegación; **teal SOLO para el CTA** "Añadir a la solicitud" (contraste AA). Grises fríos + blanco dominante.
- **Tipografía:** titulares **Archivo** (700–800, self-host) · cuerpo **Inter**. `tabular-nums` en precios/referencias.
- **Home wow:** hero con **foto real del almacén** + buscador protagonista → franja de confianza (1994 · +10.000 ref · envío gratis 100 €) → **6 universos con FOTO real** (fin de las tarjetas grises vacías) → carruseles Novedades/Ofertas/Outlet → bloque "quiénes somos" → footer institucional con **SVG FEDER/Junta reales**.
- **Microinteracciones:** hover sutil en tarjetas, *skeletons* de carga, `blur placeholder` en imágenes, **CTA sticky en ficha móvil**. Respetar `prefers-reduced-motion`.

## Responsive sin bugs (gate de calidad)

- Mobile-first; breakpoints sm/md/lg/xl. Mega-menú monopanel en desktop → **drawer drill-down** en móvil, operable por teclado.
- **QA visual obligatoria** con Playwright (Edge headless, ya instalado): captura cada página a **390 / 768 / 1280 px** y detecta solapamientos. Ninguna página se da por buena sin verla renderizada en los 3 anchos.

## Datos en Supabase (Fase A — requiere claves del cliente)

- Tablas: `categorias` (3 niveles autorreferenciadas), `marcas`, `productos`, `variantes_producto`, `imagenes_producto` (+ `usuarios`, `pedidos`, `lineas_pedido` para Fase 3).
- **RLS:** lectura pública del catálogo; escritura solo con `service_role`.
- **Storage:** bucket `catalogo` con las fotos re-optimizadas. Migración idempotente por SKU.
- **Capa de acceso** `lib/datos/*` con `supabase-js`, en español, respetando el contrato de tipos.

## Agentes (de `AGECNCIA_IA/agency-agents`)

- **UX Architect** → IA, mega-menú, flujo, accesibilidad responsive.
- **UI Designer** → sistema visual y mockups (si hace falta refinar).
- **Frontend Developer** (+ skill `frontend-design`) → implementación Next/Tailwind en español, mobile-first.
- **Backend Architect** → Supabase: SQL de tablas, RLS, Storage, seed, capa `supabase-js`.
- ❌ **NO** "Senior Developer" del repo (es Laravel/Livewire, no Next.js).

## Bugs detectados hoy a corregir en el rework

1. Tarjetas de "Explora por universo" **grises y vacías** → asignar foto real por universo.
2. Enlaces "ver todo" de Novedades/Ofertas/Outlet (`/novedades`, `/ofertas`, `/outlet`) → **páginas inexistentes** (404 funcional). Crear las páginas o reapuntar.
3. Faltan los **SVG institucionales** del footer (`/public/logos-institucionales/*.svg`).
4. En `dev`, las imágenes remotas tardan y se ve el `alt` ("texto sobre la foto") → se resuelve con Supabase Storage + `next/image` + blur placeholder.

## Orden de ejecución

- **Fase A — Supabase** (al recibir claves): SQL + RLS + Storage + seed + capa `lib/datos` en español.
- **Fase B — Diseño/UI** (en marcha, sin depender de BD): sistema de diseño + **HOME premium** en español → validar estilo con el cliente.
- **Fase C — Páginas**: catálogo → ficha → marcas → buscador, responsive, con QA visual por página.
- **Fase D — Cierre**: accesibilidad AA, rendimiento (LCP < 2,5 s, JS < 120 KB), verificación final en 3 anchos.

## Estado

Plan aprobado. Cliente tiene proyecto Supabase y pasará las claves (Fase A en espera). Fase B arranca ya sobre el dataset estático actual.
