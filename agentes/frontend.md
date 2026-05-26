# Especificación de Frontend — nunezgil.com (reconstrucción)

**Agente:** Frontend Developer
**Cliente:** Núñez Gil Mayorista de Hostelería e Industrial, S.L. (Montilla, Córdoba)
**Tipo:** E-commerce / catálogo **B2B** de limpieza industrial y hostelería
**Stack:** **Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS**
**Fase:** Planificación / SPEC accionable (aún no se construye)
**Fecha:** 2026-05-26
**Fuentes:** `01-INFORME-AUDITORIA.md`, `investigacion/data/crawl-report.json`, `investigacion/screenshots/`

> Este documento define EXCLUSIVAMENTE el frontend. La base de datos, modelos y endpoints REST los define el **Backend Architect**; aquí se especifica el **contrato de datos que el front espera consumir** (sección 9) para coordinar, no para imponer el esquema.

---

## 0. Objetivos medibles (Definition of Done del front)

| Métrica | Objetivo | Cómo se mide |
|---|---|---|
| LCP (móvil, 4G) | < 2,5 s | Lighthouse / CrUX / Vercel Speed Insights |
| INP | < 200 ms | Web Vitals real (RUM) |
| CLS | < 0,1 | Lighthouse / RUM |
| Lighthouse Performance | > 90 | CI (Lighthouse CI en PR) |
| Lighthouse Accessibility | > 95 | CI + axe-core |
| Lighthouse SEO | 100 | CI |
| Peso JS inicial (home) | < 120 KB gzip | `@next/bundle-analyzer` |
| Errores en consola (prod) | 0 | E2E + monitor |

**Bugs heredados que el nuevo front DEBE resolver (del informe):**
- P6 — placeholders `data:image/gif` 1×1 que nunca se sustituyen → cards vacías. **Se elimina** usando `next/image` nativo (sin lazysizes).
- P5 — `/marcas` con 205 imágenes / 196 peticiones → se resuelve con lazy-load real + sprites/CDN.
- SEO1-5 — sin H1, sin metadata, sin OG, sin Schema → se cubre con `generateMetadata` + JSON-LD.
- D — imágenes sin `alt`, sin jerarquía de encabezados → reglas de a11y obligatorias (sección 5).

---

## 1. Estructura de rutas (App Router)

URLs **alineadas con las actuales** para conservar SEO y enlaces externos. El sitio actual usa slugs planos para categorías (`/quimica-industrial`), anidados para subcategorías (`/ambientadores-e-insecticidas/insecticidas`) y slug con referencia para producto (`/vaso-refresco-31-cl-spain-quartz-c6-5912`). Reproducimos ese patrón.

