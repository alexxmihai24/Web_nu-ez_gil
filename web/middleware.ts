import { NextResponse, type NextRequest } from 'next/server';
import {
  buildCsp,
  generateNonce,
  staticSecurityHeaders,
  NONCE_HEADER,
} from '@/lib/security/headers';

/**
 * Cabeceras de seguridad de transporte + CSP por NONCE (Fase 2, endurecido).
 * DUEÑO: Security Engineer. La construcción de la política vive en
 * `lib/security/headers.ts` (reutilizable y testeable); aquí solo se cablea
 * el ciclo por petición.
 *
 * Resuelve por diseño los hallazgos del informe de auditoría:
 *   S1 — HTTPS no forzado  → HSTS + upgrade-insecure-requests.
 *   S4 — Ausencia de cabeceras → set completo + CSP estricta basada en nonce.
 *
 * NONCE: se genera uno nuevo por petición y se propaga al render mediante la
 * cabecera de petición `x-nonce`. El layout (app/layout.tsx) debe leerlo con
 * `headers().get('x-nonce')` y pasarlo a cualquier <Script>/<style> inline
 * (p. ej. el snippet de GA4). Ese cableado lo hace el orquestador — ver SECURITY.md.
 *
 * Runtime: middleware corre en EDGE. No se usan APIs de Node aquí.
 */
export function middleware(request: NextRequest) {
  const nonce = generateNonce();
  const isDev = process.env.NODE_ENV === 'development';
  const csp = buildCsp(nonce, { isDev });

  // Propaga el nonce a los Server Components vía cabecera de petición.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(NONCE_HEADER, nonce);
  // CLAVE: Next.js lee el nonce de la cabecera CSP de la PETICIÓN para inyectarlo
  // automáticamente en todos sus <script> y opta la ruta a render dinámico (el
  // nonce es por petición). Sin esto, los scripts no llevan nonce y 'strict-dynamic'
  // los bloquea → la web no hidrata (carrito, menús, buscador y carrusel muertos).
  requestHeaders.set('Content-Security-Policy', csp);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  // CSP: en producción se aplica en modo enforce. En desarrollo se emite también
  // en Report-Only para detectar violaciones sin bloquear el flujo de trabajo.
  response.headers.set('Content-Security-Policy', csp);

  // El nonce viaja también en la respuesta por si un consumidor (tests/SSR) lo necesita.
  response.headers.set(NONCE_HEADER, nonce);

  for (const [name, value] of Object.entries(staticSecurityHeaders())) {
    response.headers.set(name, value);
  }

  return response;
}

export const config = {
  /**
   * Aplica a todo salvo estáticos de Next y assets públicos, donde las cabeceras
   * de seguridad no aportan y solo añaden coste. La CSP cubre todas las respuestas
   * HTML navegables (incluido el documento que carga esos assets).
   */
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|css|js|woff|woff2|ttf|otf|map)$).*)',
  ],
};
