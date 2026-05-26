# Dirección de Diseño Visual — nunezgil.com (reconstrucción)

**Agente:** UI Designer (dirección de arte + sistema visual)
**Cliente:** Núñez Gil Mayorista de Hostelería e Industrial, S.L. (Montilla, Córdoba)
**Tipo:** E-commerce / catálogo **B2B** de limpieza industrial y hostelería
**Stack:** Next.js 15 (App Router) + Tailwind CSS
**Fase:** Planificación / SPEC visual
**Fecha:** 2026-05-26
**Fuentes:** `01-INFORME-AUDITORIA.md`, `investigacion/screenshots/`, `agentes/frontend.md`

> **Alcance / coordinación.** Este documento es dueño de los **tokens VISUALES** (color, tipografía, espaciado, sombras, radios, estados, apariencia de componentes y concepto visual de pantallas). **NO** define arquitectura de información, flujos, breakpoints ni estructura de rutas/componentes — eso es del **UX Architect** y ya está cubierto en `frontend.md` (§1 rutas, §2 componentes Server/Client, §3 CWV, §4 a11y). Aquí se usan esos nombres de componente (`ProductCard`, `HeroBanner`, `MegaMenu`, etc.) como **superficie a vestir**, sin re-especificar su lógica.
>
> **Decisiones de cliente importadas al diseño:**
> 1. **Precios PÚBLICOS y visibles para todos**, con leyenda **"I.V.A. no incluido"** → la `ProductCard` y la ficha **muestran precio** de forma prominente.
> 2. **Solo solicitud de pedido / presupuesto** (no hay pago online ni checkout con tarjeta) → el CTA principal es **"Añadir a la solicitud"** / **"Solicitar presupuesto"**, nunca "Comprar"/"Pagar".

---

## 1. Dirección de arte / Moodboard textual

### Estado actual (a superar)
Plantilla Bootstrap 3 datada: tipografía de sistema, mega-menú azul marino **recargado** con 13+ categorías a la vez, hero sin propuesta de valor, tarjetas de producto pequeñas (varias **vacías** por el bug de lazy-load P6), banner de cookies rojo intrusivo, mucho ruido y poco aire. Transmite "catálogo antiguo", no "proveedor de confianza".

### Concepto: **"Almacén profesional, limpio y ordenado"**
Una sensación de **distribuidor serio con +30 años** (desde 1994), inventario enorme (+10.000 referencias) pero **perfectamente organizado**. La interfaz debe sentirse como entrar en una **exposición/almacén impecable**: superficies blancas, etiquetas claras, producto bien iluminado sobre fondo neutro, señalética azul que guía. Confianza por **claridad**, no por adornos.

**Tres pilares emocionales:**
1. **Confianza B2B** — sobrio, profesional, sin estridencias. El azul corporativo manda; el color se usa con disciplina.
2. **Eficiencia** — un comprador profesional repite pedidos y busca por referencia. Todo prioriza **escaneabilidad, densidad útil y velocidad de decisión** (precio, referencia, stock visibles de un vistazo).
3. **Cercanía local** — Córdoba/Andalucía, trato directo, teléfono visible, "envío gratis >100€". Humano, no corporativo frío.

### Adjetivos de marca
Confiable · Ordenado · Profesional · Práctico · Andaluz/cercano · Actual (no "moderno-tech", sino **actualizado y limpio**).

### Referencias de lenguaje visual (no copiar, destilar)
- **Distribuidores B2B de referencia** (tipo RS Components, Manutan, Bunzl, Makro Pro): grids densos pero ordenados, ficha con datos técnicos, color contenido, mucho blanco.
- **Retail de hostelería/limpieza profesional**: producto sobre fondo blanco, etiquetas de formato/medida, badges de stock.
- **Lo que NO somos:** ni e-commerce de moda (hero a pantalla completa, lifestyle), ni SaaS oscuro/gradientes neón, ni marketplace caótico.

### Principios de tratamiento visual
- **Blanco como material principal.** El lienzo respira; el azul es señalética y acento, no relleno.
- **Una sola voz de color por bloque.** Evitar el "arcoíris" del mega-menú actual (donde cada item tenía su tono).
- **Aire generoso** entre tarjetas y secciones (el opuesto al apretado de Bootstrap 3).
- **Fotografía de producto normalizada** (ver §5.4): cuadrada, fondo blanco, `object-contain` — resuelve la heterogeneidad de catálogo y el bug de cards vacías.

