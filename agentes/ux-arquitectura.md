# Arquitectura UX e Información — nunezgil.com (reconstrucción)

**Agente:** UX Architect (ArchitectUX)
**Cliente:** Núñez Gil Mayorista de Hostelería e Industrial, S.L. (Montilla, Córdoba)
**Tipo:** E-commerce / catálogo **B2B** de limpieza industrial y hostelería
**Stack:** Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS
**Fase:** Planificación / SPEC (no se construye todavía)
**Fecha:** 2026-05-26
**Fuentes:** `01-INFORME-AUDITORIA.md`, `02-SPEC-IMPLEMENTACION.md`, `investigacion/data/crawl-report.json`, `investigacion/screenshots/`, `agentes/frontend.md`

> **Alcance de este documento.** Aquí se define la **estructura, jerarquía y comportamiento** (arquitectura de información, navegación, flujos, responsive estructural, tokens *estructurales* de espaciado/grid/layout y patrones de accesibilidad). **NO** define color, tipografía ni valores visuales: esos los entrega el **UI Designer** en `agentes/diseno-ui.md` (pendiente). Donde aparece un token visual, va como **placeholder** `--xxx` que el UI Designer rellena.
>
> **Decisiones de cliente que gobiernan todo el documento:**
> 1. **Precios PÚBLICOS** — se ven sin login. El login NO es obligatorio para navegar, ver precios ni armar una solicitud.
> 2. **Solo solicitud de pedido/presupuesto** — NO hay pago online. El carrito termina en **"Enviar solicitud de pedido/presupuesto"**, no en checkout con pago. El Área Clientes sirve para gestión, datos fiscales y repetir pedidos, pero es **opcional**.

---

## 0. Principios rectores de la UX

1. **Buscar > Navegar.** Con +10.000 referencias, el comprador B2B que sabe lo que quiere debe llegar en ≤2 acciones. El **buscador es el elemento primario** del header (no el mega-menú).
2. **Reducir carga cognitiva.** Las 13 macro-categorías actuales en una barra azul recargada se reagrupan en **6 universos** comprensibles. El detalle de 200 subcategorías vive *dentro* de cada universo, no todo a la vez.
3. **Sin callejones sin salida.** Toda página de catálogo ofrece siguiente paso (subcategorías, productos, o "pedir presupuesto / contactar"). Se eliminan las *cards* vacías heredadas (P6).
4. **Confianza B2B.** Datos visibles que la web actual esconde: referencia, marca, precio sin IVA con leyenda, disponibilidad, mínimos de envío gratis, antigüedad ("desde 1994"), +10.000 referencias.
5. **Sin fricción de registro.** El registro/login nunca bloquea ver precios ni armar la solicitud; solo aparece (opcional) al enviarla, y se puede enviar como invitado.
6. **Accesibilidad de base, no de parche.** Landmarks, un único H1, foco visible, teclado completo y skip-link desde el primer commit (corrige SEO1 y los hallazgos de a11y del informe).

---

## 1. Arquitectura de Información (AI)

### 1.1 Problema actual
- 13 macro-categorías + ~200 subcategorías presentadas **planas y simultáneas** en una barra azul → sobrecarga.
- Nomenclatura inconsistente: mezcla de criterios **por producto** (Cristalería, Mobiliario), **por estancia** (En la Mesa, En la Cocina, En la Sala) y **por función** (Química Industrial, Aseo Personal).
- Jerarquía real del catálogo (confirmada en el crawl): **3 niveles** → Departamento → Categoría → Subcategoría → Producto. Ej.: `Química Industrial › Ambientadores e Insecticidas › Insecticidas › [producto]`.

### 1.2 Reagrupación: de 13 macro-categorías a 6 universos

Las 13 macro actuales se mantienen como **Departamentos** navegables (no se rompe el SEO ni las URLs), pero se **agrupan en 6 universos temáticos** que organizan el mega-menú y la home, dando un mapa mental claro. Cada universo es una *columna* del mega-menú.

| Universo (agrupador visual) | Departamentos actuales que contiene | Criterio |
|---|---|---|
| **1. Limpieza e Higiene** | Química Industrial · Artículos de Limpieza · Celulosa Industrial y Dispensadores · Aseo Personal | Núcleo del negocio: productos y útiles de limpieza/higiene profesional |
| **2. Hostelería — Mesa y Sala** | En la Mesa · Cristalería · En la Sala | Servicio de sala y mesa (menaje, vajilla, cristalería, mantelería) |
| **3. Hostelería — Cocina y Maquinaria** | En la Cocina · Maquinaria Hostelería | Producción: utillaje de cocina y maquinaria |
| **4. Consumibles y Un Solo Uso** | Consumibles y Un Solo Uso | Desechables, envases, take-away |
| **5. Sanidad, Salud y Protección** | Sanidad, Salud y Protección | EPI, protección, higiene sanitaria |
| **6. Equipamiento y Automoción** | Mobiliario · Automoción | Mobiliario de local + línea automoción (química/limpieza vehículo) |