```
app/
├── layout.tsx                         # RootLayout (Server) — html lang="es", fuentes, header/footer, JSON-LD Organization+LocalBusiness
├── page.tsx                           # HOME (Server, ISR)
├── globals.css                        # Tailwind + tokens de diseño
├── not-found.tsx                      # 404 con buscador y enlaces a categorías
├── error.tsx                          # Error boundary global (Client)
├── sitemap.ts                         # sitemap dinámico desde API (reemplaza el roto de 2022)
├── robots.ts                          # robots con host https + sitemap
├── manifest.ts                        # PWA manifest (instalable, no offline-first en v1)
│
├── (catalog)/                         # grupo de rutas de catálogo (layout con sidebar de departamentos)
│   ├── layout.tsx                     # Server — sidebar "Departamentos" + breadcrumbs slot
│   ├── [categoria]/
│   │   ├── page.tsx                   # CATEGORÍA (Server, ISR) — /quimica-industrial
│   │   └── [subcategoria]/
│   │       └── page.tsx               # SUBCATEGORÍA / listado de productos (Server, ISR)
│   │
│   └── producto/
│       └── [slug]/
│           └── page.tsx               # FICHA DE PRODUCTO (Server, ISR) — /producto/vaso-refresco-...
│                                      #   (alternativa: mantener slug en raíz vía middleware rewrite, ver nota)
│
├── marcas/
│   ├── page.tsx                       # Índice de marcas (Server, ISR) — grid de logos lazy
│   └── [marca]/page.tsx               # Productos de una marca (Server, ISR) — /marcas/tork
│
├── buscador/
│   └── page.tsx                       # Resultados de búsqueda (Server) ?terminobuscar= + filtros (Client island)
│
├── (account)/                         # grupo Área Clientes (layout protegido)
│   ├── acceso/page.tsx                # Login (Client form) — equivale a /acceso
│   ├── registro/page.tsx             # Alta de cliente B2B (Client form + validación)
│   ├── recuperar/page.tsx            # Reset de contraseña
│   └── cuenta/                        # protegido por middleware (sesión)
│       ├── layout.tsx                 # Tabs de cuenta
│       ├── page.tsx                   # Dashboard (datos fiscales, dirección)
│       ├── pedidos/page.tsx           # Histórico de pedidos
│       ├── pedidos/[id]/page.tsx      # Detalle de pedido / presupuesto
│       └── favoritos/page.tsx         # Listas de compra recurrente (valor B2B)
│
├── carrito/
│   └── page.tsx                       # Carrito / pedido B2B (Client) — equivale a /carrito
├── pedido/
│   ├── confirmar/page.tsx            # Checkout: dirección, forma de pago/cuenta, observaciones
│   └── gracias/page.tsx             # Confirmación de pedido/presupuesto enviado
│
├── quienes-somos/page.tsx            # Server, estático (texto reutilizado del informe)
├── contacto/page.tsx                 # Server shell + formulario (Client) + mapa lazy (sin token secreto)
│
├── noticias/                          # blog / actualidad (sustituye contenido de relleno)
│   ├── page.tsx                       # Listado (Server, ISR)
│   └── [slug]/page.tsx                # Artículo (Server, ISR) + JSON-LD Article
│
├── novedades/page.tsx                 # Listado filtrado (producto.esNovedad)
├── ofertas/page.tsx                   # Listado filtrado (producto.enOferta)
├── outlet/page.tsx                    # Listado filtrado (producto.enOutlet)
│
└── (legal)/                           # páginas legales (layout tipográfico simple)
    ├── como-comprar/page.tsx
    ├── condiciones-de-compra/page.tsx
    ├── condiciones-de-pago/page.tsx
    ├── condiciones-de-envio/page.tsx
    ├── condiciones-de-devolucion/page.tsx
    ├── aviso-legal/page.tsx
    ├── politica-de-privacidad/page.tsx
    └── politica-de-cookies/page.tsx
```

**Notas de rutas:**
- **Producto:** recomiendo prefijo `/producto/[slug]` (evita colisiones de slug con categorías y simplifica el router). Si negocio exige conservar las URLs antiguas sin prefijo (`/vaso-refresco-...`) por SEO, se resuelve con `redirect 301` desde las antiguas a las nuevas en `next.config` o un `redirects.ts` generado desde el sitemap viejo. Decisión a confirmar con cliente/SEO; **por defecto: prefijo + 301 de las antiguas**.
- **Categorías dinámicas:** `[categoria]` y `[subcategoria]` se resuelven contra la API. Se usa `generateStaticParams` para pre-renderizar las ~13 macro y las ~200 subcategorías en build (ISR luego).
- **Búsqueda con autosuggest:** el form actual hace `GET /buscador?terminobuscar=`. Mantenemos el query param `terminobuscar` para compatibilidad; el autosuggest consume un endpoint ligero (sección 9, `GET /api/search/suggest`).
- **Carrito/pedido B2B:** flujo de "pedido/presupuesto" — precios mostrados con la leyenda **"I.V.A. no incluido"** (confirmado en la ficha de producto actual). El carrito puede operar para invitados pero **el envío del pedido exige login** (cliente B2B con datos fiscales).

---

## 2. Arquitectura de componentes (Server vs Client)

Principio: **Server Components por defecto**; Client Components solo en "islas" interactivas. El catálogo (datos, SEO, render) es Server; la interacción (carrito, filtros, formularios, autosuggest) es Client.

