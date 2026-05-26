# Arquitectura Backend — nunezgil.com (reconstrucción)

**Cliente:** Núñez Gil Mayorista de Hostelería e Industrial S.L. (Montilla, Córdoba)
**Autor:** Backend Architect · **Fecha:** 2026-05-26 · **Fase:** Planificación / Spec
**Front decidido:** Next.js (App Router) en Vercel. Este documento define el **backend y los datos**.

> Documento accionable. Incluye modelo de datos, recomendación de plataforma, búsqueda, carrito/pedido B2B, auth, diseño de API, migración desde Movatec/workcrm e infra+costes. **No** es la implementación completa.

---

## 0. Resumen de decisiones (TL;DR)

| Tema | Decisión | Motivo en una línea |
|---|---|---|
| Plataforma | **Custom API + PostgreSQL + Prisma**, dentro del propio monorepo Next.js (Route Handlers) | +10k SKUs con **precios/visibilidad B2B por cliente** y catálogo jerárquico de 3 niveles encaja mejor con esquema propio que con Medusa/Strapi; equipo pequeño = menos piezas. |
| Base de datos | **PostgreSQL gestionado** (Neon o Supabase) | Serverless, escala a cero, ramas de preview, integración nativa Vercel. |
| Búsqueda | **Postgres FTS + `pg_trgm`** en fase 1; **Meilisearch** si el autosuggest necesita tolerancia a errores y velocidad sub-50 ms | Empezar barato; subir a Meilisearch sin rehacer el modelo. |
| Carrito/pedido | **Doble modo**: (A) **Solicitud de pedido/presupuesto** (sin pago online) como modo por defecto B2B; (B) **pago online opcional** (Redsys/Stripe) activable por cliente | El negocio actual no cobra online; B2B suele ir a crédito/transferencia. |
| Auth | **Sesiones httpOnly** (Auth.js/Lucia) con cuentas **aprobadas manualmente**, roles y precios por cliente | El threat model lo define el Security Engineer; aquí solo principios. |
| API | **REST tipado** (Route Handlers Next.js) + **ISR/Cache** para catálogo público; datos B2B siempre dinámicos sin caché | Objetivo p95 < 200 ms. |
| Imágenes | Migrar de `workcrm.com` a **Vercel Blob / S3-R2** + `next/image` (WebP/AVIF, srcset) | Hoy son JPG 800×800 sin optimizar; es la mayor palanca de rendimiento. |
| Infra | Vercel (front+API) + Neon/Supabase (DB) + Blob/R2 (imágenes) + Resend (email) | ~35–80 €/mes en fase inicial. |

---

## 1. Modelo de datos

### 1.1 Realidad observada en el catálogo actual (base del diseño)

De la auditoría/crawl:

- **Jerarquía de 3 niveles**: Categoría (`QUIMICA INDUSTRIAL`) → Subcategoría (`AMBIENTADORES E INSECTICIDAS`) → Sub-subcategoría (`INSECTICIDAS`) → Producto. Algunas ramas tienen 2 niveles. **Conviene un árbol auto-referenciado** (categoría con `parentId`), no niveles fijos.
- **URLs de categoría planas**: `/quimica-industrial`, `/ambientadores-e-insecticidas`, `/ambientadores-e-insecticidas/insecticidas`. Slugs únicos globales → `slug UNIQUE`.
- **Producto**: nombre, **referencia/SKU** (`286-V113310ER6`, `831-100023`), **marca** (`NG CELULOSA HOSTELERÍA`), **precio sin IVA** (`5,67 € I.V.A no incluido`), **precio por unidad** (`0,94 € / Unidad`), **formato/empaque** (`C/6`, `C/12`, `PAQ-50 CAJA 24`), **disponibilidad** (`En stock`), una imagen principal.
- **Etiquetas transversales**: `Novedades`, `Ofertas`, `Outlet`, `Destacado` (secciones de home y menú).
- **~75 marcas** (más de las 25 estimadas), incl. propias NG (NG Química, NG Limpieza, NG Lavandería, NG Automoción, NG Celulosa, NG Hostelería, NG Aseo Personal, NG Piscinas, NG Un Solo Uso).
- **B2B**: precios mostrados **sin IVA**; "Área Clientes" con registro/login; comprar requiere estar registrado. → El precio y la visibilidad pueden depender del cliente logueado.