> **Nota para Backend/SEO:** los "universos" son una **capa de presentación** (agrupador en mega-menú/home). En BD siguen existiendo los Departamentos como nivel 1 del árbol. No se crean URLs nuevas obligatorias para universos; opcionalmente `/c/limpieza-e-higiene` como *landing* de universo (decisión SEO). Las URLs de Departamento/Categoría/Subcategoría se conservan tal cual (ver `frontend.md §1`).

### 1.3 Accesos transversales (fuera de los 6 universos)
Elementos que **no** son taxonomía de producto y por tanto **salen del mega-menú de departamentos** y se ubican como entradas separadas (utility nav / segunda fila):

- **Marcas** (índice de ~75 marcas, incl. propias NG) → utility, no en el árbol.
- **Novedades · Ofertas · Outlet** → vistas filtradas transversales (flags), agrupadas bajo un único punto de entrada **"Destacados"** o como *pills* secundarias, no como 3 ítems sueltos en la barra principal.
- **Noticias/Blog**, **Quiénes Somos**, **Contacto** → nav secundaria/top-bar y footer.

### 1.4 Taxonomía y nomenclatura (reglas)
- **Corregir el nombre de marca:** "Nuñez" → **"Núñez"** en toda la UI (también lo pide SEO).
- **Sentence case** en etiquetas de navegación (no MAYÚSCULAS sostenidas como hoy "QUIMICA INDUSTRIAL"): mejora legibilidad y escaneo. Ej.: "Química industrial", "Cristalería", "Aseo personal".
- **Nombres orientados al usuario**, consistentes: preferir sustantivo de producto/función ("Celulosa y dispensadores" en vez de "Celulosa Industrial y Dispensadores").
- **Slugs:** se conservan los actuales para no perder SEO (`/quimica-industrial`, `/ambientadores-e-insecticidas/insecticidas`); la etiqueta visible puede pulirse sin cambiar el slug.
- **Migas (breadcrumb)** reflejan SIEMPRE el path real de catálogo (Departamento › Categoría › Subcategoría › Producto), no el universo.

### 1.5 Mapa del sitio (resumen jerárquico)
```
Home
├─ Catálogo (6 universos → 13 departamentos)
│   └─ [departamento]                 (ej. /quimica-industrial)        → lista de Categorías
│       └─ [categoria]                (ej. /ambientadores-e-insecticidas) → lista de Subcategorías
│           └─ [subcategoria]         (ej. /.../insecticidas)            → LISTADO DE PRODUCTOS (+filtros)
│               └─ producto/[slug]    (ficha)                            → Añadir a solicitud
├─ Marcas → [marca] → productos de la marca
├─ Destacados → Novedades / Ofertas / Outlet
├─ Buscador (?terminobuscar=) → resultados + filtros
├─ Solicitud (carrito) → Enviar solicitud de pedido/presupuesto → Gracias
├─ Área Clientes (OPCIONAL) → Acceso / Registro / Cuenta (pedidos, datos, listas de compra)
├─ Noticias → [slug]
├─ Quiénes somos · Contacto
└─ Legales (cómo comprar, condiciones, aviso legal, privacidad, cookies)
```

---

## 2. Navegación y mega-menú

### 2.1 Estructura del header (3 capas)
```
┌─ TOP BAR (utility, fina) ──────────────────────────────────────────────┐
│ Tel 957 65 53 88 · info@nunezgil.com    │  Quiénes somos · Contacto · Área Clientes │
├─ HEADER PRINCIPAL (sticky) ────────────────────────────────────────────┤
│ [Logo Núñez Gil]   [══ BUSCADOR (protagonista, ancho) ══ 🔍]   [👤] [🛒 n] │
├─ NAV PRINCIPAL (barra de departamentos) ───────────────────────────────┤
│ Catálogo ▾ | Limpieza | Hostelería ▾ | Consumibles | Sanidad | Marcas | Destacados ▾ │
└─────────────────────────────────────────────────────────────────────────┘
```
- **Buscador = protagonista** del header (ancho, centrado), porque es el camino principal en un catálogo grande. (Hoy está minimizado tras una lupa.)
- **Carrito → "Solicitud"**: el icono 🛒 muestra el nº de líneas y abre el **drawer de solicitud** (no "cesta de compra con pago").
- **Sticky header** con *shrink* al hacer scroll (logo + buscador + iconos permanecen accesibles).

