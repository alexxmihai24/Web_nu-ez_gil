# Plan SEO Técnico y de Contenido — nunezgil.com (rebuild Next.js)

**Cliente:** NUÑEZ GIL MAYORISTA DE HOSTELERÍA E INDUSTRIAL, S.L. (CIF B14784235)
**Sector:** e-commerce B2B de limpieza industrial, química profesional, celulosa y hostelería.
**Ubicación:** C/ Pilas de Panchía, 2 — 14550 Montilla (Córdoba), España.
**Stack destino:** Next.js (App Router) + Metadata API.
**Fase:** Planificación / Spec. Este documento es la especificación SEO accionable para el build.
**Fuentes:** `01-INFORME-AUDITORIA.md` (sección 4 = hallazgos SEO) + `investigacion/data/crawl-report.json`.

> **Regla de oro del proyecto:** los datos NAP, los textos "Quiénes somos", las fotos y el catálogo se reutilizan tal cual. El SEO se construye sobre esa base, no se reinventa el contenido.

---

## 0. Diagnóstico de partida (confirmado en el crawl)

| ID | Hallazgo (web actual) | Evidencia en crawl | Plantilla afectada |
|----|----------------------|--------------------|--------------------|
| SEO1 | `<h1>` = 0 en home, quiénes-somos, contacto, categoría, subcategoría, listado, noticias, login, carrito. Solo producto y "marcas" tienen H1 (y el de marcas es "CATÁLOGOS GENERALES", no la marca). | `headingCounts.h1: 0` en 9 de 11 páginas | Todas |
| SEO2 | Sin meta description en home y categorías; genérica ("Quiénes somos", "Contacto") en estáticas. | `metaDescription: null` en home/categoría | Home, categoría |
| SEO3 | `<title>` **vacío** en Marcas y Noticias. | `title: ""` | Marcas, noticias |
| SEO4 | Sin `canonical`, sin Open Graph, sin Twitter Card en **ninguna** página. | `canonical/ogTitle/ogImage: null` (todas) | Todas |
| SEO5 | Sin Schema.org (Organization, Product, BreadcrumbList, LocalBusiness). | Sin JSON-LD detectado | Todas |
| SEO6 | Sitemap de 2022 (xml-sitemaps.com) con URLs `http://`. | Auditoría sec. 4 | Infra |
| SEO7 | Noticias = relleno ("OFERTA DICIEMBRE", "noticia-ejemplo"). | `/noticias` con 3 posts placeholder | Blog |
| SEO8 | Sin contenido editorial real → nula captación orgánica local. | — | Blog |
| Extra | `<title>` con "Nuñez" sin tilde (debe ser "Núñez"); imágenes sin `alt` (117/205 en marcas, 17/26 en contacto); meta description de subcategoría = vómito de nombres de producto concatenados. | `imgWithoutAlt`, `metaDescription` de insecticidas | Varias |

**Activos que YA funcionan y hay que preservar:** URLs limpias semánticas (`/quimica-industrial`, `/ambientadores-e-insecticidas/insecticidas`), `lang="es-ES"`, `charset UTF-8`, viewport correcto, GA4 instalado (`G-RWL5CKME4Q`).

---

## 1. SEO técnico por plantilla (Next.js Metadata API)

### 1.0 Reglas globales (layout raíz + helper compartido)

Crear un helper `lib/seo.ts` con constantes y un `buildMetadata()` que cada plantilla consume. Definir en el `metadataBase`:

```ts
// app/layout.tsx
export const metadata: Metadata = {
  metadataBase: new URL('https://www.nunezgil.com'),
  title: {
    default: 'Núñez Gil | Mayorista de hostelería y limpieza industrial en Córdoba',
    template: '%s | Núñez Gil',
  },
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website', locale: 'es_ES', siteName: 'Núñez Gil',
    images: ['/og/default.jpg'], // 1200×630, generar imagen de marca
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true, 'max-image-preview': 'large' },
  icons: { icon: '/favicon.ico' },
};
```