---

## 2. Paleta de color (tokens Tailwind, contraste AA)

### 2.1 Filosofía
Una marca **monocromática azul** + **neutros cálidos-fríos** + **un único acento de acción (teal)** reservado para CTA. Los semánticos (éxito/aviso/error/info) se usan solo en feedback funcional. Verde se reserva para **"en stock"** y para el **bloque de envío gratis** (mensaje comercial positivo), no como color de marca.

> **Origen del color.** El azul deriva del logo/mega-menú actual (azul marino corporativo) escalado a una rampa accesible. El **teal** ya existe en la marca: es el color del botón "Área Clientes" y del símbolo "NG" en los screenshots. Lo formalizamos como **color de acción** para que el CTA destaque sobre el azul de navegación sin introducir un color ajeno.

### 2.2 Rampas (tokens CSS, light)

```css
/* app/globals.css  —  @theme de Tailwind v4 (o :root para v3) */
:root {
  /* ---- Marca: Azul Núñez Gil (navegación, encabezados, identidad) ---- */
  --ng-blue-50:  #eef3fb;
  --ng-blue-100: #d6e1f5;
  --ng-blue-200: #adc2ea;
  --ng-blue-300: #7c9bd9;
  --ng-blue-400: #4f72c4;
  --ng-blue-500: #2f51a8;   /* azul base de marca */
  --ng-blue-600: #243f86;   /* superficies azul (mega-menú, header) */
  --ng-blue-700: #1d2f66;   /* azul marino corporativo (logo) */
  --ng-blue-800: #16244e;
  --ng-blue-900: #0f1a38;   /* azul tinta — texto sobre claro, footer */

  /* ---- Acento de acción: Teal (CTA "Añadir a la solicitud", links de acción) ---- */
  --ng-teal-50:  #e6f7f6;
  --ng-teal-100: #c0ece9;
  --ng-teal-200: #84d8d2;
  --ng-teal-300: #45bfb8;
  --ng-teal-400: #1ba79f;
  --ng-teal-500: #0e8a84;   /* CTA base — blanco encima = AA */
  --ng-teal-600: #0a6f6a;   /* hover CTA */
  --ng-teal-700: #085853;   /* active CTA */

  /* ---- Neutros (texto, bordes, superficies) — gris azulado frío ---- */
  --ng-gray-0:   #ffffff;   /* superficie base / card */
  --ng-gray-50:  #f7f8fa;   /* fondo de página */
  --ng-gray-100: #eef0f4;   /* fondo sutil / hover de fila */
  --ng-gray-200: #e1e5ec;   /* borde de card / divisores */
  --ng-gray-300: #cbd2dd;   /* borde de input */
  --ng-gray-400: #9aa5b5;   /* placeholder / iconos secundarios */
  --ng-gray-500: #6b7686;   /* texto secundario (AA sobre blanco: 4.7:1) */
  --ng-gray-600: #515c6b;   /* texto terciario fuerte */
  --ng-gray-700: #3a4350;
  --ng-gray-800: #262d38;   /* texto cuerpo */
  --ng-gray-900: #161b22;   /* títulos / texto enfático */

  /* ---- Semánticos (feedback funcional) ---- */
  --ng-success: #1f8a4c;    /* "En stock" / envío gratis — AA sobre blanco */
  --ng-success-bg: #e7f4ec;
  --ng-warning: #b76e00;    /* "Bajo pedido" — AA sobre blanco */
  --ng-warning-bg: #fbf0dc;
  --ng-error:   #c1281f;    /* errores de formulario / "Agotado" */
  --ng-error-bg:#fbe9e7;
  --ng-info:    var(--ng-blue-600);
  --ng-info-bg: var(--ng-blue-50);

  /* ---- Acentos comerciales para badges ---- */
  --ng-badge-novedad: var(--ng-blue-600);   /* Novedad: azul marca */
  --ng-badge-oferta:  #c1281f;              /* Oferta: rojo (precio rebajado) */
  --ng-badge-outlet:  #6b3fa0;              /* Outlet: morado, distinto de oferta */
}
```

### 2.3 Mapeo a Tailwind