### 2.2 Mega-menú (desktop): patrón y comportamiento
Disparador único **"Catálogo ▾"** (y opcionalmente atajos a los universos más usados). Al abrir, panel a ancho de contenedor organizado en **columnas por universo**:

```
┌──────────────────────────  MEGA-MENÚ "Catálogo"  ──────────────────────────┐
│ LIMPIEZA E HIGIENE     HOSTELERÍA·MESA/SALA   COCINA·MAQUINARIA   CONSUMIBLES│
│  Química industrial      En la mesa             En la cocina       Un solo uso│
│  Artículos de limpieza   Cristalería            Maquinaria host.   Envases   │
│  Celulosa y dispensad.   En la sala                                ...        │
│  Aseo personal                                                                │
│                                                                               │
│ SANIDAD Y PROTECCIÓN   EQUIPAM. Y AUTOMOCIÓN   ┌─ Destacado (banner) ──────┐ │
│  Sanidad/salud/protec.   Mobiliario            │ +10.000 refs · desde 1994 │ │
│                          Automoción            │ [Ver Novedades →]         │ │
└───────────────────────────────────────────────┴────────────────────────────┘
```
- **Un solo panel** (no 13 dropdowns sueltos). Máx. 6 columnas; cada columna = 1 universo con sus departamentos.
- **Profundidad 1 en el menú:** el mega-menú muestra Universo → Departamento. Las **Categorías** (nivel 2) se ven al entrar en la página de Departamento (no se anidan 3 niveles en hover, que es inusable). Esto evita la sobrecarga actual.
- **Apertura:** hover *y* click/teclado (no solo hover — requisito de a11y y táctil). Retardo de cierre ~150 ms para evitar cierres accidentales (`prefers-reduced-motion` respeta sin animación).

### 2.3 Mega-menú (móvil): drawer jerárquico
- Botón **hamburguesa** abre **drawer a pantalla completa** (off-canvas desde la izquierda), con foco atrapado (focus trap) y cierre por `Esc`/overlay/botón ✕.
- **Navegación tipo "drill-down" (acordeón apilado o paneles deslizantes):**
  - Nivel 0: lista de **6 universos**.
  - Tap en universo → **panel desliza** a sus Departamentos (con botón "‹ Volver").
  - Tap en departamento → navega a la página del Departamento (allí elige Categoría → Subcategoría).
- **Buscador fijo arriba del drawer** (de nuevo: buscar primero).
- Accesos a "Marcas / Destacados / Área Clientes / Contacto" al fondo del drawer.

### 2.4 Accesibilidad del menú (resumen; detalle en §6)
- `<nav aria-label="Principal">` con `<ul>/<li>` reales.
- Disparadores `<button aria-expanded aria-controls>`; panel con `role="region"`/`aria-label`.
- Teclado: `Tab` entra, `Enter`/`Espacio` abre, flechas mueven entre ítems, `Esc` cierra y devuelve foco al disparador, `Home`/`End` saltan.
- Foco visible siempre; sin "trampas" salvo el focus trap intencional del drawer móvil.

---

## 3. Flujos de usuario clave (paso a paso)

### 3.1 Flujo principal — Buscar → Ficha → Añadir → Enviar solicitud
Este es el flujo de conversión central. **Sin login obligatorio.**
```
1. Usuario escribe en el BUSCADOR (header)         → autosuggest muestra productos/categorías
2. Selecciona sugerencia  ó  pulsa Enter           → (a) ficha directa  ó  (b) resultados + filtros
3. [si resultados] filtra por marca/disponibilidad → grid de ProductCards (precio visible, sin login)
4. Abre FICHA de producto                          → ve referencia, marca, precio "IVA no incl.", stock
5. Ajusta cantidad y pulsa "Añadir a solicitud"    → toast de confirmación + contador 🛒 sube
   (drawer de solicitud se puede abrir para revisar; "seguir comprando" lo cierra)
6. Abre la SOLICITUD (página /carrito → renombrada "Tu solicitud")
   → líneas editables (cantidad/eliminar), subtotal SIN IVA, aviso de envío gratis (>100€ Córdoba / >200€ resto)
7. Pulsa "Enviar solicitud de pedido/presupuesto"  → formulario de datos de contacto/entrega
   → OPCIÓN A: rellenar datos como INVITADO (nombre, empresa/CIF opc., email, tel, dirección, observaciones)
   → OPCIÓN B: "Acceder / registrarme" para autocompletar y guardar histórico (opcional, no obligatorio)
8. Confirmar y enviar                              → POST /pedidos (tipo: solicitud) → email a Núñez Gil + al cliente
9. Página "GRACIAS"                                → resumen, nº de solicitud, próximos pasos
   ("Te contactaremos para confirmar disponibilidad y presupuesto"), CTA seguir explorando
```
**Notas UX:**
- La etiqueta del CTA es **"Enviar solicitud de pedido/presupuesto"** (no "Pagar"/"Finalizar compra"). No se pide tarjeta ni pasarela.
- Mensaje de expectativa claro en la página Gracias: esto **inicia una solicitud**, Núñez Gil confirma disponibilidad/precio final. Reduce ansiedad y soporte.
- El carrito persiste en `localStorage` para invitados (definido en `frontend.md`).