### 1.2 Principios del modelo

1. **Producto vs. Variante (SKU)**: el catálogo actual es mayormente "1 producto = 1 SKU", pero hay packs/formatos. Se modela `Product` (ficha) → `Variant` (SKU vendible). Si un producto solo tiene un formato, tiene 1 variante. Esto evita rehacer el esquema cuando aparezcan tallas/colores/formatos.
2. **Precios en céntimos enteros** (`Int`), nunca `Float`, para evitar errores de redondeo. IVA como tipo aplicable, no embebido en el precio base.
3. **Categoría jerárquica auto-referenciada** con `path` materializado (ej. `quimica-industrial/ambientadores-e-insecticidas/insecticidas`) para breadcrumbs y queries de subárbol rápidas.
4. **B2B layered pricing**: precio base de catálogo + listas de precio por grupo de cliente + override por cliente + reglas de visibilidad. El precio resuelto se calcula en servidor según el usuario.
5. **Soft-delete** (`deletedAt`) en entidades de catálogo y cuentas; nunca borrado físico de pedidos/clientes (trazabilidad + RGPD con plazos).

### 1.3 Esquema Prisma (extracto representativo)

```prisma
// ---------- CATÁLOGO ----------
model Category {
  id          String     @id @default(cuid())
  slug        String     @unique
  name        String
  description String?
  parentId    String?
  parent      Category?  @relation("CategoryTree", fields: [parentId], references: [id])
  children    Category[] @relation("CategoryTree")
  path        String     // "quimica-industrial/ambientadores-e-insecticidas/insecticidas"
  depth       Int        @default(0)
  position    Int        @default(0)
  imageUrl    String?
  isActive    Boolean    @default(true)
  // SEO
  metaTitle       String?
  metaDescription String?
  products    ProductCategory[]
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  @@index([parentId])
  @@index([path])
}

model Brand {
  id        String    @id @default(cuid())
  slug      String    @unique
  name      String
  logoUrl   String?
  isOwnBrand Boolean  @default(false) // marcas propias NG
  isActive  Boolean   @default(true)
  products  Product[]
  @@index([isOwnBrand])
}

model Product {
  id          String   @id @default(cuid())
  slug        String   @unique          // "vaso-refresco-31-cl-spain-quartz-c6-5912"
  name        String
  description String?
  brandId     String?
  brand       Brand?   @relation(fields: [brandId], references: [id])
  // flags transversales
  isNew       Boolean  @default(false)  // Novedades
  isOffer     Boolean  @default(false)  // Ofertas
  isOutlet    Boolean  @default(false)  // Outlet
  isFeatured  Boolean  @default(false)
  isActive    Boolean  @default(true)
  // SEO
  metaTitle       String?
  metaDescription String?
  // búsqueda
  searchVector Unsupported("tsvector")?  // FTS (ver §3)
  variants    Variant[]
  images      ProductImage[]
  categories  ProductCategory[]
  deletedAt   DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  @@index([brandId])
  @@index([isNew, isOffer, isOutlet, isFeatured])
}

model ProductCategory {  // N:M producto<->categoría (producto puede estar en varias)
  productId  String
  categoryId String
  isPrimary  Boolean  @default(false) // categoría canónica para breadcrumb/URL
  product    Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  category   Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  @@id([productId, categoryId])
  @@index([categoryId])
}

model Variant {                 // = SKU vendible
  id            String  @id @default(cuid())
  productId     String
  product       Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  sku           String  @unique          // "286-V113310ER6"
  ean           String?                  // código de barras si existe
  packFormat    String?                  // "C/6", "PAQ-50 CAJA 24", "5L"
  unitsPerPack  Int     @default(1)
  // precios en CÉNTIMOS, sin IVA (precio base de catálogo)
  basePriceCents Int
  unitPriceCents Int?                     // precio por unidad mostrado ("0,94 €/Unidad")
  taxRate        Decimal @default(21.0)   // % IVA (21 / 10 / 4)
  // stock
  stockQty       Int     @default(0)
  stockStatus    StockStatus @default(IN_STOCK) // texto "En stock"/bajo pedido
  isActive       Boolean @default(true)
  prices         PriceListItem[]
  @@index([productId])
  @@index([sku])
}

enum StockStatus { IN_STOCK LOW ON_ORDER OUT_OF_STOCK }

model ProductImage {
  id        String  @id @default(cuid())
  productId String
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  url       String  // tras migración: URL en Blob/R2
  alt       String?
  position  Int     @default(0)
  width     Int?
  height    Int?
  @@index([productId])
}

// ---------- CLIENTES B2B + PRECIOS POR CLIENTE ----------
model Customer {           // empresa/cuenta B2B (Área Clientes)
  id            String   @id @default(cuid())
  email         String   @unique
  passwordHash  String                       // gestionado por Auth (ver §5)
  companyName   String
  taxId         String?                      // CIF/NIF
  phone         String?
  status        CustomerStatus @default(PENDING) // alta moderada
  priceGroupId  String?
  priceGroup    PriceGroup? @relation(fields: [priceGroupId], references: [id])
  addresses     Address[]
  orders        Order[]
  customPrices  CustomerPrice[]
  role          Role     @default(CUSTOMER)
  deletedAt     DateTime?
  createdAt     DateTime @default(now())
  @@index([status])
}

enum CustomerStatus { PENDING ACTIVE SUSPENDED }
enum Role { CUSTOMER SALES ADMIN }

model PriceGroup {          // tarifa: "General", "Mayorista", "Distribuidor"...
  id        String   @id @default(cuid())
  name      String
  discountPct Decimal? // descuento lineal opcional sobre base
  customers Customer[]
  items     PriceListItem[]
}

model PriceListItem {       // precio de una variante para un grupo
  id           String  @id @default(cuid())
  priceGroupId String
  priceGroup   PriceGroup @relation(fields: [priceGroupId], references: [id], onDelete: Cascade)
  variantId    String
  variant      Variant @relation(fields: [variantId], references: [id], onDelete: Cascade)
  priceCents   Int
  @@unique([priceGroupId, variantId])
}

model CustomerPrice {       // override puntual cliente<->variante (precio negociado)
  id         String  @id @default(cuid())
  customerId String
  customer   Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)
  variantId  String
  priceCents Int
  @@unique([customerId, variantId])
}

// ---------- PEDIDOS / PRESUPUESTOS ----------
model Order {
  id          String      @id @default(cuid())
  number      String      @unique          // NG-2026-00042
  customerId  String
  customer    Customer    @relation(fields: [customerId], references: [id])
  type        OrderType   @default(QUOTE_REQUEST)
  status      OrderStatus @default(SUBMITTED)
  paymentMode PaymentMode @default(OFFLINE) // OFFLINE = transferencia/crédito
  items       OrderItem[]
  subtotalCents Int
  taxCents      Int
  totalCents    Int
  shippingAddressId String?
  notes       String?
  createdAt   DateTime    @default(now())
  @@index([customerId, status])
}

enum OrderType   { QUOTE_REQUEST ORDER }
enum OrderStatus { DRAFT SUBMITTED CONFIRMED PROCESSING SHIPPED DELIVERED CANCELLED }
enum PaymentMode { OFFLINE ONLINE }

model OrderItem {
  id         String @id @default(cuid())
  orderId    String
  order      Order  @relation(fields: [orderId], references: [id], onDelete: Cascade)
  variantId  String
  // snapshot inmutable (no referenciar precio vivo)
  skuSnapshot   String
  nameSnapshot  String
  qty           Int
  unitPriceCents Int
  taxRate        Decimal
  @@index([orderId])
}

model Address { /* customerId, line1, city, province, postalCode, country... */ id String @id @default(cuid()) customerId String }
```