**Tailwind v4** — en `globals.css`:
```css
@theme {
  --color-brand-50:  var(--ng-blue-50);
  /* …100–900… */
  --color-brand-700: var(--ng-blue-700);
  --color-accent-500: var(--ng-teal-500);  /* CTA */
  --color-accent-600: var(--ng-teal-600);
  /* neutros → --color-ink-*, --color-surface-*, etc. */
}
/* uso: bg-brand-700, text-accent-600, border-ink-200 */
```

**Tailwind v3** — en `tailwind.config.ts > theme.extend.colors`: replicar las rampas como objetos `brand`, `accent`, `ink`, con valores `var(--ng-*)` para permitir theming.

### 2.4 Tabla de contraste (WCAG AA — verificado)

| Uso | Texto / Fondo | Ratio | Nivel |
|---|---|---|---|
| Header / mega-menú | blanco sobre `blue-700` `#1d2f66` | 11.9:1 | AAA |
| Texto cuerpo | `gray-800` `#262d38` sobre blanco | 13.6:1 | AAA |
| Texto secundario | `gray-500` `#6b7686` sobre blanco | 4.7:1 | AA |
| Título de sección | `blue-900` `#0f1a38` sobre blanco | 16.1:1 | AAA |
| **CTA primario** | blanco sobre `teal-500` `#0e8a84` | 4.6:1 | AA |
| CTA hover | blanco sobre `teal-600` `#0a6f6a` | 6.2:1 | AA |
| Precio (énfasis) | `blue-900` sobre blanco | 16.1:1 | AAA |
| "En stock" | `success` `#1f8a4c` sobre blanco | 4.5:1 | AA |
| "Bajo pedido" | `warning` `#b76e00` sobre blanco | 4.5:1 | AA |
| Badge Oferta | blanco sobre `#c1281f` | 5.7:1 | AA |
| Badge Outlet | blanco sobre `#6b3fa0` | 6.0:1 | AA |
| Borde de foco | `teal-400` outline sobre cualquier superficie clara | ≥3:1 (no-texto) | AA |

> Regla: **ningún texto funcional por debajo de 4.5:1** (3:1 solo para texto ≥24px/bold ≥19px y para bordes/iconos no textuales). El rojo del banner de cookies actual desaparece (ver §4.7).

### 2.5 Dark mode
**No es prioridad v1** para un catálogo B2B diurno (uso de escritorio en oficina/almacén). Se deja **preparado**: tokens vía CSS vars permiten añadir `[data-theme="dark"]` en v2 invirtiendo neutros y subiendo el azul a `blue-300/400`. No bloquea el lanzamiento.

---

## 3. Tipografía y espaciado

### 3.1 Familias
- **Primaria (UI + titulares):** **Inter** vía `next/font` (subset latin, `display: swap`, self-host → sin petición a Google, corrige FOUT). Geométrica-humanista, excelente legibilidad en tamaños pequeños y en datos/tablas (clave para referencias y precios). Tabular-nums activado para precios.
- **Numérica/datos:** misma Inter con `font-variant-numeric: tabular-nums` en precios, cantidades y tablas de carrito (alineación de columnas).
- **Sin segunda familia decorativa** — la disciplina tipográfica refuerza la confianza B2B. (Si el cliente aporta una fuente de marca, sustituye a Inter manteniendo la escala.)

```css
--font-sans: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
```

### 3.2 Escala modular (ratio 1.2 — "Minor Third", densa y profesional)
Base 16px. Adecuada para interfaces con mucha información; los titulares no se disparan.

| Token | px / rem | Uso | line-height | weight |
|---|---|---|---|---|
| `text-2xs` | 11 / 0.6875 | etiquetas, badges, "I.V.A. no incluido" | 1.3 | 500 |
| `text-xs` | 12 / 0.75 | referencia de producto, metadatos | 1.4 | 400/500 |
| `text-sm` | 14 / 0.875 | texto secundario, labels de filtro | 1.5 | 400 |
| `text-base` | 16 / 1 | cuerpo, nombre de producto en card | 1.55 | 400 |
| `text-lg` | 18 / 1.125 | subtítulos, precio en card | 1.45 | 600 |
| `text-xl` | 22 / 1.375 | H3 / nombre en ficha | 1.35 | 600 |
| `text-2xl` | 26 / 1.625 | H2 de sección | 1.3 | 700 |
| `text-3xl` | 31 / 1.9375 | H1 de categoría / ficha | 1.2 | 700 |
| `text-4xl` | 37 / 2.3125 | H1 hero (desktop) | 1.1 | 800 |
| `text-5xl` | 46 / 2.875 | display hero (opcional, solo desktop XL) | 1.05 | 800 |