### 3.2 Flujo alternativo — Navegar por catálogo
```
Home → (mega-menú "Catálogo" o tarjeta de universo) → Departamento
     → Categoría → Subcategoría (LISTADO de productos + filtros) → Ficha → [continúa en 3.1 paso 5]
```
- En cada nivel: **breadcrumb** + título H1 del nivel + bloque de hijos (CategoryCards) o productos (ProductGrid).
- Las páginas de Departamento/Categoría muestran **rejilla de hijos** (no productos sueltos); solo la **Subcategoría** (hoja del árbol) muestra el listado de productos con filtros y paginación.

### 3.3 Flujo — Registro / Login Área Clientes (OPCIONAL)
```
Punto de entrada: top-bar "Área Clientes"  ó  paso 7 del flujo de solicitud ("Acceder/registrarme")
LOGIN:    email + contraseña → sesión httpOnly (server) → vuelve a donde estaba (deep-link de retorno)
REGISTRO: alta B2B → nombre/razón social, CIF (opc.), email, tel, dirección fiscal/envío, contraseña
          → validación inline (RHF+Zod) → confirmación
RECUPERAR: email → enlace de reset (sin enumeración de usuarios, lo valida Seguridad)
CUENTA (tras login): datos fiscales · histórico de pedidos/solicitudes · repetir solicitud · listas de compra recurrente
```
- **El registro NUNCA es prerrequisito** para ver precios ni para enviar una solicitud. Es un acelerador (autocompletar, histórico, repetir pedido) — diferenciador B2B clave.
- Al hacer login con carrito de invitado activo → **fusionar** carrito local con el de servidor (definido en `frontend.md`).

### 3.4 Flujo — Contacto / Solicitud de presupuesto general
```
Contacto (top-bar/footer) → formulario (nombre, email, asunto, mensaje, acepta privacidad) + reCAPTCHA v3
→ envío → toast/role=alert de éxito → email a info@nunezgil.com
Mapa de tienda (lazy, OSM sin token secreto). NAP visible (dirección, tel, horario).
```
- Doble vía de presupuesto: (a) **desde la solicitud** (carrito con productos concretos, §3.1) y (b) **contacto libre** (consulta abierta). Ambos terminan en email a Núñez Gil.

### 3.5 Diagrama de estados del CTA de producto
```
[Añadir a solicitud]  --click-->  [Añadiendo… (spinner)]  --ok-->  [✓ Añadido (toast)]  -->  [En tu solicitud (n)]
                                                          --error-> [Reintentar (role=alert)]
agotado → botón deshabilitado + "Avísame / Consultar disponibilidad" (link a contacto)
```

---

## 4. Estrategia responsive / mobile-first

### 4.1 Enfoque
Diseño **mobile-first** real (corrige el "responsive apretado de Bootstrap 3"). Se diseña primero la columna estrecha y se progresan columnas/affordances al ensanchar. Móvil prioriza: buscador, CTA de añadir, y lectura de precio/referencia.

### 4.2 Breakpoints (alineados con Tailwind por defecto)
| Token | Min-width | Uso estructural |
|---|---|---|
| (base) | 0 | 1 columna. Hamburguesa. Buscador full-width bajo logo. ProductGrid 2 col. |
| `sm` | 640px | ProductGrid 2 col holgado; tipografía/spacing sube un escalón. |
| `md` | 768px | Aparece sidebar de departamentos colapsable; ProductGrid 3 col; filtros en panel lateral plegable. |
| `lg` | 1024px | **Nav horizontal + mega-menú** (se oculta hamburguesa). ProductGrid 4 col. Sidebar fija en catálogo. |
| `xl` | 1280px | Contenedor máx; ProductGrid 4–5 col; más aire. |
| `2xl` | 1536px | Contenedor centrado con márgenes amplios (no estirar el contenido a lo ancho). |