**Resolución de precio (servidor, por petición):**
`CustomerPrice` (override) → si no, `PriceListItem` del `PriceGroup` del cliente → si no, `discountPct` del grupo sobre `basePriceCents` → si no, `basePriceCents`. El resultado nunca se cachea por usuario; ver §6.

**Visibilidad B2B:** flag opcional `requiresLogin` por producto/categoría; precios solo se exponen a usuarios `ACTIVE`. Anónimo ve catálogo + "Solicitar precio/Iniciar sesión para ver precio" según preferencia del cliente.

### 1.4 Compatibilidad y migraciones de esquema
- Cambios de esquema vía **migraciones Prisma versionadas** (`prisma migrate`), nunca a mano en prod.
- Snapshots inmutables en `OrderItem` → cambios de precio/nombre no rompen pedidos históricos.

---

## 2. Recomendación de plataforma

**Contexto:** +10k SKUs, catálogo jerárquico de 3 niveles, **B2B con precios/visibilidad por cliente**, equipo pequeño, despliegue en Vercel, reutilización de datos de Movatec.

| Opción | Pros | Contras para este caso | Veredicto |
|---|---|---|---|
| **Medusa (headless commerce)** | Carrito/pedidos/precios B2B de fábrica, módulo de price-lists. | Necesita servidor Node persistente + Redis (no encaja con Vercel serverless puro → hay que alojar el backend aparte, p.ej. Railway/Render); curva de aprendizaje; sobra el motor de checkout/pago si el flujo es "solicitud de presupuesto". | **Descartado en fase 1** (reconsiderar si crece el pago online). |
| **Strapi / Payload (CMS headless)** | Buen panel de administración para editar catálogo y contenido (noticias, páginas legales). | No es un motor de comercio: precios B2B, carrito y pedidos hay que construirlos igual; modelar jerarquía + variantes es manual. Payload corre bien sobre Postgres. | **Parcial**: Payload válido si pesa mucho el "panel de administración listo". |
| **Custom API + PostgreSQL + Prisma (en el monorepo Next.js)** | Control total del modelo B2B (price groups, overrides, visibilidad); 0 piezas extra de infra (Route Handlers en la misma app); tipado E2E con Prisma+TS; encaja nativo con Vercel + Neon/Supabase. | Hay que construir el panel de administración (mitigable con Prisma Studio al inicio o un admin a medida ligero). | **RECOMENDADO.** |