**Decisiones globales transversales:**
- **Dominio canónico único:** elegir `https://www.nunezgil.com` *o* `https://nunezgil.com` (recomendado **con www** por estabilidad de cookies/CDN) y forzar 301 de la otra variante. Todo `canonical` debe usar ese host exacto.
- **Tildes en marca:** siempre **"Núñez Gil"** (con tilde) en `<title>`, OG y JSON-LD. Corrige SEO actual.
- **`lang="es-ES"`** en `<html>` (ya estaba bien).
- **Un único H1 por página** — regla no negociable; el `<h1>` lo renderiza el componente de cabecera de cada plantilla, nunca el logo ni el slider.
- **Páginas transaccionales/privadas** (`/acceso`, `/carrito`, `/area-clientes`, `/checkout`, resultados de `/buscador`): `robots: { index: false, follow: true }`. No aportan a orgánico y diluyen crawl budget.
- **Open Graph image por defecto** de marca (logo + claim "Desde 1994 · +10.000 referencias"); las plantillas de producto/categoría/blog la sobreescriben con su imagen real.

### 1.1 Matriz de metadatos por plantilla

| Plantilla | Ruta Next | Patrón `<title>` (≤60 car.) | Meta description (≤155 car.) | H1 (único) | Canonical | OG type | Index |
|-----------|-----------|------------------------------|-------------------------------|-----------|-----------|---------|-------|
| **Home** | `/` | `Núñez Gil \| Mayorista de hostelería y limpieza industrial en Córdoba` | "Mayorista B2B en Montilla (Córdoba) desde 1994: química industrial, celulosa, menaje y maquinaria de hostelería. +10.000 referencias y envío en 24-48 h." | `Mayorista de hostelería y productos de limpieza industrial en Córdoba` | `/` | website | ✅ |
| **Categoría** (N1) | `/[categoria]` | `{Categoría} para hostelería y limpieza profesional` | "{Categoría} al por mayor para hostelería e industria. {N} subcategorías de marcas profesionales. Pide presupuesto en Núñez Gil (Córdoba)." | `{Categoría}` (p.ej. "Química industrial") | `/[categoria]` | website | ✅ |
| **Subcategoría** (N2/N3) | `/[categoria]/[sub]` | `{Subcategoría} \| {Categoría}` | "Catálogo de {subcategoría} para profesionales: {3-4 marcas/tipos}. Precios mayoristas y stock. Envío a Córdoba y península." | `{Subcategoría}` | `/[categoria]/[sub]` | ✅ (si ≥1 producto; si vacía → `noindex`) |
| **Producto** | `/[...slug]-{id}` | `{Nombre producto} \| {Marca}` | "{Nombre}. {Formato/capacidad}. Marca {marca}, ref. {ref}. Compra al por mayor en Núñez Gil. {Disponibilidad}." | `{Nombre producto}` | `/{slug-id}` | ✅ (si activo; descatalogado → 301 a categoría) |
| **Marca** (detalle) | `/marcas/[marca]` | `Productos {Marca} para hostelería \| Distribuidor oficial` | "Distribuidor de {Marca} en Córdoba. Catálogo completo de {tipo de producto} {Marca} a precio mayorista en Núñez Gil." | `{Marca}` | `/marcas/[marca]` | ✅ |
| **Listado marcas** | `/marcas` | `Marcas que distribuimos \| Núñez Gil` (corrige `<title>` vacío SEO3) | "Trabajamos con +70 marcas profesionales: Quimxel, Tork, P&G, Jofel, García de Pou, Stölzle y más. Catálogo mayorista en Córdoba." | `Marcas que distribuimos` | `/marcas` | ✅ |
| **Quiénes somos** | `/quienes-somos` | `Quiénes somos \| Mayorista de hostelería desde 1994` | "Núñez Gil: mayorista de hostelería e industrial en Montilla (Córdoba) desde 1994. 1.500 m² de instalaciones y +10.000 referencias." | `Quiénes somos` | `/quienes-somos` | ✅ |
| **Contacto** | `/contacto` | `Contacto \| Núñez Gil (Montilla, Córdoba)` | "Contacta con Núñez Gil: C/ Pilas de Panchía 2, Montilla (Córdoba). Tel. 957 65 53 88. Atención a hostelería e industria en toda Andalucía." | `Contacto` | `/contacto` | ✅ |
| **Blog/Noticias (índice)** | `/blog` (ver §5) | `Blog de limpieza profesional y hostelería \| Núñez Gil` | "Guías y consejos de limpieza industrial, química profesional e higiene en hostelería. El blog del mayorista Núñez Gil en Córdoba." | `Blog` | `/blog` | ✅ |
| **Post de blog** | `/blog/[slug]` | `{Título del post}` (sufijo automático " \| Núñez Gil") | (extracto manual del post, 140-155 car., con keyword) | `{Título del post}` | `/blog/[slug]` | ✅ (Article) |
| **Legales** | `/aviso-legal`, `/politica-privacidad`, `/politica-cookies`, `/como-comprar`, `/condiciones-*` | `{Título legal} \| Núñez Gil` | (resumen breve de la página) | `{Título legal}` | self | ✅ pero baja prioridad |
| **Login / Carrito / Checkout / Búsqueda** | `/acceso`, `/carrito`, `/checkout`, `/buscador` | `{Acción} \| Núñez Gil` | — | `{Acción}` | self | ❌ `noindex,follow` |