### 4.3 Reglas de transformación por componente
| Componente | Móvil (base) | Tablet (`md`) | Desktop (`lg`+) |
|---|---|---|---|
| Navegación | Hamburguesa → drawer drill-down | Hamburguesa (o nav compacta) | Nav horizontal + mega-menú |
| Buscador | Full-width, fila propia bajo el logo | En header, ancho medio | En header, protagonista ancho |
| Catálogo (subcat) | Filtros en **bottom-sheet** ("Filtrar") | Filtros en panel lateral plegable | Sidebar filtros fija + grid |
| ProductGrid | 2 col | 3 col | 4–5 col |
| Ficha producto | Galería arriba → datos → CTA **sticky abajo** | 2 col (galería \| datos) | 2 col + bloque relacionados |
| Solicitud (carrito) | Líneas en *cards* apiladas; resumen sticky abajo | Tabla + resumen lateral | Tabla + resumen lateral sticky |
| Footer | Acordeones colapsables | 2–3 columnas | 4 columnas + logos FEDER |

- **CTA táctil mínimo 44×44 px** (WCAG 2.5.5 / target size). Botón "Añadir" y stepper de cantidad cumplen.
- **CTA sticky en móvil** en la ficha (barra inferior con precio + "Añadir") para no perder la acción al hacer scroll.

---

## 5. Fundamentos CSS/Tailwind — tokens ESTRUCTURALES

> Solo estructura (espaciado, grid, layout, radios, sombras de elevación, z-index, motion). **Los valores de color y tipografía (familia, escala tipográfica final, pesos) los define el UI Designer.** Aquí se dejan *placeholders* y la **escala** que el UI rellenará.

### 5.1 Convención de tokens (en `globals.css` con `@theme` / CSS vars)
```css
:root {
  /* ESPACIADO — escala 4px (base estructural; el UI puede densificar) */
  --space-1: 0.25rem; --space-2: 0.5rem;  --space-3: 0.75rem; --space-4: 1rem;
  --space-6: 1.5rem;  --space-8: 2rem;    --space-12: 3rem;   --space-16: 4rem;

  /* CONTENEDORES (anchos máx de layout) */
  --container-sm: 640px; --container-md: 768px;
  --container-lg: 1024px; --container-xl: 1280px; --container-2xl: 1536px;
  --container-content: 1280px;      /* ancho máx por defecto del contenido */
  --gutter: var(--space-4);         /* padding lateral del contenedor (móvil) */

  /* RADIOS / ELEVACIÓN (estructural; tono de sombra lo afina UI) */
  --radius-sm: 0.25rem; --radius-md: 0.5rem; --radius-lg: 0.75rem; --radius-full: 9999px;
  --elev-1: 0 1px 2px rgba(0,0,0,.06);
  --elev-2: 0 4px 12px rgba(0,0,0,.08);
  --elev-3: 0 12px 32px rgba(0,0,0,.12);

  /* Z-INDEX (capas — fuente única de verdad) */
  --z-base: 0; --z-sticky-header: 100; --z-megamenu: 200;
  --z-drawer-overlay: 300; --z-drawer: 310; --z-toast: 400; --z-modal: 500;

  /* MOTION (duraciones; UI puede ajustar curvas) */
  --dur-fast: 120ms; --dur-base: 200ms; --dur-slow: 320ms;
  --ease-standard: cubic-bezier(.2,0,0,1);

  /* TARGET TÁCTIL mínimo */
  --tap-min: 44px;

  /* COLOR / TIPOGRAFÍA → PLACEHOLDERS que rellena el UI Designer */
  --color-brand: /* UI: azul corporativo Núñez Gil */ ;
  --color-bg: ; --color-surface: ; --color-text: ; --color-text-muted: ;
  --color-border: ; --color-accent: ; --color-success: ; --color-danger: ;
  --font-sans: /* UI: familia base */ ; --font-display: ;
  /* Escala tipográfica (ratios sugeridos; el UI fija familia/pesos):
     --text-xs .75 / sm .875 / base 1 / lg 1.125 / xl 1.25 / 2xl 1.5 / 3xl 1.875 / 4xl 2.25 rem */
}
```