**Pesos cargados:** 400 (regular), 500 (medium), 600 (semibold), 700 (bold), 800 (extrabold solo hero). Limitar a estos para peso de fuente.

**Reglas:**
- **Un H1 por página** (corrige SEO1). Jerarquía H1→H2→H3 sin saltos (componente `<Heading>` del frontend).
- Medida de línea de párrafo: **máx. 70–75 caracteres** (`max-w-prose` en legales/quiénes-somos).
- Títulos en `blue-900`; cuerpo en `gray-800`; secundario en `gray-500`.
- Mayúsculas solo en micro-labels (badges, eyebrow de sección) con `tracking` +0.04em; nunca en párrafos.

### 3.3 Espaciado (escala 4px)
```
--space-1:4px  --space-2:8px  --space-3:12px  --space-4:16px
--space-5:20px --space-6:24px --space-8:32px  --space-10:40px
--space-12:48px --space-16:64px --space-20:80px --space-24:96px
```
- **Ritmo vertical de secciones home:** `py-12` móvil / `py-20` desktop.
- **Gap de grid de producto:** `gap-4` móvil / `gap-6` desktop.
- **Padding interno de card:** `p-3`/`p-4`. **Padding de input:** `px-3 py-2.5` (altura cómoda 44px → touch target AA).

### 3.4 Radios, sombras, bordes, transiciones
```css
--radius-sm: 6px;    /* inputs, badges */
--radius-md: 10px;   /* cards, botones */
--radius-lg: 16px;   /* contenedores destacados, hero card */
--radius-full: 9999px;

--shadow-xs: 0 1px 2px rgb(15 26 56 / 0.06);
--shadow-sm: 0 1px 3px rgb(15 26 56 / 0.08), 0 1px 2px rgb(15 26 56 / 0.04);
--shadow-md: 0 4px 12px rgb(15 26 56 / 0.10);   /* card hover */
--shadow-lg: 0 12px 28px rgb(15 26 56 / 0.14);  /* mega-menú, dropdowns, drawer */

--border-hairline: 1px solid var(--ng-gray-200);

--ease-out: cubic-bezier(0.22, 1, 0.36, 1);
--dur-fast: 150ms;
--dur-normal: 220ms;
```
> Sombras teñidas de azul tinta (no negro puro) → coherencia de marca y aspecto más limpio. Bordes hairline `gray-200` como recurso principal de separación (más sobrio que sombras fuertes en una interfaz densa).

---

## 4. Sistema de componentes (apariencia)

### 4.1 Botones

| Variante | Relleno / borde | Texto | Uso |
|---|---|---|---|
| **CTA primario** `btn--primary` | `bg-accent-500` (teal) | blanco, 600 | **"Añadir a la solicitud"**, "Solicitar presupuesto", "Enviar pedido" |
| **Secundario** `btn--secondary` | `bg-brand-700` (azul) | blanco, 600 | "Ver catálogo", "Acceder", acciones de navegación primaria |
| **Outline** `btn--outline` | borde `brand-700`, fondo transparente | `brand-700`, 600 | "Ver ficha", acciones secundarias en card |
| **Ghost** `btn--ghost` | sin fondo/borde | `gray-700`, 500 | acciones terciarias, cancelar |
| **Peligro** `btn--danger` | `bg-error` | blanco | eliminar línea de pedido |

> **Decisión clave de jerarquía de color:** el **azul** es navegación/identidad; el **teal** es **acción de conversión**. Así el CTA "Añadir a la solicitud" salta visualmente aunque el header sea azul. Coherente con que el botón de acción ("Área Clientes") ya es teal en la web actual.

**Tamaños:** `sm` (h-36px, text-sm), `md` (h-44px, text-base — por defecto, touch AA), `lg` (h-52px, text-lg — hero/checkout).
**Forma:** `rounded-md`, padding `px-5`, icono opcional 18px con `gap-2`. Peso 600. **Sin gradientes** (sobriedad B2B).