**Decisión:** **Custom API + PostgreSQL + Prisma**, todo dentro del proyecto Next.js (App Router Route Handlers). Las particularidades B2B de Núñez Gil (precio por cliente, alta moderada, "pedir presupuesto" en vez de pagar) son justo lo que los productos llave-en-mano no resuelven sin personalización, así que el esfuerzo neto es menor y la infra más simple.

**Panel de administración:** Fase 1 → **Prisma Studio** + scripts de import para el día a día. Fase 2 → admin propio mínimo (CRUD de productos/precios/pedidos) protegido por rol `ADMIN`, o adoptar **Payload sobre la misma DB** si el cliente quiere autoservicio editorial. Mantener la DB propia intacta permite esta elección sin migrar datos.

---

## 3. Búsqueda con autosuggest

El sitio actual ya tiene buscador con autosuggest (`/buscador?terminobuscar=`, librería `bsn.AutoSuggest`). Hay que igualarlo y mejorarlo.

| Opción | Latencia | Tolerancia a typos | Coste | Operación |
|---|---|---|---|---|
| **Postgres FTS + `pg_trgm`** | 20–80 ms | media (trigram) | 0 € (incluido en DB) | Cero infra extra |
| **Meilisearch** | < 30 ms | alta (typo-tolerant, prefijo) | ~10–30 €/mes (Meilisearch Cloud) o self-host | Sincronizar índice |
| **Algolia** | < 20 ms | alta | caro a escala (por operaciones/registros) | SaaS, el más pulido |