### 5.2 Primitivas de layout (clases utilitarias estructurales)
```css
.container { width:100%; max-width:var(--container-content); margin-inline:auto; padding-inline:var(--gutter); }

/* Catálogo: sidebar (departamentos/filtros) + contenido */
.layout-catalog { display:grid; grid-template-columns:1fr; gap:var(--space-6); }
@media (min-width:1024px){ .layout-catalog { grid-template-columns:260px 1fr; } }

/* Rejilla de productos auto-fit (estructura; nº de columnas por viewport en §4.2) */
.product-grid { display:grid; gap:var(--space-4);
  grid-template-columns:repeat(2,minmax(0,1fr)); }
@media (min-width:768px){ .product-grid { grid-template-columns:repeat(3,minmax(0,1fr)); } }
@media (min-width:1024px){ .product-grid { grid-template-columns:repeat(4,minmax(0,1fr)); } }

/* Ficha de producto: galería | datos */
.layout-pdp { display:grid; gap:var(--space-8); grid-template-columns:1fr; }
@media (min-width:768px){ .layout-pdp { grid-template-columns:minmax(0,1fr) minmax(320px,420px); } }
```

### 5.3 Reglas de uso (para el Frontend Dev)
- **Sin valores mágicos:** todo spacing/layout sale de los tokens (`var(--space-*)`, utilidades Tailwind equivalentes).
- **`aspect-square` + `object-contain`** en imágenes de producto (fondo neutro) → reserva espacio, CLS ~0 (coordina con `next/image` de `frontend.md`).
- **`gap` sobre `margin`** para separaciones en grids/flex.
- **Z-index solo desde la escala** `--z-*` (evita guerras de z-index).
- Mapeo a Tailwind: estos tokens se exponen vía `@theme`/config para usar `gap-4`, `max-w-content`, `z-megamenu`, etc., sin hardcodear.

---

## 6. Patrones de accesibilidad (WCAG 2.1 AA)

> Corrigen SEO1 (sin H1), imágenes sin alt y la falta de jerarquía del informe. Verificación en CI con `axe-core`/Lighthouse (objetivos en `frontend.md §0`).

### 6.1 Landmarks y estructura de página (en RootLayout)
```html
<a class="skip-link" href="#contenido">Saltar al contenido</a>
<header role="banner"> … top-bar, buscador, nav … </header>
<nav aria-label="Principal"> … </nav>            <!-- mega-menú -->
<nav aria-label="Migas de pan"> … </nav>          <!-- breadcrumb (en páginas internas) -->
<main id="contenido"> … </main>                   <!-- un único <main> -->
<aside aria-label="Departamentos"> … </aside>     <!-- sidebar catálogo -->
<footer role="contentinfo"> … </footer>
```
- **Skip-link** visible al enfocar, salta a `#contenido`.
- Un único `<main>` y un único **`<h1>` por página** (mapa en §6.2).

### 6.2 Jerarquía de encabezados (H1 por plantilla)
| Página | H1 (único) | H2/H3 |
|---|---|---|
| Home | "Núñez Gil — Mayorista de hostelería e industrial" (puede integrarse en hero) | H2 por sección (Universos, Novedades, Ofertas, Actualidad) |
| Departamento | Nombre del departamento (ej. "Química industrial") | H2 "Categorías", H3 nombre de cada categoría |
| Categoría | Nombre de la categoría | H2 "Subcategorías" |
| Subcategoría (listado) | Nombre de la subcategoría | H2 "Filtros", H2 "Productos" |
| Ficha producto | Nombre del producto | H2 "Detalles", "Productos relacionados" |
| Buscador | "Resultados para «{término}»" | H2 secciones |
| Marcas | "Marcas" | H2 grupos / H3 marca |
| Solicitud | "Tu solicitud" | H2 "Resumen" |
| Contacto | "Contacto" | H2 "Escríbenos", "Dónde estamos" |

- Componente `<Heading level={n}>` que **fuerza orden** y no permite saltos (coordina con `frontend.md`).

### 6.3 Foco, teclado y interacción
- **`:focus-visible`** con anillo de foco de alto contraste en TODO elemento interactivo (el color lo fija UI, pero el anillo es obligatorio y ≥2px).
- **Orden de tabulación lógico** = orden visual; sin `tabindex` positivos.
- **Mega-menú** y **drawer móvil**: patrón ARIA de disclosure/menu (`aria-expanded`, `aria-controls`); `Esc` cierra y restaura foco; focus trap solo en drawer/modal abiertos.
- **Buscador autosuggest** = `role="combobox"` + `aria-autocomplete="list"` + `aria-expanded` + `aria-activedescendant`; lista `role="listbox"`, opciones `role="option"`; navegación con ↑/↓, Enter selecciona, Esc cierra; nº de resultados anunciado con `aria-live="polite"`.
- **Toast** de "añadido a solicitud" = `role="status"`/`aria-live="polite"`; errores = `role="alert"`.