```
components/
├── layout/
│   ├── Header.tsx              (Server)  envoltorio; compone los islands
│   │   ├── TopBar.tsx          (Server)  tel + email + accesos
│   │   ├── MegaMenu.tsx        (Server)  estructura del árbol de 13 categorías (datos en server)
│   │   │   └── MegaMenuClient.tsx (Client) apertura/teclado/hover, aria-expanded
│   │   ├── SearchBar.tsx       (Client)  input + autosuggest (debounce, aria-combobox)
│   │   └── CartButton.tsx      (Client)  contador reactivo (lee store del carrito)
│   ├── Footer.tsx              (Server)  AYUDA / LEGAL / datos / logos FEDER-Junta (obligatorio mantener)
│   └── Breadcrumbs.tsx         (Server)  + JSON-LD BreadcrumbList
│
├── catalog/
│   ├── DepartmentSidebar.tsx   (Server)  árbol de departamentos (layout de catálogo)
│   ├── CategoryCard.tsx        (Server)  tarjeta de macro/subcategoría con foto
│   ├── ProductCard.tsx         (Server)  foto, nombre, referencia, marca, precio, badge stock/oferta
│   ├── ProductGrid.tsx         (Server)  grid responsive + paginación
│   ├── FilterPanel.tsx         (Client)  filtros (marca, disponibilidad, precio) → actualiza searchParams
│   ├── Pagination.tsx          (Server)  <Link> a ?page=
│   ├── AddToCartButton.tsx     (Client)  +/- cantidad, "Añadir a pedido"
│   ├── QuantityStepper.tsx     (Client)
│   └── ProductGallery.tsx      (Client)  zoom/lightbox (sustituye fancybox), carga diferida
│
├── home/
│   ├── HeroBanner.tsx          (Server)  propuesta de valor + CTA (corrige "hero sin mensaje")
│   ├── ValueProps.tsx          (Server)  "desde 1994", "+10.000 referencias", "envío gratis"
│   ├── FeaturedCategories.tsx  (Server)
│   └── ProductCarousel.tsx     (Client)  Novedades/Ofertas/Outlet (corrige cards vacías P6)
│
├── account/
│   ├── LoginForm.tsx           (Client)  RHF + Zod
│   ├── RegisterForm.tsx        (Client)  alta B2B (CIF, razón social, dirección fiscal)
│   └── AccountNav.tsx          (Server)
│
├── cart/
│   ├── CartTable.tsx           (Client)  líneas editables
│   ├── CartSummary.tsx         (Client)  subtotal (sin IVA) + aviso envío gratis (>100€ Córdoba / >200€ resto)
│   └── CartDrawer.tsx          (Client)  panel lateral (mini-cart)
│
├── contact/
│   ├── ContactForm.tsx         (Client)  RHF + Zod + reCAPTCHA v3
│   └── StoreMap.tsx            (Client)  mapa lazy (dynamic import, sin token secreto — ver §7)
│
├── ui/                         (mayormente Server, primitivos sin estado)
│   ├── Button.tsx  Badge.tsx  Card.tsx  Container.tsx  Heading.tsx
│   ├── Skeleton.tsx  Spinner.tsx  Tabs.tsx  Accordion.tsx (Client)
│   └── Toast.tsx               (Client)  feedback (sustituye sweetalert)
│
└── seo/
    └── JsonLd.tsx              (Server)  Organization, LocalBusiness, Product, BreadcrumbList, Article
```

**Estado global (mínimo):**
- **Carrito:** `zustand` con persistencia en `localStorage` para invitados; al hacer login se fusiona con el carrito de servidor (mutación API). El carrito es la única pieza con store global; evitamos Redux por sobre-ingeniería para este tamaño.
- **Sesión:** cookie httpOnly gestionada por el backend; el front lee estado de sesión vía Server Component (no expone token a JS). Auth detallada la valida el agente de Seguridad/Backend.
- **Datos de catálogo:** **no** se guardan en estado global — se hacen `fetch` en Server Components con `cache`/`revalidate`.

**Por qué Server-first aquí:** el catálogo es contenido público indexable; renderizarlo en servidor garantiza HTML completo para SEO (corrige el H1/metadata ausentes), reduce JS al cliente (mejora INP/LCP) y permite ISR. Solo lo verdaderamente interactivo (carrito, filtros que cambian URL, formularios) baja al cliente.