**Recomendación escalonada:**
1. **Fase 1 — Postgres FTS** con columna `tsvector` (nombre + SKU + marca + categoría) + índice `GIN`, y `pg_trgm` para autosuggest por prefijo/typo sobre nombre y SKU. Cubre 10k SKUs con holgura y latencia < 100 ms. Endpoint `/api/search/suggest?q=` devuelve top-8 (nombre, SKU, slug, imagen, precio si procede).
2. **Disparador de upgrade a Meilisearch**: si el cliente pide "buscar como Amazon" (errores ortográficos, sinónimos hostelería, ranking por relevancia/popularidad, faceting rápido por marca/categoría/precio). Meilisearch se sincroniza con un job tras cada import; el modelo de datos **no cambia**.

```sql
-- FTS fase 1
ALTER TABLE "Product" ADD COLUMN "searchVector" tsvector
  GENERATED ALWAYS AS (to_tsvector('spanish', coalesce(name,'') || ' ' || coalesce("metaTitle",''))) STORED;
CREATE INDEX product_search_idx ON "Product" USING GIN ("searchVector");
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX product_name_trgm_idx ON "Product" USING GIN (name gin_trgm_ops);
CREATE INDEX variant_sku_trgm_idx  ON "Variant" USING GIN (sku  gin_trgm_ops);
```

---

## 4. Carrito + flujo de pedido B2B

El carrito actual existe (`/carrito`) y comprar requiere registro. El negocio **no cobra online hoy**. Diseñamos **dos escenarios** y los dejamos configurables.

### Escenario A — Solicitud de pedido / presupuesto (DEFAULT, sin pago online)
1. Cliente `ACTIVE` añade variantes al carrito (precio resuelto según su tarifa).
2. Carrito persistido server-side (`Cart`/`CartItem`, ligado a `customerId`; invitado en cookie firmada).
3. "Enviar pedido" → crea `Order` con `type=QUOTE_REQUEST`, `paymentMode=OFFLINE`, `status=SUBMITTED`. Snapshot de precios en `OrderItem`.
4. Notificación email a Núñez Gil (Resend) + confirmación al cliente. El equipo confirma stock/condiciones y pasa a `CONFIRMED`. Cobro por transferencia/crédito fuera de la web (como hoy).
5. Umbrales de envío gratis aplicados en el cálculo (>100 € Córdoba, >200 € península).

### Escenario B — Pago online (OPCIONAL, activable)
1. Igual hasta el carrito.
2. Checkout con pasarela: **Redsys** (estándar banca española, ideal B2B local) o **Stripe** (DX superior). Webhook confirma pago → `Order` `type=ORDER`, `paymentMode=ONLINE`, `status=CONFIRMED`.
3. Idempotencia en el webhook (clave de evento) para no duplicar pedidos.

**Recomendación:** lanzar con **A**; dejar **B** como feature-flag por cliente/grupo. Modelo de datos ya soporta ambos (`OrderType`, `PaymentMode`) sin migración.

---

## 5. Auth segura del Área Clientes (principios; threat model = Security Engineer)

Coordinado con Security; aquí solo principios de arquitectura:
- **Sesiones con cookie `httpOnly` + `Secure` + `SameSite=Lax`** (no JWT en localStorage). Recomendado **Auth.js (NextAuth) Credentials** o **Lucia** sobre la misma Postgres.
- **Contraseñas con `argon2id`** (o bcrypt coste ≥ 12). Nunca en claro; nunca en logs.
- **Alta moderada**: registro crea `Customer` en `PENDING`; un `ADMIN` lo activa (B2B: validar empresa/CIF). Evita scraping de precios.
- **Roles**: `CUSTOMER` / `SALES` / `ADMIN`. Autorización en cada Route Handler (no confiar en el front).
- **Rate-limiting** en login/registro/reset (p.ej. Upstash Redis o Vercel Firewall) + bloqueo progresivo.
- **Reset de contraseña** por token de un solo uso, caducidad corta, enviado por email.
- **HTTPS+HSTS forzado, CSP, X-Frame-Options, etc.** (corrige S1–S4 de la auditoría) en `middleware`/headers de Vercel.
- **Precios solo a usuarios `ACTIVE`**; endpoints de precio verifican sesión y estado.