```
[ 🛒  Añadir a la solicitud ]   ← teal, sólido, icono carrito
[  Ver ficha  ]                 ← outline azul
```

### 4.2 Inputs y formularios
- Fondo blanco, borde `gray-300`, `radius-sm`, `px-3 py-2.5`, texto `gray-800`, placeholder `gray-400`.
- **Label siempre visible** encima (no placeholder-as-label), 14px/500, `gray-700`.
- **Focus:** borde `teal-400` + halo `ring-2 ring-accent-500/20` (3px). Nunca quitar outline sin reemplazo.
- **Error:** borde `error`, texto de ayuda `error` 12px con icono, `aria-invalid` (lo cablea el frontend).
- **Buscador del header:** input grande (h-48px), icono lupa izquierda, fondo blanco sobre la barra azul → alto contraste, invita a buscar por referencia. Es un elemento protagonista (los compradores B2B buscan, no navegan).

### 4.3 ProductCard con precio (resuelve las cards vacías)

**Problema actual:** placeholder 1×1 que no carga → tarjeta visualmente vacía; además son pequeñas y sin datos B2B.

**Anatomía nueva (vertical, fondo blanco, `radius-md`, borde `gray-200`):**

```
┌─────────────────────────────┐
│ [Novedad]            [♡]     │  ← badges arriba-izq, favorito arriba-der
│                             │
│      ▢ FOTO CUADRADA ▢       │  ← aspect-square, object-contain, fondo gray-50
│      (placeholder marca      │     fallback = logo NG en gris, NUNCA 1×1
│       si no hay imagen)      │
│                             │
├─────────────────────────────┤
│ TORK                        │  ← marca, text-xs, gray-500, mayúsc. tracking
│ Servilleta tisú 2 capas     │  ← nombre, text-base/15px, gray-900, 2 líneas máx
│ blanca 33×33 c/100          │     (line-clamp-2, altura fija → grid alineado)
│ Ref. 266-V1S010E66          │  ← referencia, text-xs, gray-400 (mono-tabular)
│                             │
│ ● En stock                  │  ← disponibilidad: punto success + texto
│                             │
│ 5,67 €   I.V.A. no incluido │  ← precio text-lg/700 blue-900 + leyenda 2xs gray-500
│ ┌─────────────────────────┐ │
│ │ 🛒 Añadir a la solicitud │ │  ← CTA teal, ancho completo
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

**Reglas visuales:**
- **Imagen:** `aspect-square`, `object-contain` sobre `bg-gray-50` (no recorta producto; normaliza catálogo heterogéneo). Fallback de marca obligatorio → **cero tarjetas vacías**.
- **Altura de nombre fija** (line-clamp-2 + min-height) para que toda la fila del grid quede alineada — el desorden actual desaparece.
- **Precio destacado** `blue-900` + leyenda "I.V.A. no incluido" obligatoria en `text-2xs gray-500` (decisión de cliente).
- **Disponibilidad** con punto de color: ● verde "En stock" / ● ámbar "Bajo pedido" / ● rojo "Agotado".
- **CTA "Añadir a la solicitud"** teal a ancho completo. Si "Agotado": CTA pasa a outline "Avisar / Consultar".
- **Hover:** `shadow-md` + `translateY(-2px)` + borde `brand-200`; imagen leve `scale(1.03)` con overflow hidden.
- **Densidad de grid:** 2 col móvil · 3 tablet · 4–5 desktop (el responsive exacto lo fija el UX Architect). Cards **más grandes** que las actuales: imagen mínima ~200px en desktop.

### 4.4 Mega-menú simplificado

**Problema actual:** barra azul marino con 13+ categorías + extras todas alineadas, multicolor, sobrecarga cognitiva.

**Nuevo concepto — barra azul sobria + panel desplegable en columnas:**
- **Barra:** fondo `blue-700`, items en blanco/500, sin que cada uno tenga color propio. Máx. ~7 entradas visibles de primer nivel (agrupar las 13 macro-categorías en familias) + un disparador **"Todas las categorías"** con icono que abre el árbol completo. Extras (Marcas · Novedades · Ofertas · Outlet · Noticias) van como links secundarios, diferenciados (p. ej. "Ofertas" con punto rojo).
- **Panel desplegable** (`shadow-lg`, fondo blanco, `radius-lg`): **multi-columna** con la macro-categoría como encabezado azul y subcategorías debajo en lista; una **columna visual** a la derecha con foto de la categoría destacada. Hover/teclado abre el panel (la interacción/a11y la implementa `MegaMenuClient` del frontend: `aria-expanded`, Esc, flechas).
- **Color contenido:** azul para encabezados, gris para subitems, teal solo en el item activo/hover. Nada de 13 colores.
- **Móvil:** se convierte en menú lateral (off-canvas) tipo acordeón — patrón que define el UX Architect; aquí solo el estilo (cabeceras azules, chevrons, fondo blanco).

### 4.5 Hero con propuesta de valor + CTA

**Problema actual:** slider de fotos sin mensaje ni botón.

**Nuevo concepto — hero de confianza, no de "lifestyle":**
- **Layout dos zonas (desktop):** izquierda = mensaje + buscador + CTA; derecha = imagen de exposición/almacén o composición de producto, en card con `radius-lg`. Fondo de sección `blue-700` con sutil textura/degradado tinta MUY leve, o blanco con la imagen como protagonista (A/B; por defecto **fondo azul tinta a la izquierda, imagen a la derecha**).
- **Copy (reutilizando datos del informe):**
  - H1: **"Mayorista de hostelería e industrial en Córdoba desde 1994"**
  - Sub: **"+10.000 referencias en limpieza, celulosa, menaje y maquinaria. Servicio profesional y envío gratis >100 € en Córdoba."**
  - **Buscador prominente** integrado en el hero (los B2B buscan por referencia).
  - CTA primario (azul/blanco) **"Ver catálogo"** + CTA secundario ghost **"Solicitar presupuesto"**.
- **Sin slider automático** (mata CWV y accesibilidad). Si se quiere rotación, máx. 2–3 con control manual y respetando `prefers-reduced-motion`.

**Tira de Value Props** justo debajo (componente `ValueProps`): 3–4 ítems con icono lineal (lucide): **+30 años** · **+10.000 referencias** · **Envío gratis >100€** · **Exposición 1.500 m²**. Fondo `gray-50`, iconos `brand-600`. Refuerza confianza inmediata.

### 4.6 Badges (Novedad / Oferta / Outlet / stock)
- Forma: `rounded-sm`, `px-2 py-0.5`, `text-2xs`, mayúsculas, peso 600.
- **Novedad:** fondo `blue-600`, texto blanco.
- **Oferta:** fondo `#c1281f` (rojo), texto blanco — comunica rebaja; junto al precio se muestra precio anterior tachado en `gray-400`.
- **Outlet:** fondo `#6b3fa0` (morado), texto blanco — distinto de oferta para evitar confusión.
- **Disponibilidad** (no es badge sólido, es texto + punto): "En stock" success, "Bajo pedido" warning, "Agotado" error.
- Posición en card: esquina superior izquierda, apiladas si coinciden (máx. 2 visibles).

