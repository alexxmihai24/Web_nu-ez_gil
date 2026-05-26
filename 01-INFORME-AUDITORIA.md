# Informe de Auditoría — nunezgil.com

**Cliente:** Núñez Gil Mayorista de Hostelería e Industrial S.L.
**Fecha de auditoría:** 2026-05-26
**Método:** Crawl automatizado con Playwright (11 páginas representativas) + inspección de cabeceras HTTP, sitemap y robots.txt.
**Evidencias:** `investigacion/screenshots/` (desktop + móvil) · `investigacion/data/crawl-report.json`

---

## 0. Resumen ejecutivo

nunezgil.com es un **e-commerce/catálogo B2B** de productos de limpieza industrial y hostelería, construido sobre una **plataforma PHP propietaria** (proveedor: *Movatec* / `workcrm.com`) con un diseño de plantilla genérica de ~2016 (Bootstrap 3 + jQuery 1.12). Funciona, pero arrastra **problemas críticos de seguridad**, **rendimiento pobre**, **SEO casi inexistente** y una **estética y UX desfasadas** que transmiten poca confianza para una venta B2B.

**Veredicto:** No basta con un "lavado de cara". Recomendamos **reconstruir el front (y idealmente el catálogo) con un stack moderno** reutilizando los datos, fotos y textos actuales, y **endurecer la seguridad desde el día uno**.

**Top 5 urgencias (arreglar sí o sí):**
1. 🔴 El sitio sirve por **HTTP plano sin redirigir a HTTPS** (login y carrito sin cifrar garantizado).
2. 🔴 **Token SECRETO de Mapbox expuesto** en el HTML público (`access_token=sk....`).
3. 🔴 **Cookie de sesión sin flags** `Secure`/`HttpOnly`/`SameSite`.
4. 🔴 **Cero cabeceras de seguridad** (sin HSTS, CSP, X-Frame-Options...).
5. 🟠 **SEO roto**: sin H1, sin meta description, sin canonical, sin datos estructurados, títulos vacíos.

---

## 1. El negocio y datos extraídos (para reutilizar)

> Todos estos datos se reutilizan tal cual en la nueva web.

| Campo | Valor |
|---|---|
| Razón social | **NUÑEZ GIL MAYORISTA DE HOSTELERÍA E INDUSTRIAL, S.L.** |
| CIF | **B14784235** |
| Dirección | C/ Pilas de Panchía, 2 — 14550 Montilla (Córdoba), España |
| Teléfono fijo | 957 65 53 88 |
| Móvil | 600 57 81 87 |
| Email | info@nunezgil.com |
| Desde | **1994** (sector hostelero) |
| Instalaciones | Exposición + dpto. logístico de **1.500 m²**, **+10.000 referencias** |
| Envío gratis | >100 € en Córdoba · >200 € resto de península |
| Analítica | Google Analytics 4 (`G-RWL5CKME4Q`) |
| Desarrollo actual | "Diseña y desarrolla **Movatec**" (plataforma `workcrm.com`) |
| Subvención | Incentivo Agencia IDEA (Junta de Andalucía) 4.948,50 €, cofinanciado 80% FEDER-UE (debe mantenerse el logo/leyenda) |

**Texto "Quiénes somos" (reutilizable):**
> *"Empresa dedicada al servicio del sector hostelero desde el año 1994, pone a su disposición un amplio catálogo en productos de menaje, mantelerías, proyectos e instalaciones de maquinaria, ropa laboral, productos de acogida, limpieza y celulosa. Disponemos de unas instalaciones con exposición, departamento logístico de 1.500 m² y más de 10.000 referencias en constante actualización para proporcionar el servicio más eficaz a nuestros clientes."*

**Árbol de categorías (mega-menú):** Química Industrial · Celulosa Industrial y Dispensadores · Artículos de Limpieza · Automoción · En la Mesa · Cristalería · Consumibles y Un Solo Uso · Sanidad, Salud y Protección · En la Cocina · En la Sala · Mobiliario · Maquinaria Hostelería · Aseo Personal · (+ Marcas, Novedades, Outlet, Ofertas, Noticias). El sitemap declara **~200 categorías/subcategorías**.