**Notas de implementación de metadatos:**
- Usar `generateMetadata()` async en categoría, subcategoría, producto, marca y post (datos dinámicos del CMS/DB).
- Truncar meta descriptions a ~155 caracteres y `<title>` a ~60 en el helper (evitar cortes feos en SERP).
- **No** reproducir el error actual de meta description de subcategoría (concatenar nombres de producto). Generar descripción real o plantilla con marcas/tipos.
- Añadir `og:image` específico: producto → foto 800×800 del producto; categoría/marca → imagen representativa; blog → imagen destacada del post.

### 1.2 alt de imágenes (cierra hallazgo accesibilidad/SEO)
- Producto: `alt="{Nombre producto} - {Marca}"`.
- Categoría/marca: `alt="{Nombre categoría/marca}"`.
- Logos institucionales (Junta, UE/FEDER): `alt` descriptivo obligatorio (estaban vacíos).
- Logo de cabecera: `alt="Núñez Gil - Mayorista de hostelería e industrial"` (sirve como ancla de marca).
- Usar `next/image` con `width/height` reales para evitar CLS; formato WebP/AVIF (resuelve P4 de rendimiento).

---

## 2. Schema.org / JSON-LD

Implementar con componentes `<JsonLd data={...} />` que inyecten `<script type="application/ld+json">`. Validar con Rich Results Test antes de publicar.

