# Cesta de solicitud + Acceso — Diseño

Fecha: 2026-05-27
Estado: aprobado (diseño). Pendiente de plan de implementación.

## Objetivo

Terminar el modelo **"cesta de solicitud"** (B2B, sin cuentas ni pago) que quedó a medias:
hoy el icono de la cabecera enlaza a `/solicitud`, que no existe → 404 ("la cesta no
aparece"). Construir la página de cesta, su envío por email, el contador en la cabecera y
resolver la ruta `/acceso` (que también da 404).

## Contexto — lo que YA existe (se reutiliza, no se duplica)

- `components/catalog/BotonAnadirSolicitud.tsx`: persiste líneas en
  `localStorage['ng:solicitud']` con la forma `Array<{ id, slug, name, qty }>` y emite
  `window.dispatchEvent(new CustomEvent('ng:solicitud:update', { detail: { count } }))`.
  **No se modifica** (o cambio mínimo).
- `components/catalog/SelectorCantidad.tsx`: stepper de cantidad. Se reutiliza en la cesta.
- `components/catalog/CajaCompra.tsx`: stepper + botón en la ficha. No se toca.
- `components/layout/Cabecera.tsx`: Server Component con el icono "Solicitud" → `/solicitud`
  y un enlace "Acceder" → `/acceso`.
- `lib/data/index.ts`: capa de datos (Supabase + fallback estático).
- `lib/security/rate-limit.ts`, `lib/security/csrf.ts`: protección reutilizable.

## Alcance

### Incluido
1. Página `/solicitud` (la cesta) con líneas editables + formulario B2B + envío.
2. Endpoint `POST /api/solicitudes`: validación + envío de email (Resend) a Núñez Gil + copia al cliente.
3. Endpoint `GET /api/solicitudes/resolver`: datos de producto por slugs (foto, referencia, marca, precio).
4. Contador (badge) en la cabecera, alimentado por el evento existente.
5. `/acceso`: quitar el enlace "Acceder" de la cabecera + dejar `/acceso` como página simple
   "Área de clientes — próximamente" (evita el 404 si alguien llega por enlace externo/SEO).

### Fuera de alcance (YAGNI)
- Cuentas de cliente / autenticación real.
- Pasarela de pago.
- Precios por cliente / tarifas.
- Persistencia de la solicitud en base de datos (el envío es por email; se puede añadir luego).

## Arquitectura y componentes

### 1. `app/solicitud/page.tsx` (+ islas client)
- La página puede ser un Server Component fino que renderiza una isla client `Cesta`.
- `components/solicitud/Cesta.tsx` (`'use client'`):
  - Lee `localStorage['ng:solicitud']` en el montaje; escucha `ng:solicitud:update` y `storage`.
  - Llama a `GET /api/solicitudes/resolver?slugs=...` para enriquecer (foto, referencia, marca, precio).
  - Renderiza líneas: imagen, nombre, referencia, marca, precio unitario, `SelectorCantidad`
    (edita qty → reescribe localStorage + re-emite el evento), botón quitar.
  - Subtotal indicativo (no vinculante; es una solicitud de presupuesto).
  - Estado vacío: mensaje + enlace al catálogo.
- `components/solicitud/FormularioSolicitud.tsx` (`'use client'`):
  - Campos: `nombre*`, `empresa`, `email*`, `telefono*`, `cif`, `mensaje`, `consentimiento*` (RGPD).
  - Validación en cliente (campos requeridos, formato email) + deshabilita envío si la cesta está vacía.
  - POST a `/api/solicitudes` con `{ lineas, contacto }`.
  - Éxito → limpia `localStorage['ng:solicitud']`, emite el evento (badge a 0), muestra confirmación.
  - Error → mensaje inline sin perder los datos introducidos.

### 2. `app/api/solicitudes/route.ts` (POST)
- Valida el cuerpo (manual o zod si ya está disponible): contacto + al menos 1 línea; longitudes máximas.
- Rate-limit por IP (reutiliza `lib/security/rate-limit.ts`) para evitar spam.
- Construye un email legible (líneas con referencia + cantidad + datos de contacto) y lo envía con Resend:
  - `to`: email destino de Núñez Gil (config).
  - `replyTo`: email del cliente; `cc`/segundo envío: copia al cliente.
- Devuelve `{ ok: true }` o `{ ok: false, error }` con el código HTTP adecuado.
- Si falta `RESEND_API_KEY` → modo simulado: registra el email en consola y responde ok
  (permite construir y probar sin bloquear). El envío real se activa al poner la clave.

### 3. `app/api/solicitudes/resolver/route.ts` (GET)
- Entrada: `?slugs=a,b,c` (límite p. ej. 100).
- Usa una función nueva en la capa de datos `getProductsBySlugs(slugs): ProductListItem[]`
  (Supabase `.in('slug', slugs)` + fallback estático), para no exponer N llamadas sueltas.
- Devuelve `ProductListItem[]`. Los slugs no encontrados se omiten.

### 4. `components/layout/ContadorSolicitud.tsx` (`'use client'`)
- Isla en la cabecera junto al icono "Solicitud".
- Estado inicial leyendo `localStorage`; escucha `ng:solicitud:update` y `storage`.
- Muestra un badge con el nº de líneas (oculto si 0). Accesible (aria-label "N productos en la solicitud").

### 5. `/acceso`
- Quitar el `<Link href="/acceso">Acceder</Link>` de `Cabecera.tsx` (no hay cuentas).
- `app/acceso/page.tsx`: página simple "Área de clientes — próximamente", con CTA a `/contacto`.
  (Alternativa: redirect a `/contacto`. Se deja como página informativa para no romper enlaces/SEO.)

## Flujo de datos

```
Catálogo → "Añadir a la solicitud" (localStorage) → evento ng:solicitud:update
   → badge de la cabecera se actualiza
   → /solicitud: lee localStorage → GET /api/solicitudes/resolver (enriquece)
   → usuario edita cantidades / quita líneas (reescribe localStorage)
   → rellena formulario → POST /api/solicitudes → Resend envía email
   → limpia cesta + confirmación
```

## Manejo de errores
- Validación en cliente y servidor; mensajes inline.
- Cesta vacía → botón de envío deshabilitado.
- Fallo de email/red → mensaje de error, se conservan los datos del formulario, se permite reintentar.
- `localStorage` no disponible (modo privado) → la cesta funciona en memoria durante la sesión; no rompe la UI.
- Rate-limit superado → 429 con mensaje claro.

## Configuración (variables de entorno)
- `RESEND_API_KEY` (secreto; en `.env.local` y en Vercel). Sin ella → modo simulado.
- `SOLICITUDES_EMAIL_TO` (p. ej. `info@nunezgil.com`).
- `SOLICITUDES_EMAIL_FROM` (dominio verificado en Resend; mientras tanto, dominio de pruebas de Resend).

## Pruebas
- **E2E (Playwright):** añadir un producto desde una ficha → ir a `/solicitud` → ver la línea con
  foto/precio → editar cantidad → rellenar formulario → enviar (Resend mockeado) → ver confirmación
  y badge a 0.
- **Unitaria:** validación del `POST /api/solicitudes` (rechaza cesta vacía, email inválido, falta de
  consentimiento; acepta payload válido).
- **Manual:** `/acceso` ya no da 404; la cabecera no muestra "Acceder".

## Criterios de aceptación
1. El icono "Solicitud" de la cabecera abre `/solicitud` (no 404) y muestra la cesta del navegador.
2. Las líneas muestran foto, referencia, marca y precio; la cantidad es editable y persiste.
3. El badge de la cabecera refleja el nº de productos en tiempo real.
4. Enviar la solicitud con datos válidos dispara el email (o el modo simulado) y vacía la cesta.
5. `/acceso` no da 404 y no hay enlace "Acceder" colgando.
6. Las pruebas pasan; build de Next.js en verde.