**Marcas distribuidas:** Quimxel, Tork, P&G Profesional, Jofel, Spontex, Cisne, García de Pou, Stölzle, Schott, Narumi, Amefa, Gural, Alia, Beckers, Lacor, Pujadas, Vicrila, Sammic, Fervik, HR Fainca, Pla, Continental, PQS, Hoteralia + **marcas propias NG** (NG Automoción, NG Química, NG Lavandería, NG Limpieza, NG Hostelería, NG Celulosa).

**Assets gráficos identificados (inventario completo en `crawl-report.json`):**
- Logo: `workcrm.com/.../files/LOGO_NG_CABECERA.jpg` (415×118)
- ~11 imágenes de slider (1000×400 JPG)
- Fotos de categoría y producto (800×800 JPG) alojadas en `workcrm.com`
- Logos institucionales (Junta de Andalucía, UE/FEDER, Andalucía se mueve con Europa)

---

## 2. Hallazgos CRÍTICOS — Seguridad 🔴

| # | Hallazgo | Severidad | Evidencia | Riesgo |
|---|----------|-----------|-----------|--------|
| S1 | **Sin HTTPS forzado.** `http://nunezgil.com/` responde **200** con contenido, sin redirigir a `https://`. | Crítica | `Invoke-WebRequest http://… → 200` | Credenciales de login y datos del carrito pueden enviarse en claro (MITM, robo de sesión en redes públicas). |
| S2 | **Token SECRETO de Mapbox expuesto** en el HTML de `/contacto`: `…access_token=sk.eyJ1IjoiaW5tb3dvcmsi…`. El prefijo `sk.` es clave **secreta** (no la pública `pk.`), de la cuenta del proveedor. | Crítica | URLs de tiles en `crawl-report.json` (página `contacto`) | Cualquiera puede usar el token → cargos/abuso en la cuenta Mapbox, posible bloqueo del servicio. Debe **revocarse ya**. |
| S3 | **Cookie de sesión insegura.** `Set-Cookie: PHPSESSID=…; path=/` **sin** `Secure`, `HttpOnly` ni `SameSite`. | Crítica | Cabecera `Set-Cookie` | Robo de sesión vía XSS (JS lee la cookie) o vía HTTP (no cifrada) → suplantación de cliente. |
| S4 | **Ausencia total de cabeceras de seguridad.** Sin `Strict-Transport-Security`, `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` ni `Permissions-Policy`. | Alta | Cabeceras de `/acceso` | Clickjacking de la página de login, MIME-sniffing, sin protección de transporte forzada. |
| S5 | **Dependencias front obsoletas.** jQuery **1.12.0** (2016, con CVEs de XSS conocidos: CVE-2015-9251, CVE-2019-11358, CVE-2020-11022/11023) + Bootstrap **3** (fin de soporte). | Alta | `scripts` en `crawl-report.json` | Superficie de XSS y vulnerabilidades sin parchear; difícil de mantener. |
| S6 | **Por verificar en backend** (no accesible desde fuera): protección **CSRF** en formularios POST (`/acceso`, `/contacto`, `/carrito`), **rate-limiting/bloqueo de fuerza bruta** en login, validación/escape de entradas, hashing de contraseñas. | Por determinar | — | El agente de Security debe auditarlo sobre el código nuevo. |

**Aspectos positivos de seguridad:** reCAPTCHA en el formulario de contacto, aviso de cookies y política de privacidad/LOPD presentes, certificado HTTPS disponible (aunque no forzado).

---

## 3. Hallazgos — Rendimiento 🟠

| # | Hallazgo | Dato medido |
|---|----------|-------------|
| P1 | **Home lenta** | 6,3 s de carga (`load`), 49 peticiones |
| P2 | **Sin caché de navegador** | `Cache-Control: no-store, no-cache` + `Expires: 1981` en TODO (incluidos estáticos) |
| P3 | **CSS/JS sin agrupar** | 10 hojas CSS + 9–10 archivos JS separados, sin bundling/minificado conjunto |
| P4 | **Imágenes sin optimizar** | JPG 800×800 y 1000×400 servidos sin WebP/AVIF ni `srcset`; sin tamaños responsive |
| P5 | **Página "Marcas" muy pesada** | **205 imágenes / 196 peticiones** en una sola página, sin lazy-load efectivo |
| P6 | **Lazy-load roto** | Tarjetas de Ofertas/Outlet muestran placeholders `data:image/gif` 1×1 que **nunca se sustituyen** → cards vacías visibles |