---

## 3. Rendimiento / Core Web Vitals

### 3.1 Imágenes (la causa nº1 de la lentitud actual)
- **`next/image` en TODAS las imágenes de contenido.** Genera `srcset` + WebP/AVIF automáticamente y aplica `loading="lazy"` nativo. **Esto elimina por diseño el bug P6** (placeholders 1×1 que no se sustituyen) porque ya no usamos `lazysizes`.
- **LCP image (hero / primera fila de productos):** `priority` + `fetchPriority="high"`, sin lazy.
- **Resto:** `loading="lazy"` (por defecto) + `placeholder="blur"` con `blurDataURL` para evitar CLS.
- **`sizes` correcto por contexto** para no descargar 800×800 en una card de 240px:
  ```tsx
  // ProductCard
  <Image
    src={producto.imagen} alt={producto.nombre}
    width={400} height={400}
    sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 240px"
    placeholder="blur" blurDataURL={producto.blurDataURL}
    className="aspect-square object-contain bg-white"
  />
  ```
- **Reserva de espacio** (width/height o `aspect-ratio`) en todas las imágenes → CLS ~0.
- **`/marcas` (P5):** índice con grid; cada logo es `next/image` lazy con `sizes` pequeño. Como son ~200 logos de marca pequeños, se sirven optimizados y solo se cargan al hacer scroll. Opcional: sprite/`Image` con `unoptimized` para SVGs.

### 3.2 Caché / ISR
- **Catálogo (home, categorías, subcategorías, producto, marcas, noticias):** `export const revalidate = 3600` (1 h) + **on-demand revalidation** (`revalidateTag`/`revalidatePath`) disparada por webhook del backend cuando cambian precios/stock/productos. Así el catálogo es estático-rápido pero nunca obsoleto.
- **Tags por entidad** para invalidación quirúrgica:
  ```ts
  const productos = await fetch(`${API}/categorias/${slug}/productos`, {
    next: { revalidate: 3600, tags: [`categoria:${slug}`, 'catalogo'] }
  });
  ```
- **Carrito, cuenta, checkout:** `dynamic = 'force-dynamic'` / `no-store` (datos por usuario, nunca cacheados).
- **Stock/precio en PDP:** el shell de producto es ISR; el dato volátil de stock se refresca con un pequeño fetch Client si negocio exige tiempo real (configurable). Por defecto ISR + on-demand basta.

### 3.3 Code-splitting / JS
- Server Components → cero JS para el catálogo estático.
- `dynamic(() => import(...), { ssr:false })` para: mapa de contacto, lightbox de galería, drawer del carrito. No entran en el bundle inicial.
- Sin jQuery, sin Bootstrap, sin lazysizes, sin fancybox, sin sweetalert (todas las deps obsoletas del informe S5 desaparecen). Tailwind + utilidades nativas.
- `next/font` con `display: swap` y subsetting (latin) para la tipografía → sin FOUT/FOIT, sin petición a Google Fonts externa.
- `@next/bundle-analyzer` en CI con presupuesto: fallar el build si home JS > 120 KB gzip.

### 3.4 Streaming / Suspense
- `loading.tsx` con skeletons por ruta de catálogo → respuesta percibida inmediata.
- `<Suspense>` alrededor de bloques secundarios (carruseles "también te puede interesar") para no bloquear el LCP.

---

## 4. Accesibilidad (WCAG 2.1 AA)

Reglas **obligatorias** (corrigen D y SEO1 del informe):
- **Un único `<h1>` por página** (hoy hay 0 en casi todas). Mapa de H1:
  - Home → "Núñez Gil — Mayorista de hostelería e industrial" (puede ser visualmente integrado en el hero).
  - Categoría → nombre de la categoría. Producto → nombre del producto (ya existe en PDP).