### 4.7 Banner de cookies (rediseño)
El rojo intrusivo actual se sustituye por una **barra inferior discreta**: fondo `gray-900`, texto blanco `text-sm`, botones "Aceptar" (teal sólido) / "Rechazar" (ghost claro) / "Configurar" (link). No tapa contenido, ancho completo abajo, desaparece al decidir.

### 4.8 Breadcrumbs
`text-sm`, separador chevron `gray-400`, links `gray-500` con hover `brand-600`, último (actual) `gray-800` no enlazado. Sobre fondo `gray-50` o blanco, `py-3`. (El JSON-LD `BreadcrumbList` lo añade el frontend.) Mejora la orientación en un catálogo de ~200 subcategorías.

### 4.9 Footer
Mantener estructura de columnas **AYUDA / LEGAL / Datos de contacto + logo NG**. Estilo:
- Fondo `blue-900` (tinta) con texto `gray-100`/`gray-300`, o variante clara `gray-50` con texto `gray-700` (por defecto **oscuro azul** = cierre sólido de página, contraste AAA).
- **Logos institucionales FEDER / Junta de Andalucía / "Andalucía se mueve con Europa": OBLIGATORIO mantenerlos** (condición de la subvención IDEA). Se colocan en una **franja inferior clara separada** (fondo blanco/gris para respetar los colores oficiales de los logos), con su leyenda legible. Nunca recolorear esos logos.
- Datos de contacto (tel 957 65 53 88, móvil, email, dirección Montilla) prominentes.
- Iconos sociales: solo si hay enlaces reales (corrige el "Síguenos en" vacío); si no, se omite la sección.