### 6.4 Contenido e imágenes
- **`alt` en toda imagen de contenido**: producto = `"{nombre} — {marca}"`; categorías = nombre; decorativas/institucionales en footer = `alt=""` si son puramente decorativas o el nombre si aportan info (logos FEDER llevan alt descriptivo). Cero tolerancia a imágenes de producto sin alt (hoy 117/205 en /marcas).
- **Contraste AA** ≥4.5:1 texto normal / ≥3:1 texto grande y elementos UI — el UI Designer valida el azul corporativo sobre fondo; este doc lo exige como gate.
- **`prefers-reduced-motion`**: desactivar autoplay de carruseles y transiciones del mega-menú.
- **Formularios:** `<label>` asociado a cada campo; errores con `aria-invalid` + `aria-describedby`; agrupaciones con `<fieldset>/<legend>`.
- **Banner de cookies** rediseñado **no intrusivo** (barra inferior discreta, foco gestionado, no bloquea contenido) — corrige el rojo intrusivo actual.

---

## 7. Wireframes textuales

### 7.1 Home
```
┌ TOP BAR: Tel · email                         Quiénes somos · Contacto · Área Clientes ┐
├ HEADER (sticky): [Logo NG]   [═══ Buscar productos, marcas, referencia… 🔍 ═══]  👤  🛒(0) ┤
├ NAV: Catálogo ▾ · Limpieza · Hostelería ▾ · Consumibles · Sanidad · Marcas · Destacados ▾ ┤
├ BARRA DE CONFIANZA (fina): 🚚 Envío gratis >100€ Córdoba / >200€ península · 📦 +10.000 refs · 🗓 Desde 1994 ┤
│
│  HERO (H1 + propuesta de valor + CTA — NO un slider mudo)
│  ┌───────────────────────────────────────────────────────────────────┐
│  │ H1: Mayorista de hostelería e industrial desde 1994                 │
│  │ Sub: +10.000 referencias en limpieza, hostelería y un solo uso.     │
│  │ [Buscador grande]   [Ver catálogo →]                                │
│  └───────────────────────────────────────────────────────────────────┘
│
│  H2 "Explora por universo"  → 6 tarjetas (Limpieza · Mesa/Sala · Cocina/Maquinaria ·
│                                Consumibles · Sanidad · Equipam./Automoción)  [grid 2/3/6 col]
│
│  H2 "Novedades"   → carrusel de ProductCards (con precio; SIN cards vacías)
│  H2 "Ofertas"     → grid ProductCards   |   H2 "Outlet" → grid ProductCards
│  H2 "Marcas destacadas" → tira de logos (lazy)
│  H2 "Actualidad"  → 3 últimas noticias (reales, no placeholder)
│
├ FOOTER: [AYUDA] [LEGAL] [Contacto/NAP] [Logos FEDER/Junta (obligatorio)] · "Síguenos" (real u omitido) ┤
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

### 7.2 Página de Categoría / Subcategoría (listado)
```
HEADER + NAV (igual que home)
Breadcrumb: Inicio › Química industrial › Ambientadores e insecticidas › Insecticidas
H1: Insecticidas

┌ SIDEBAR (lg+, sticky) ─┐  ┌ CONTENIDO ───────────────────────────────────────────┐
│ Departamentos          │  │  Barra superior: "128 productos"  ·  Ordenar ▾         │
│  ▸ Química industrial   │  │  (móvil: botón "Filtrar" → bottom-sheet)               │
│    · Ambientadores      │  │                                                        │
│    · Insecticidas ◀     │  │  H2 Filtros (en sidebar lg+):                          │
│  ▸ Artículos limpieza   │  │   [ ] Marca (Quimxel, Tork…)  [ ] Disponibilidad        │
│  …                      │  │   Precio [min]–[max]                                   │
│                         │  │                                                        │
│ FILTROS (lg+)           │  │  H2 Productos → PRODUCT GRID (2/3/4 col)                │
│  Marca ▾                │  │   ┌ Card ┐ ┌ Card ┐ ┌ Card ┐ ┌ Card ┐                  │
│  Disponibilidad ▾       │  │   │[img] │ │      │ │      │ │      │                  │
│  Precio                 │  │   │Nombre│ Ref · Marca · 5,67€ "IVA no incl." · ●stock │
│                         │  │   │[Añadir a solicitud]                                │
└─────────────────────────┘  │   Paginación  ‹ 1 2 3 … ›                              │
                              └────────────────────────────────────────────────────┘