### 2.1 Organization + LocalBusiness (en layout raíz, en todas las páginas)
Usar `@graph` para enlazar entidades (Organization, WebSite, LocalBusiness comparten `@id`).

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.nunezgil.com/#organization",
      "name": "Núñez Gil Mayorista de Hostelería e Industrial, S.L.",
      "legalName": "NUÑEZ GIL MAYORISTA DE HOSTELERÍA E INDUSTRIAL, S.L.",
      "url": "https://www.nunezgil.com",
      "logo": "https://www.nunezgil.com/logo.png",
      "vatID": "ESB14784235",
      "foundingDate": "1994",
      "sameAs": ["<URL Google Business Profile>", "<perfiles sociales reales>"]
    },
    {
      "@type": "LocalBusiness",
      "@id": "https://www.nunezgil.com/#localbusiness",
      "name": "Núñez Gil",
      "image": "https://www.nunezgil.com/og/default.jpg",
      "telephone": "+34957655388",
      "email": "info@nunezgil.com",
      "priceRange": "€€",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "C/ Pilas de Panchía, 2",
        "addressLocality": "Montilla",
        "addressRegion": "Córdoba",
        "postalCode": "14550",
        "addressCountry": "ES"
      },
      "geo": { "@type": "GeoCoordinates", "latitude": "<lat>", "longitude": "<lng>" },
      "areaServed": ["Córdoba", "Andalucía", "España"],
      "openingHoursSpecification": [
        { "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"],
          "opens": "<HH:MM>", "closes": "<HH:MM>" }
      ]
    },
    { "@type": "WebSite", "@id": "https://www.nunezgil.com/#website",
      "url": "https://www.nunezgil.com", "publisher": {"@id": "https://www.nunezgil.com/#organization"},
      "potentialAction": { "@type": "SearchAction",
        "target": "https://www.nunezgil.com/buscador?terminobuscar={query}",
        "query-input": "required name=query" } }
  ]
}
```
> **Pendientes de dato:** coordenadas geo exactas, horario comercial real, URL del Google Business Profile y perfiles sociales (hoy "Síguenos en" está vacío). Solicitar al cliente.

### 2.2 Product (plantilla producto)
```json
{
  "@context": "https://schema.org", "@type": "Product",
  "name": "VASO REFRESCO 31 CL SPAIN QUARTZ C/6",
  "sku": "286-V113310ER6",
  "brand": { "@type": "Brand", "name": "NG Celulosa Hostelería" },
  "image": ["<url foto 800x800>"],
  "description": "<descripción del producto>",
  "offers": {
    "@type": "Offer",
    "url": "https://www.nunezgil.com/<slug-id>",
    "priceCurrency": "EUR",
    "price": "5.67",
    "availability": "https://schema.org/InStock",
    "seller": { "@id": "https://www.nunezgil.com/#organization" }
  }
}
```
- `availability`: mapear "En stock" → `InStock`, sin stock → `OutOfStock`.
- **B2B sin IVA:** el precio mostrado es sin IVA; declarar `price` consistente con lo visible y, si procede, `priceSpecification` con `valueAddedTaxIncluded: false`. **Crítico**: si el precio solo se ve tras login, NO marcar `Product/Offer` con precio (provoca mismatch y warnings). En ese caso usar Product sin `offers` o con `offers` sin price.
- No inventar `aggregateRating`/`review` si no existen reseñas reales (penalización por spam de structured data).

### 2.3 BreadcrumbList (categoría, subcategoría, producto, marca, post)
```json
{ "@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[
  {"@type":"ListItem","position":1,"name":"Inicio","item":"https://www.nunezgil.com/"},
  {"@type":"ListItem","position":2,"name":"Química industrial","item":"https://www.nunezgil.com/quimica-industrial"},
  {"@type":"ListItem","position":3,"name":"Ambientadores e insecticidas","item":"https://www.nunezgil.com/ambientadores-e-insecticidas"}
]}
```
Renderizar también el breadcrumb **visible** en HTML (ya existe la jerarquía en el body: "QUIMICA INDUSTRIAL > AMBIENTADORES..."). Doble beneficio: UX + rich result.

### 2.4 Otros
- **Article / BlogPosting** en posts de blog (con `author`, `datePublished`, `image`, `publisher` → Organization). Refuerza E-E-A-T.
- **ItemList** opcional en páginas de categoría/listado (lista de productos enlazados).
- **FAQPage** en posts con sección de preguntas (capta "People Also Ask"/AI Overviews).

---

## 3. URLs, redirecciones 301, sitemap y robots

### 3.1 Política de URLs (mantener las actuales — ya son SEO-friendly)
El crawl confirma URLs limpias que **deben preservarse** para no perder el poco posicionamiento existente:

| Tipo | Patrón actual (mantener) | Ejemplo |
|------|--------------------------|---------|
| Categoría N1 | `/{slug-categoria}` | `/quimica-industrial` |
| Subcategoría N2 | `/{slug-categoria}` (es slug propio, no anidado en el actual para N2) | `/ambientadores-e-insecticidas` |
| Subcategoría N3 | `/{slug-cat-padre}/{slug-sub}` | `/ambientadores-e-insecticidas/insecticidas` |
| Producto | `/{slug-descriptivo}-{id}` | `/vaso-refresco-31-cl-spain-quartz-c6-5912` |
| Estáticas | `/{slug}` | `/quienes-somos`, `/contacto`, `/marcas` |

Reglas: minúsculas, guiones, sin acentos ni mayúsculas, sin parámetros de tracking indexables, **sin barra final** (o con — pero consistente y forzado por 301). El ID al final del slug de producto permite estabilidad aunque cambie el nombre.

### 3.2 Mapa de redirecciones 301 (preservar equity)
El gran riesgo es el cambio **HTTP→HTTPS** y la consolidación de host. Implementar en `next.config.js` `redirects()` o, mejor, a nivel de servidor/CDN (más rápido, sin coste de función):

1. **Forzado HTTPS + www (regla global):** `http://*` y `https://nunezgil.com/*` → `https://www.nunezgil.com/$1` (301). Esto por sí solo recupera el equity de todas las URLs `http://` del sitemap 2022 (cierra SEO6 a nivel de transporte).
2. **URL → URL (1:1) cuando el slug se conserva:** no requiere regla; misma ruta sirve en el nuevo stack. Verificar que **todos** los slugs del catálogo migrado coinciden con los antiguos.
3. **Slugs que cambien** (limpieza de mayúsculas/acentos heredados, p. ej. URLs con `%20` o caracteres raros que aparecen en imágenes de marca tipo `NU;EZ%20GIL`): mapear 1:1 viejo→nuevo en una tabla de redirects.
4. **Productos descatalogados:** 301 a su subcategoría padre (nunca 404 si la URL tenía tráfico/enlaces).
5. **Noticias placeholder** (`/noticias/noticia-ejemplo*`): 301 al nuevo `/blog` (o 410 si nunca tuvieron tráfico — preferible 301 para no perder ningún enlace).
6. **`/noticias` → `/blog`:** 301 si se renombra la sección (ver §5). Si se mantiene `/noticias`, no hace falta.