- **Jerarquía correcta** H1 → H2 → H3 sin saltos; componente `<Heading level={n}>` que fuerza el orden.
- **`alt` en TODA imagen de contenido** (producto: nombre + marca; decorativas: `alt=""`). En `/marcas` hoy 117 de 205 sin alt → cero tolerancia.
- **Navegación por teclado completa:** mega-menú operable con teclado (`aria-expanded`, `Esc` cierra, flechas navegan), foco visible (`:focus-visible`), `Skip to content` al inicio del layout.
- **Buscador autosuggest = `role="combobox"`** con `aria-autocomplete="list"`, `aria-activedescendant`, navegación por flechas y `aria-live` para anunciar nº de resultados.
- **Formularios:** `<label>` asociado a cada campo, `aria-invalid` + `aria-describedby` para errores, mensajes de error anunciados (`role="alert"`).
- **Contraste AA** (≥ 4.5:1 texto normal): revisar el azul marino corporativo sobre blanco; el rojo del banner de cookies actual se rediseña (no intrusivo).
- **`prefers-reduced-motion`:** desactivar animaciones de carruseles/transiciones.
- **Semántica:** `<nav>`, `<main>`, `<header>`, `<footer>`, listas reales para menús.
- **Verificación en CI:** `axe-core`/`@axe-core/playwright` en E2E + Lighthouse a11y > 95.

---

## 5. Migración / reutilización de assets

**Situación actual:** logo y fotos alojados en `workcrm.com/clientesexternos/<hash>/files/...` (ej. `LOGO_NG_CABECERA.jpg` 415×118) y fotos de producto/categoría 800×800 JPG; sliders 1000×400 JPG. Iconos UI (`/img/user01.png`, `cesta.png`, `lupa.png`) → se sustituyen por SVG inline / `lucide-react`.

**Plan de migración (orden de ejecución):**
1. **Inventario:** extraer todas las URLs únicas de imágenes desde `crawl-report.json` (campo `images[].src`) → lista de descarga. (Las URLs ya están en los datos crudos; no hace falta recrawl.)
2. **Descarga masiva** de los assets de `workcrm.com` a un staging local (`/assets-origen/`). Script Node/`fetch` que respeta la estructura de carpetas.
3. **Decisión de alojamiento:**
   - **Assets de marca/estáticos** (logo, iconos institucionales FEDER/Junta, favicon, OG image) → `/public/` versionados en el repo. Son pocos y cambian raramente.
   - **Fotos de producto/categoría (~miles, +10.000 refs)** → **NO** en `/public`. Van a un **bucket/CDN** (Vercel Blob, Cloudflare R2 o S3+CloudFront) y se sirven vía `next/image` con `remotePatterns` apuntando al CDN. El backend almacena la URL canónica del CDN por producto.
   - Configurar `next.config.ts`:
     ```ts
     images: {
       formats: ['image/avif', 'image/webp'],
       remotePatterns: [{ protocol: 'https', hostname: '<cdn-host>' }],
       minimumCacheTTL: 86400,
     }
     ```
4. **Re-optimización en origen** (opcional pero recomendado): convertir los JPG 800×800 a WebP base de alta calidad antes de subir al CDN; `next/image` hará el resto de tamaños/formatos on-demand.
5. **Logo del header:** re-exportar a **SVG** si el cliente tiene el vector; si no, usar el JPG 415×118 a `2x` con fondo transparente PNG. `priority` (aparece above-the-fold).
6. **Logos institucionales (FEDER / Junta de Andalucía / "Andalucía se mueve con Europa"):** **obligatorio mantenerlos** en el footer (condición de la subvención IDEA, 4.948,50 €, 80% FEDER). Van a `/public/logos-institucionales/` como SVG/PNG.
7. **Fallback de imagen faltante:** componente `ProductImage` con `onError` → imagen placeholder de marca (no un 1×1). Cubre productos sin foto en la importación.

---

## 6. Consumo de la API del backend (contrato que el front espera)

> **El esquema de BD y los endpoints los define el Backend Architect.** Aquí se documenta el **contrato de datos** que el front necesita, como input para esa coordinación. Capa de acceso en `lib/api/` (funciones tipadas, una por recurso) usada SOLO desde Server Components / Server Actions.