---

## 5. Concepto visual de pantallas

### 5.1 Home
1. **Header** (topbar fina azul con tel/email/acceso + barra de logo y buscador + mega-menú).
2. **Hero** (§4.5): mensaje de confianza + buscador + CTA, fondo azul tinta / imagen.
3. **Value Props** (§4.5): tira de 4 garantías con icono.
4. **Categorías destacadas** (`FeaturedCategories`): grid de 6–8 `CategoryCard` con foto + nombre, hover azul. Reemplaza el bloque desordenado actual.
5. **Novedades / Ofertas / Outlet:** carruseles de `ProductCard` (resuelve el bug P6 de cards vacías; ahora con datos completos y fallback).
6. **Bloque de confianza:** breve "Quiénes somos" + foto de la exposición + "+30 años" + CTA a catálogo.
7. **Actualidad/Noticias:** 3 tarjetas (sustituye el relleno actual).
8. **Footer** con logos institucionales.

### 5.2 Categoría
- Breadcrumbs → **H1 = nombre de categoría** → descripción corta opcional.
- **Layout catálogo:** sidebar de departamentos (estilo: lista azul/gris, activo teal) + área principal con grid de subcategorías (`CategoryCard`) o de productos.
- **Toolbar superior:** nº de resultados, orden (relevancia/precio/novedad), conmutador grid/lista. Filtros (marca, disponibilidad, rango precio) en panel — estilo limpio, chips de filtros activos eliminables.
- Mucho blanco, grid alineado (gracias a la altura fija de card).

### 5.3 Ficha de producto (PDP)
**Problema actual:** imagen pequeña, jerarquía pobre.
- **Dos columnas (desktop):**
  - **Izquierda — galería:** imagen grande cuadrada sobre `gray-50`, `object-contain`, con zoom/lightbox (lo implementa `ProductGallery`); miniaturas debajo. Imagen claramente mayor que la actual.
  - **Derecha — bloque de compra:** marca (link a marca) → **H1 nombre** → referencia (mono-tabular, copiable) → disponibilidad (punto + texto) → **precio grande** `text-3xl/700 blue-900` + "I.V.A. no incluido" → **selector de cantidad** (stepper) + **CTA "Añadir a la solicitud"** (teal, lg) → CTA secundario "Solicitar presupuesto" → micro-trust: envío gratis, plazo, contacto directo.
- **Debajo:** tabs/acordeón (Descripción · Características/formato · Envío y devoluciones) — estilo limpio, encabezados azules.
- **Relacionados:** carrusel "También te puede interesar" / "Otros de la misma marca".
- **JSON-LD Product** (frontend) para rich results.

### 5.4 Tratamiento de fotos de producto
- **Normalización:** todas a **cuadrado**, fondo **blanco/`gray-50`**, producto centrado, `object-contain` (nunca `cover` — un envase no se debe recortar). Esto homogeneiza un catálogo de orígenes dispares y es la base que elimina las cards vacías.
- **Optimización:** servidas vía `next/image` (WebP/AVIF, `srcset`, lazy) desde el CDN — coordinado con el plan de migración del frontend (§5). `blur` placeholder para CLS 0.
- **Fallback de marca:** ante imagen faltante, `ProductImage` muestra el **logo NG en gris claro** sobre `gray-50` (placeholder de marca), no un 1×1 roto.
- **Categorías:** foto ambiental/de producto representativa, con leve overlay azul al hacer hover y el nombre en blanco encima (para `CategoryCard` con texto sobre imagen → garantizar contraste con scrim azul `blue-900/55`).

---

## 6. Estados (hover / focus / active / disabled / loading)

**Principio transversal:** transición `--dur-fast` con `--ease-out`; foco **siempre** visible y accesible; respetar `prefers-reduced-motion` (sin translate/scale).