**Proceso operativo (handoff a build):**
- Exportar el listado completo de URLs antiguas: descargar el sitemap 2022 actual + extraer de Search Console (Páginas indexadas) + Analytics (Landing pages con clics orgánicos últimos 16 meses).
- Construir CSV `url_antigua,url_nueva,tipo(301)` y cargarlo como fuente de las reglas.
- Tras el lanzamiento: monitorizar "Páginas > No indexada > 404" en Search Console la primera semana y añadir redirects faltantes.

### 3.3 Sitemap dinámico (`app/sitemap.ts`)
Sustituir el XML estático de 2022. Generar dinámicamente desde la DB/CMS, segmentado si supera ~50k URLs (no es el caso: ~200 categorías + N productos). Recomendado **sitemap index** con sub-sitemaps por tipo:

- `/sitemap.xml` (índice) → `sitemap-paginas.xml`, `sitemap-categorias.xml`, `sitemap-productos.xml`, `sitemap-marcas.xml`, `sitemap-blog.xml`.
- Cada `<url>`: `loc` (https+www absoluto), `lastmod` (fecha real de modificación del recurso), sin `priority`/`changefreq` (Google los ignora).
- **Excluir** del sitemap: login, carrito, checkout, búsqueda, legales de baja prioridad y cualquier URL `noindex`.
- `lastmod` debe ser fiable (Google lo usa): tomarlo del campo `updatedAt` del producto/post.

### 3.4 robots.txt (`app/robots.ts`)
```
User-agent: *
Allow: /
Disallow: /acceso
Disallow: /carrito
Disallow: /checkout
Disallow: /area-clientes
Disallow: /buscador
Disallow: /*?*orderby=        # variantes de orden ("Ordenar por") — evita crawl waste
Disallow: /*?*mostrar=        # variantes de paginación de items por página
Sitemap: https://www.nunezgil.com/sitemap.xml
```
- El listado de subcategoría tiene controles "Ordenar por" y "Mostrar 9/12/24" → si generan parámetros de URL, bloquearlos o canonicalizarlos a la URL base para no duplicar (gran fuente de crawl waste en e-commerce). Preferible: que el orden/paginado no genere URLs indexables, o usar `rel=canonical` a la página 1 / URL limpia.
- No bloquear `/marcas` ni recursos CSS/JS (Google necesita renderizar).

---

## 4. SEO local (Córdoba / Andalucía)

El negocio es **local con radio de servicio regional**. Es la palanca de mayor ROI a corto plazo para un B2B físico en Montilla.

### 4.1 Google Business Profile (acción nº1, fuera del código)
- Reclamar/optimizar la ficha: categoría principal **"Mayorista"** o **"Tienda de suministros para empresas"**; secundarias: "Tienda de productos de limpieza", "Proveedor de equipos de hostelería".
- NAP **idéntico** al de la web y al del JSON-LD (carácter por carácter, incl. "C/ Pilas de Panchía, 2").
- Horario real, fotos de las instalaciones (1.500 m²), área de servicio (Córdoba provincia + Andalucía), atributos B2B.
- Productos/servicios destacados, publicaciones periódicas, gestión de reseñas (pedir reseñas a clientes habituales del canal HORECA).

### 4.2 NAP y señales on-site
- Footer y `/contacto` con NAP en texto plano (no solo imagen) + `LocalBusiness` JSON-LD (§2.1) — ya hay NAP en el footer del crawl, mantenerlo consistente.
- Página `/contacto` con mapa (sustituir Mapbox con token SECRETO expuesto por embed sin clave o por mapa estático/Leaflet con token público propio — coordinar con Seguridad, hallazgo S2).
- Mencionar de forma natural "Montilla", "Córdoba" y "Andalucía" en home, quiénes-somos y contacto (ya aparece "envío gratis en Córdoba").

### 4.3 Señales locales externas (off-site)
- Alta/normalización en directorios y citaciones: Páginas Amarillas, eInforma, Axesor, directorios de hostelería andaluza, cámara de comercio de Córdoba. NAP consistente en todos.
- Buscar menciones de marca sin enlace (proveedores, marcas distribuidas como Quimxel/Tork que listan distribuidores) y convertirlas en enlace a la ficha de marca correspondiente (`/marcas/quimxel`).