**Patrón de fetching:**
- **Lectura de catálogo** → `fetch` en Server Components con `next: { revalidate, tags }`. Tipado con TypeScript (tipos en `lib/api/types.ts`, idealmente generados del OpenAPI del backend).
- **Mutaciones** (login, registro, añadir a carrito, enviar pedido, contacto) → **Server Actions** o Route Handlers que hacen proxy al backend; **nunca** se llama al backend con credenciales desde el cliente. La cookie de sesión es `httpOnly` (corrige S3 del informe).
- **Autosuggest** → Route Handler ligero `app/api/search/suggest/route.ts` (edge) que cachea y limita.

**Recursos/contratos esperados (a confirmar con Backend):**

| Front necesita | Método/endpoint esperado | Datos clave |
|---|---|---|
| Árbol de categorías (mega-menú, sidebar) | `GET /categorias` | id, nombre, slug, padreId, imagen |
| Listado por categoría/subcat | `GET /categorias/{slug}/productos?page&filtros` | productos[], total, facets(marcas, disponibilidad) |
| Ficha de producto | `GET /productos/{slug}` | nombre, referencia, marca, descripción, precioSinIva, stock/disponibilidad, categoríaPath, imágenes[] |
| Marcas | `GET /marcas` y `GET /marcas/{slug}/productos` | nombre, slug, logo |
| Búsqueda | `GET /search?q=` y `GET /search/suggest?q=` | resultados ligeros para autosuggest |
| Novedades/Ofertas/Outlet | `GET /productos?flag=novedad|oferta|outlet` | reutiliza flags del catálogo |
| Auth | `POST /auth/login`, `POST /auth/registro`, `POST /auth/logout` | cookie httpOnly de sesión |
| Carrito | `GET/POST/PATCH/DELETE /carrito` | líneas, cantidades, subtotal sin IVA |
| Pedido B2B | `POST /pedidos` | crea pedido/presupuesto a partir del carrito |
| Cuenta | `GET /cuenta`, `GET /cuenta/pedidos` | datos fiscales, histórico |
| Contacto | `POST /contacto` | nombre, email, asunto, mensaje, token reCAPTCHA |
| Noticias | `GET /noticias`, `GET /noticias/{slug}` | título, slug, cuerpo, fecha, imagen |
| Sitemap | `GET /sitemap-data` | URLs de categorías/productos/noticias para `sitemap.ts` |

**Tipo de producto (referencia para el front):**
```ts
// lib/api/types.ts
export interface Producto {
  id: string;
  slug: string;
  nombre: string;
  referencia: string;           // ej. "266-V1S010E66"
  marca: { nombre: string; slug: string } | null;
  precioSinIva: number;         // se muestra con leyenda "I.V.A. no incluido"
  disponibilidad: 'en_stock' | 'bajo_pedido' | 'agotado';
  imagenes: { url: string; alt: string; blurDataURL?: string }[];
  categoriaPath: { nombre: string; slug: string }[]; // para breadcrumb + JSON-LD
  flags: { novedad: boolean; oferta: boolean; outlet: boolean };
}
```

---

## 7. Seguridad del front (coordinada con Seguridad/Backend)