---

## 4. Hallazgos — SEO / Posicionamiento 🟠

| # | Hallazgo |
|---|----------|
| SEO1 | **Ningún `<h1>`** en ninguna de las páginas auditadas (jerarquía semántica rota). |
| SEO2 | **Sin meta description** en home y categorías; en otras es genérica ("Quiénes somos", "Contacto"). |
| SEO3 | **Títulos vacíos** en páginas clave (`Marcas`, `Noticias` → `<title>` en blanco). |
| SEO4 | **Sin `canonical`**, sin etiquetas **Open Graph / Twitter Card** → mal compartir en WhatsApp/redes (clave en B2B). |
| SEO5 | **Sin datos estructurados** Schema.org (`Organization`, `Product`, `BreadcrumbList`, `LocalBusiness`). |
| SEO6 | **Sitemap obsoleto** (generado en 2022 con `xml-sitemaps.com`) y con **URLs `http://`**. |
| SEO7 | **Noticias = contenido de relleno** ("noticia-ejemplo", "noticia-ejemplo-2/3") publicado en producción. |
| SEO8 | Sin blog/contenido editorial real → nula captación orgánica para un negocio local de Córdoba/Andalucía. |

---

## 5. Hallazgos — Diseño / UX 🟡

- **Estética datada** (plantilla Bootstrap 3): tipografía por defecto, poco aire/espaciado, tarjetas pequeñas.
- **Mega-menú azul marino recargado** con 13+ categorías a la vez → sobrecarga cognitiva.
- **Hero sin propuesta de valor ni CTA claro**: un slider de fotos sin mensaje ("desde 1994", "+10.000 referencias", "envío gratis") ni botón de acción.
- **Banner de cookies intrusivo** en rojo sobre el contenido.
- **Móvil funcional pero apretado** (responsive básico de Bootstrap, no optimizado).
- **Iconografía social vacía** ("Síguenos en" sin enlaces visibles).
- **Imágenes sin `alt`** en buena parte (accesibilidad + SEO): p. ej. 17 de 26 en `/contacto`, 5 de 14 en `/quienes-somos`.
- Sin jerarquía de encabezados → mala accesibilidad (lectores de pantalla) y WCAG.

---

## 6. Hallazgos — Funcionalidad / E-commerce 🟡

- E-commerce B2B con **registro/login** ("Área Clientes"), **carrito** y **buscador** con autosuggest.
- **Tarjetas de producto rotas** en Ofertas/Outlet (imágenes que no cargan) — daña la confianza de compra.
- Buscador por **marca** y por especiales (novedad/destacado) → buena base de datos de catálogo a reaprovechar.
- Mapa de contacto vía Leaflet+Mapbox (con el problema del token secreto — S2).
- Páginas legales completas (cómo comprar, condiciones, devoluciones, LOPD, cookies) → reutilizables.

---

## 7. Conclusión y enfoque recomendado

El sitio tiene **buen contenido y un catálogo extenso y valioso**, pero la **base técnica es insegura y obsoleta**. La estrategia ganadora es:

1. **Reconstruir el storefront con stack moderno** (recomendado: **Next.js App Router**), reutilizando datos, fotos y textos actuales.
2. **Diseño nuevo B2B** centrado en confianza, búsqueda rápida y conversión (pedir presupuesto / comprar).
3. **Seguridad por defecto**: HTTPS+HSTS forzado, cabeceras+CSP, cookies endurecidas, auth robusta, dependencias mantenidas.
4. **SEO técnico + de contenido** desde la base (H1, metadatos, OG, Schema.org, sitemap fresco, datos locales de Córdoba/Andalucía).

> El plan detallado por fases está en `02-SPEC-IMPLEMENTACION.md`.