---

## 6. Diseño de API (la que consume Next.js)

**Estilo:** **REST tipado** vía **Route Handlers** de Next.js (`app/api/.../route.ts`), validación con **Zod**, acceso a datos con Prisma. (GraphQL se descarta: una sola app consumidora, REST + ISR es más simple y cacheable.) Objetivo **p95 < 200 ms**.

### Endpoints clave
```
# Catálogo (público, cacheable)
GET  /api/categories                      -> árbol completo (cache larga)
GET  /api/categories/:slug                -> categoría + hijos + breadcrumb
GET  /api/categories/:slug/products       -> listado paginado + filtros (brand, price, flags) + orden
GET  /api/products/:slug                  -> ficha (variantes, imágenes, marca, categorías)
GET  /api/brands                          -> listado de marcas
GET  /api/brands/:slug/products
GET  /api/collections/:flag               -> novedades | ofertas | outlet | destacados
GET  /api/search?q=&page=                 -> resultados full
GET  /api/search/suggest?q=               -> autosuggest top-8 (sin caché por usuario)

# Cliente / B2B (autenticado, sin caché)
POST /api/auth/[...]                       -> login / logout / register / reset
GET  /api/me                               -> perfil + priceGroup
GET  /api/cart                             -> carrito del cliente
POST /api/cart/items   PATCH/DELETE        -> añadir / actualizar / quitar
POST /api/orders                           -> crear pedido/solicitud de presupuesto
GET  /api/orders  GET /api/orders/:id      -> historial / detalle

# Pago online (opcional)
POST /api/checkout/session                 -> inicia pasarela
POST /api/webhooks/payment                 -> confirma pago (idempotente)
```

### Estrategia de caché / rendimiento
- **Catálogo público (categorías, fichas, listados, marcas)**: render con **ISR / `revalidate`** (p.ej. 1 h) + **revalidación on-demand** (`revalidateTag`) tras cada import desde Movatec → HTML/JSON servido desde el edge, p95 muy por debajo de 200 ms.
- **Tags de caché** por entidad (`product:<id>`, `category:<slug>`) para invalidación quirúrgica.
- **Datos B2B (precio resuelto, carrito, pedidos, `/me`)**: **siempre dinámico, `no-store`**, nunca en CDN. El precio depende del usuario.
- **Índices DB** ya definidos (slug, parentId, path, brandId, sku, flags) para listados/filtros rápidos.
- **Imágenes** vía `next/image` (WebP/AVIF, `srcset`, lazy) → resuelve P4/P5/P6 de la auditoría.

---

## 7. Estrategia de migración desde Movatec / workcrm

El catálogo, fotos y clientes viven en la plataforma PHP propietaria **Movatec** (`workcrm.com`). Plan en 3 frentes:

### 7.1 Catálogo (productos, categorías, marcas, precios, stock)
- **Vía preferente:** solicitar a Movatec **export oficial** (CSV/Excel/XML del ERP "Workmanagement", o acceso a la API/BD). Es lo más limpio y evita disputas de propiedad del dato.
- **Plan B (si no colaboran):** scraping controlado **del propio cliente con sus credenciales** del Área Clientes (para capturar precios/stock B2B), respetando términos. El crawl de auditoría ya mapeó la estructura de URLs (categorías planas, fichas con SKU/marca/precio/stock).
- **Pipeline ETL** (script Node de un solo uso):
  1. **Extract** → normalizar a JSON intermedio (`{ sku, name, brand, category_path, price_cents, unit_price_cents, pack, stock, image_urls[], flags }`).
  2. **Transform** → mapear `category_path` a árbol `Category` (crear nodos faltantes con `path`/`depth`), parsear precios `"5,67 €"` → céntimos, derivar `unitsPerPack` de `C/6`, `PAQ-50`, etc., deduplicar por `sku`, derivar `slug` (reutilizar los actuales para preservar SEO/redirects).
  3. **Load** → `prisma upsert` por `sku` (idempotente, reejecutable). Validación previa con Zod; informe de filas rechazadas.