Cubre lo que es responsabilidad del front; la auth/CSRF a fondo las valida Seguridad.
- **Sin secretos en el cliente:** el token **secreto de Mapbox (S2)** debe revocarse y NO usarse. El mapa de contacto usará: (a) un `<iframe>` de OpenStreetMap/Google Maps embed sin token, o (b) Leaflet con tiles OSM públicos, o (c) Mapbox con token **público `pk.`** restringido por dominio en variable de entorno **server-only**, proxied. **Por defecto: iframe OSM** (cero coste, cero token).
- **Cookies de sesión** `httpOnly` + `Secure` + `SameSite=Lax` (las gestiona el backend; el front nunca las lee por JS) → corrige S3.
- **CSP** y cabeceras (`HSTS`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`) en `next.config`/middleware → corrige S4. CSP estricta con `nonce` para inline scripts.
- **HTTPS forzado** (S1) lo da Vercel/host por defecto; añadir `redirects` http→https si self-hosted.
- **reCAPTCHA v3** en contacto y registro (la `site key` es pública; la `secret key` se valida en el server).
- Variables de entorno: `NEXT_PUBLIC_*` SOLO para valores realmente públicos; todo lo demás server-only.

---

## 8. Diseño / UX (mejoras sobre el actual)

- **Hero con propuesta de valor + CTA** (corrige el "hero sin mensaje"): "Mayorista de hostelería e industrial desde 1994 · +10.000 referencias · Envío gratis >100€ Córdoba". CTA: "Ver catálogo" + buscador prominente.
- **Mega-menú** rediseñado: 13 macro-categorías agrupadas visualmente, columnas, accesible por teclado (no recargado).
- **Banner de cookies no intrusivo** (barra inferior discreta, no rojo sobre contenido).
- **ProductCard B2B:** referencia visible, marca, precio sin IVA con leyenda, badge de disponibilidad, "Añadir a pedido". Nunca cards vacías.
- **Listas de compra recurrente / repetir pedido** en el área de cliente (alto valor B2B, diferenciador frente a la web actual).
- **Móvil mobile-first** real (no el responsive apretado de Bootstrap 3).
- **Iconografía social** funcional (corrige "Síguenos en" vacío) — enlaces reales o se omite la sección.

---

## 9. Tooling, testing y CI

- **TypeScript estricto**, ESLint (`next/core-web-vitals`), Prettier.
- **Tailwind CSS** con tokens de marca (azul corporativo, neutros) en `globals.css`.
- **Formularios:** `react-hook-form` + `zod` (validación cliente y servidor compartida).
- **Testing:**
  - Unit/componentes: Vitest + Testing Library (ProductCard, CartSummary, autosuggest).
  - E2E: Playwright (flujos: buscar→ver producto→añadir→login→pedido; contacto; registro).
  - A11y: `@axe-core/playwright` en E2E.
  - Lighthouse CI en cada PR con presupuestos (perf>90, a11y>95, seo=100).
- **Vercel Speed Insights / Web Vitals (RUM)** en producción para vigilar LCP/INP/CLS reales.
- **GA4** (`G-RWL5CKME4Q`) re-integrado vía `@next/third-parties` con consentimiento (Consent Mode), no bloqueante.

---

## 10. Roadmap de implementación (front, por fases)

1. **F1 — Esqueleto:** layout, header/mega-menú, footer (con logos FEDER), tokens Tailwind, `next/image` config, metadata + JSON-LD base, sitemap/robots.
2. **F2 — Catálogo (lectura):** home, categoría, subcategoría, producto, marcas, búsqueda + autosuggest. ISR + tags. (Desbloquea SEO y CWV.)
3. **F3 — Cuenta + carrito:** login/registro, carrito (zustand), checkout/pedido B2B, área cliente con repetir pedido.
4. **F4 — Contenido + extras:** noticias/blog, contacto (mapa OSM, reCAPTCHA), legales, novedades/ofertas/outlet.
5. **F5 — Migración de assets** al CDN + re-optimización + QA.
6. **F6 — Hardening + CI:** CSP/cabeceras, Lighthouse CI, axe, E2E, presupuestos de bundle, RUM.

---

### Resumen de decisiones clave
- **Server Components por defecto + islas Client** (carrito, filtros, formularios, autosuggest, mapa).
- **`next/image` reemplaza lazysizes** → resuelve el bug de placeholders 1×1 y los problemas de `/marcas`.
- **ISR (revalidate 1h) + on-demand revalidation por tags** disparada por webhook del backend.
- **Fotos de producto en CDN** (no en `/public`); logo e institucionales (FEDER/Junta) sí en `/public`.
- **URLs alineadas con las actuales** + 301 desde las antiguas; producto bajo `/producto/[slug]`.
- **Carrito invitado + login obligatorio para enviar pedido**; precios "I.V.A. no incluido".
- **A11y/SEO obligatorios:** un H1 por página, `alt` en todo, mega-menú accesible, metadata + JSON-LD.
- **El backend define BD/endpoints**; aquí queda el contrato de datos esperado (§6) para coordinar.