### 4.4 Keywords locales objetivo
`mayorista hostelería Córdoba`, `productos limpieza industrial Córdoba`, `distribuidor química industrial Andalucía`, `suministros hostelería Montilla`, `celulosa industrial Córdoba`, `menaje hostelería Córdoba`. Integrar en home H1/copy, quiénes-somos y categorías raíz.

---

## 5. Estrategia de contenido / keywords B2B y plan editorial

### 5.1 Arquitectura de clústeres (pillar → categoría → subcategoría → producto)
Cada categoría raíz del mega-menú es un **pillar** que debe llevar 150-300 palabras de texto introductorio optimizado (hoy las categorías solo listan subcategorías sin copy). Clústeres principales:

| Pillar (categoría) | Keyword cabecera (intención comercial) | Subtemas / long-tail (subcategorías y blog) |
|--------------------|----------------------------------------|----------------------------------------------|
| Química industrial | `productos de limpieza industrial` / `química profesional limpieza` | desinfectantes profesionales, desincrustantes baños, limpiadores acero inox, productos lavandería industrial, higiene industria alimentaria, productos para piscinas |
| Celulosa industrial y dispensadores | `papel higiénico industrial` / `dispensadores papel profesional` | bobinas secamanos, dispensadores jabón, servilletas hostelería |
| Artículos de limpieza | `material de limpieza profesional` | mopas, carros de limpieza, fregonas industriales |
| Consumibles y un solo uso | `envases un solo uso hostelería` / `take away ecológico` | vasos cartón, envases compostables, mantelería un solo uso |
| Cristalería / En la mesa | `cristalería hostelería` / `menaje restaurante` | copas catavino, vajilla profesional, cubertería |
| Maquinaria hostelería | `maquinaria hostelería` | lavavajillas industrial, hornos, frío |
| Sanidad, salud y protección | `EPIs hostelería` / `guantes nitrilo profesional` | guantes, mascarillas, calzado laboral |

Regla de canibalización: **el pillar (categoría) posee la keyword genérica comercial; el blog posee la keyword informacional**; nunca compiten por la misma query. Verificar en Search Console (página+query) tras 2-3 meses que no hay dos URLs en top 20 para la misma keyword; si las hay, consolidar enlazando del satélite al pillar.

### 5.2 Enlazado interno
- Cada categoría enlaza a sus subcategorías (ya existe) + a 1-2 marcas relevantes + a 1-2 posts del blog del clúster.
- Cada post del blog enlaza a la categoría/subcategoría y a 2-3 productos concretos (contextual, anchor descriptivo).
- Página `/marcas` enlaza a cada `/marcas/[marca]`; cada ficha de marca enlaza a los productos de esa marca.

### 5.3 Plan editorial de blog (sustituye placeholder SEO7/SEO8)
Renombrar `/noticias` → `/blog` (mantener `/noticias` con 301) y borrar los 3 posts de relleno. Cadencia realista: **2 posts/mes**. Cada post: intención informacional, 800-1.500 palabras, BlogPosting+FAQPage schema, enlaces internos al clúster, autor con bio (E-E-A-T).

Calendario inicial (6 meses / 12 posts), priorizando intención de su cliente HORECA + industria:

1. Cómo elegir productos de limpieza para tu restaurante: guía por zonas (cocina, sala, aseos).
2. Plan de higiene APPCC en hostelería: qué químicos necesitas y por qué.
3. Diferencia entre desinfectante, detergente y desincrustante (y cuándo usar cada uno).
4. Dispensadores de papel y jabón: cómo reducir costes de celulosa en tu negocio.
5. Limpieza de acero inoxidable en cocinas profesionales: errores comunes.
6. Envases de un solo uso para take away: opciones ecológicas y normativa 2026.
7. Cristalería y menaje para restaurantes: cómo elegir según tu carta.
8. Lavandería industrial en hostelería: químicos y dosificación correcta.
9. EPIs y ropa laboral obligatoria en hostelería e industria alimentaria.
10. Productos para mantenimiento de piscinas de hoteles y campings.
11. Checklist de limpieza para la apertura de temporada (caso Andalucía/Córdoba).
12. Caso real / proyecto de instalación de maquinaria de hostelería (E-E-A-T, foto propia).