- **Reejecutable** para sincronizaciones periódicas hasta el corte definitivo; cada carga dispara `revalidateTag`.

### 7.2 Imágenes (hoy en `workcrm.com`)
- Descargar todas las URLs `workcrm.com/.../imagesproductos|imagesmarcas|files/...` (inventario en `crawl-report.json`), **reoptimizar** (resize + WebP/AVIF) y subir a **Vercel Blob** (o Cloudflare R2 / S3).
- Guardar nueva URL en `ProductImage.url` / `Brand.logoUrl`. **No** dejar dependencia de `workcrm.com` en producción (riesgo de corte del proveedor saliente).
- Generar `alt` desde el nombre del producto (corrige accesibilidad/SEO de la auditoría).

### 7.3 Clientes (Área Clientes)
- Pedir export de clientes (empresa, CIF, email, dirección, tarifa/grupo, precios negociados). **No se pueden migrar contraseñas** (hash ajeno/desconocido).
- **Onboarding seguro**: importar clientes en `PENDING`/`ACTIVE` **sin** contraseña y forzar **"establecer contraseña"** vía email con token en el primer acceso. Comunicar el cambio de web.
- Migrar `PriceGroup` y `CustomerPrice` desde las tarifas del ERP si están disponibles.

### 7.4 Corte (cutover) y SEO
- Mapa de **redirects 301** de URLs antiguas → nuevas (preservar slugs siempre que se pueda).
- **Sitemap nuevo** en HTTPS, `canonical`, OG, Schema.org (`Product`, `BreadcrumbList`, `Organization/LocalBusiness`) — corrige SEO1–SEO6.
- Validar paridad de catálogo (conteo de SKUs, precios) antes de apuntar el DNS.

---

## 8. Hosting / infraestructura y costes aproximados

| Componente | Servicio recomendado | Plan inicial | Coste aprox. |
|---|---|---|---|
| Front + API (Next.js) | **Vercel** | Pro (recomendado para negocio) | 20 €/mes (Hobby 0 € para staging) |
| Base de datos | **Neon** o **Supabase** (Postgres) | Free/Launch | 0–25 €/mes |
| Imágenes | **Vercel Blob** o **Cloudflare R2** | pago por uso | ~0–10 €/mes (R2 sin egreso) |
| Email transaccional | **Resend** | Free → Pro | 0–20 €/mes |
| Rate-limit/cache | **Upstash Redis** (opcional) | Free | 0–10 €/mes |
| Búsqueda (si escala) | **Meilisearch Cloud** (opcional) | — | 0–30 €/mes |
| Pasarela pago (si B) | **Redsys** (banco) / **Stripe** | por transacción | comisión por venta |

**Estimación realista fase 1:** **~35–55 €/mes** (Vercel Pro + Postgres + Blob + Resend, búsqueda en Postgres, sin pago online). Con Meilisearch + pago online: **~80–110 €/mes**. Escala a cero en tráfico bajo (serverless).

**Notas de infra:**
- Una sola región DB cercana (Frankfurt/París) para latencia desde España.
- Backups automáticos de la DB (Neon/Supabase incluyen PITR) + export semanal a almacenamiento frío.
- Variables de entorno y secretos en Vercel (resuelve el token Mapbox expuesto S2: nunca secretos en el HTML/cliente).
- Observabilidad: Vercel Analytics + logs; alertas en errores de webhook de pago e import.

---

## 9. Dependencias con otros agentes
- **Security Engineer:** dueño del threat model, política de cabeceras/CSP, hardening de auth, rate-limiting y revocación del token Mapbox. Este doc solo fija principios (§5) sin duplicar su trabajo.
- **Frontend/Diseño:** consume la API REST (§6); contrato de tipos compartido (Prisma → TS).
- **SEO/Contenido:** campos `metaTitle/metaDescription`, slugs y datos estructurados ya previstos en el modelo.