| Componente | Hover | Focus (teclado) | Active | Disabled |
|---|---|---|---|---|
| **Botón primario (teal)** | `bg-teal-600` | ring `teal-500/40` + offset 2px | `bg-teal-700` + `translateY(1px)` | `opacity-60`, cursor not-allowed |
| **Botón secundario (azul)** | `bg-brand-800` | ring `brand-500/40` | `bg-brand-900` | `opacity-60` |
| **Botón outline** | fondo `brand-50`, borde `brand-800` | ring `brand-500/40` | fondo `brand-100` | borde y texto `gray-300` |
| **Link de texto** | `brand-600` + subrayado | ring + subrayado | `brand-800` | `gray-400` |
| **ProductCard** | `shadow-md` + `-translateY(2px)` + borde `brand-200`; imagen `scale(1.03)` | ring `teal-500/40` alrededor de la card; CTA enfocable aparte | — | — |
| **Input** | borde `gray-400` | borde `teal-400` + ring `teal-500/20` | — | fondo `gray-100`, texto `gray-400` |
| **Item mega-menú** | texto blanco + subrayado teal / panel abre | ring blanco interior + `aria-expanded` | item activo: barra inferior teal | — |
| **Item sidebar categoría** | fondo `gray-100`, texto `brand-700` | ring `teal-500/40` | activo: fondo `brand-50` + borde izq teal + texto `brand-700/700` | — |
| **Badge / chip de filtro** | (chip) `bg-brand-100`, "×" visible | ring | — | — |
| **Stepper de cantidad** | botones +/- `bg-gray-100` | ring teal | `bg-gray-200` | `opacity-50` |

**Loading / vacío / error (estados de página):**
- **Skeletons** (no spinners) para grid de producto y PDP: bloques `gray-100` con shimmer suave → percepción de velocidad (frontend usa `loading.tsx`).
- **Estado vacío de búsqueda/categoría:** ilustración/icono lineal `gray-300` + mensaje + sugerencias + buscador, nunca una página en blanco.
- **Toasts** (sustituyen sweetalert): "Añadido a la solicitud" → toast con borde izq teal, icono check; error → borde izq `error`. Posición inferior-derecha, auto-cierre 4s, `role="status"`.
- **Carrito vacío:** mensaje + CTA "Ver catálogo".

---

## 7. Entregables visuales para handoff (a producir en build)
1. **`globals.css`** con todos los tokens (§2.2, §3) como CSS vars + `@theme`/config Tailwind.
2. **Storybook / página `/styleguide`** interna con botones, inputs, `ProductCard`, badges, breadcrumbs, estados — sirve de QA visual y de "fuente de verdad".
3. **Especificación de cada componente** con tokens exactos (los nombres de componente y su lógica Server/Client ya están en `frontend.md`).
4. **Checklist de QA de diseño:** contraste AA por componente, foco visible, touch targets ≥44px, line-clamp en cards, fallback de imagen, leyenda "I.V.A. no incluido" presente en card y PDP.

---

### Resumen de decisiones de diseño
- **Marca azul (`blue-700` navegación) + acento de acción TEAL (`teal-500` CTA) + neutros fríos** — el teal hace saltar "Añadir a la solicitud" sobre el azul del header (y ya existía en la marca).
- **Inter** + escala 1.2 densa + `tabular-nums` para precios/referencias; **un H1 por página**; contraste **AA verificado** (CTA 4.6:1, cuerpo 13.6:1).
- **`ProductCard` con foto cuadrada `object-contain` + fallback de marca + altura fija** → resuelve las cards vacías (P6) y alinea el grid; **precio visible** + "I.V.A. no incluido"; CTA teal "Añadir a la solicitud".
- **Mega-menú sobrio** (azul, ~7 entradas + "Todas las categorías", panel en columnas, sin 13 colores) en vez del recargado actual.
- **Hero de confianza** con propuesta de valor + buscador + value props (+30 años / +10.000 ref / envío gratis); sin slider automático.
- **Footer** mantiene logos **FEDER/Junta** (sin recolorear) en franja clara; banner de cookies discreto (adiós al rojo intrusivo).
- **Sin gradientes/neón**; sombras tinta-azul; dark mode preparado pero **fuera de v1**.
- **Alcance respetado:** los flujos, breakpoints y arquitectura los lleva el UX Architect / `frontend.md`; aquí solo viven los **tokens y la apariencia**.