Cada post incluye CTA B2B claro: "Pide presupuesto" / "Da de alta tu cuenta de empresa" (alinea con el embudo: blog informacional → categoría comercial → registro/carrito).

---

## 6. KPIs y medición

### 6.1 Herramientas (configurar en lanzamiento)
- **GA4** ya instalado (`G-RWL5CKME4Q`): verificar en el nuevo stack que el tag carga en todas las rutas (App Router: cargar vía `@next/third-parties` o componente con `next/script` `afterInteractive`). Configurar conversiones: envío de formulario `/contacto`, registro de cuenta, inicio de pedido, pedido completado.
- **Google Search Console:** verificar la propiedad de dominio (`www.nunezgil.com`), enviar el nuevo `sitemap.xml`, vigilar "Cobertura"/"Páginas" tras la migración.
- Segmentar **orgánico vs. directo/branded** y **marca ("núñez gil") vs. no-marca** en informes.

### 6.2 KPIs y objetivos (a 12 meses)
| KPI | Fuente | Baseline | Objetivo 12m |
|-----|--------|----------|--------------|
| Sesiones orgánicas no-marca | GA4 | medir tras lanzar | +50% interanual |
| Páginas indexadas válidas | GSC | (sitemap 2022 roto) | ≥95% del sitemap nuevo |
| Errores críticos de cobertura | GSC | n/d | 0 |
| Core Web Vitals (móvil, "Good") | GSC/CrUX | hoy ~6,3s load | LCP<2,5s · INP<200ms · CLS<0,1 |
| Keywords locales en top 3 | GSC | n/d | ≥5 ("mayorista hostelería Córdoba", etc.) |
| Clics orgánicos a fichas de producto | GSC | n/d | crecimiento sostenido MoM |
| Conversiones desde orgánico (presupuesto/registro) | GA4 | n/d | ≥3% de las sesiones orgánicas |
| Featured snippets / FAQ capturados | GSC/manual | 0 | ≥20% de queries informacionales objetivo |

### 6.3 Cadencia
- **Semanal (primer mes post-lanzamiento):** monitorizar 404, redirects, indexación, CWV.
- **Mensual:** posiciones, tráfico orgánico segmentado, rendimiento de posts nuevos, control de canibalización (página+query).
- **Trimestral:** revisión de clústeres, gaps de contenido frente a competencia local, salud de enlaces y citaciones NAP.

---

## 7. Checklist de handoff para el build (orden recomendado)
1. [ ] Decidir host canónico (www) y configurar redirect global HTTPS+www (301).
2. [ ] `lib/seo.ts` + `metadataBase` + `generateMetadata()` por plantilla (§1).
3. [ ] Un `<h1>` por plantilla (cierra SEO1).
4. [ ] JSON-LD: Organization/LocalBusiness en layout; Product, Breadcrumb, Article por plantilla (§2). Pedir al cliente: geo, horario, GBP, redes.
5. [ ] `app/sitemap.ts` (index segmentado) + `app/robots.ts` (§3).
6. [ ] Tabla de redirects 301 desde sitemap 2022 + GSC + GA4 (§3.2).
7. [ ] `alt` en todas las imágenes + `next/image` WebP/AVIF (cierra accesibilidad + P4).
8. [ ] `noindex` en login/carrito/checkout/búsqueda; canonicalizar parámetros de orden/paginado.
9. [ ] Borrar noticias placeholder; crear `/blog` + primeros 2 posts (§5).
10. [ ] Verificar GA4 en App Router + dar de alta GSC y enviar sitemap.
11. [ ] Optimizar Google Business Profile y citaciones NAP (§4).

### Dependencias con otros agentes
- **Seguridad:** el token Mapbox secreto (S2) afecta a `/contacto`; coordinar el reemplazo del mapa. El forzado HTTPS+HSTS (S1) es compartido con la regla de redirect SEO.
- **Rendimiento:** CWV es KPI SEO; `next/image`, bundling y caché (P1-P6) son responsabilidad compartida.
- **Diseño:** el H1 y el breadcrumb visible deben formar parte del diseño de cada plantilla.

### Datos pendientes de solicitar al cliente
Coordenadas geo exactas · horario comercial · URL de Google Business Profile · perfiles en redes sociales (RRSS) reales · confirmación de si el precio de producto es público o solo tras login (afecta al schema Product/Offer).