```
- Página de **Departamento/Categoría** (niveles superiores): igual layout pero el contenido es **CategoryCards** (hijos) en vez de ProductGrid.
- Si una subcategoría no tiene productos → estado vacío con buscador + CTA "Consultar disponibilidad" (sin callejón sin salida).

### 7.3 Ficha de producto (PDP)
```
HEADER + NAV
Breadcrumb: Inicio › Cristalería › Cristal refresco y cerveza › Vaso refresco 31 cl Spain Quartz C/6

┌ GALERÍA ───────────────┐   ┌ DATOS (sticky lg+) ──────────────────────────────┐
│  [Imagen principal]     │   │ H1: Vaso refresco 31 cl Spain Quartz C/6          │
│  [zoom/lightbox]        │   │ Referencia: 286-V113310ER6                        │
│  [miniaturas]           │   │ Marca: NG Celulosa Hostelería  (→ /marcas/ng…)    │
│  (aspect-square,        │   │ ───────────────────────────────────────────────  │
│   object-contain,       │   │ 5,67 €   (I.V.A. no incluido)                     │
│   fondo neutro)         │   │ 0,94 € / unidad  (I.V.A. no incluido)             │
│                         │   │ ● Disponibilidad: En stock                        │
│                         │   │ [−] [ 1 ] [+]   [  Añadir a solicitud  ]          │
│                         │   │ ♡ Guardar en lista (si login)                     │
│                         │   │ Aviso envío gratis >100€ Córdoba / >200€ penín.   │
└─────────────────────────┘   └───────────────────────────────────────────────────┘

H2 Detalles / descripción (texto, características)
H2 Productos relacionados → ProductCards (misma subcategoría / misma marca)

[Móvil: barra CTA STICKY abajo → "5,67€ · Añadir a solicitud"]
```
- **JSON-LD Product + BreadcrumbList** (coordina con SEO/`frontend.md`).
- "Añadir a lista de compra" solo visible si hay sesión (valor B2B; no bloquea nada si no la hay).

---

## 8. Handoff y dependencias

### 8.1 Qué entrega este documento (estructura/comportamiento)
- AI: reagrupación 13→6 universos manteniendo árbol de 3 niveles y URLs.
- Navegación: header de 3 capas, mega-menú monopanel desktop, drawer drill-down móvil, todo accesible por teclado.
- Flujos paso a paso: solicitud (sin pago, sin login obligatorio), login/registro opcional, contacto/presupuesto.
- Responsive: breakpoints y reglas de transformación por componente.
- Tokens **estructurales** (espaciado, grid, contenedores, radios, elevación, z-index, motion, tap-target).
- Patrones a11y: landmarks, H1 por plantilla, foco/teclado, combobox del buscador, alt, contraste como gate.
- Wireframes textuales de home, categoría/subcategoría y ficha.

### 8.2 Qué necesita del UI Designer (`diseno-ui.md`, pendiente)
- Rellenar los **placeholders de color y tipografía** del §5.1 (azul corporativo, neutros, acento, estados; familia y escala tipográfica final, pesos).
- Validar **contraste AA** del azul corporativo (gate de §6.4).
- Estilo visual de: botón "Añadir a solicitud", badges de disponibilidad/oferta, cards, mega-menú, banner de cookies no intrusivo, hero.

### 8.3 Qué consume el Frontend Dev (`frontend.md`, ✅)
- Mapea estos componentes/flujos a la arquitectura Server/Client ya definida (mega-menú, ProductGrid, AddToCartButton, CartDrawer, formularios) y al contrato de datos del §6 de `frontend.md`.
- Renombrados de UI: "Cesta/Carrito" → **"Solicitud"**; CTA final → **"Enviar solicitud de pedido/presupuesto"**.

### 8.4 Notas para Backend (`backend.md`, ✅) / SEO (`seo.md`, ✅)
- "Universos" = capa de presentación; el árbol de Departamentos (nivel 1) se mantiene en BD.
- Pedido tipo **solicitud** (sin pago) como modo por defecto; invitado permitido (datos en el POST, sin requerir cuenta).
- Breadcrumb/JSON-LD usan el path real de catálogo, no el universo.
- Corregir "Nuñez" → "Núñez" en toda etiqueta.

---

**Estado:** Entregable UX completo. Pendiente el cruce con `diseno-ui.md` (UI Designer) para fijar valores visuales en los placeholders del §5.1.
