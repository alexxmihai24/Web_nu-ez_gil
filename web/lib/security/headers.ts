/**
 * Constructor reutilizable de Content-Security-Policy y cabeceras de seguridad.
 *
 * EDGE-SAFE: este módulo NO usa APIs de Node (`node:crypto`, Buffer, fs...).
 * Lo consume `middleware.ts`, que corre en el runtime Edge. El nonce se genera
 * con la Web Crypto API (`crypto.getRandomValues`), disponible en Edge y Node.
 *
 * Resuelve por diseño los hallazgos del informe de auditoría:
 *   S1 (HTTPS no forzado → HSTS + upgrade-insecure-requests)
 *   S4 (ausencia total de cabeceras de seguridad → set completo + CSP por nonce).
 *
 * Política CSP: estricta basada en NONCE. Cada respuesta genera un nonce nuevo
 * que el layout debe inyectar en cualquier <Script>/<style> inline propio.
 *
 * Allowlist alineada con la app real (NO con el stack hipotético del threat model):
 *   - Google Analytics 4: googletagmanager.com (script) + google-analytics.com (beacon).
 *   - Imágenes del catálogo migrado: workcrm.com (CDN actual) + data:/blob: (next/image, placeholders).
 *   - Mapa de contacto: tiles de OpenStreetMap (*.tile.openstreetmap.org) — sin token, sin secretos.
 *     (Sustituye el Mapbox con token `sk.` filtrado del sitio antiguo — hallazgo S2.)
 */

/** Orígenes externos permitidos, centralizados para auditoría y reutilización. */
export const CSP_ALLOWLIST = {
  /** Scripts de terceros (solo GA4; se cargan vía next/script con nonce). */
  script: ['https://www.googletagmanager.com'],
  /** Endpoints a los que el cliente puede abrir conexiones (fetch/XHR/beacon). */
  connect: [
    'https://www.googletagmanager.com',
    'https://www.google-analytics.com',
    'https://*.google-analytics.com',
  ],
  /** Orígenes de imagen permitidos (CDN del catálogo + tiles del mapa). */
  img: [
    'https://workcrm.com',
    'https://*.tile.openstreetmap.org',
    'https://www.googletagmanager.com',
    'https://www.google-analytics.com',
  ],
  /** Hosts de tipografías remotas (vacío: Archivo se self-hostea vía next/font). */
  font: [] as string[],
  /** iframes permitidos (vacío: no incrustamos terceros). */
  frame: [] as string[],
} as const;

/**
 * Genera un nonce CSP criptográficamente seguro y URL-safe (base64).
 * 128 bits de entropía. Edge-safe (Web Crypto).
 */
export function generateNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  // btoa está disponible en Edge y en Node 18+; convertimos bytes → binary string.
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Construye la cadena de Content-Security-Policy con el nonce dado.
 *
 * @param nonce  Nonce por petición (de `generateNonce`).
 * @param opts.isDev  En desarrollo Next inyecta eval para HMR/React Refresh:
 *   se relaja `script-src` con 'unsafe-eval' SOLO en dev. En producción NUNCA.
 */
export function buildCsp(nonce: string, opts: { isDev?: boolean } = {}): string {
  const isDev = opts.isDev ?? false;

  const scriptSrc = [
    `'self'`,
    `'nonce-${nonce}'`,
    // 'strict-dynamic': permite que los scripts con nonce carguen sus dependencias
    // y hace que los navegadores modernos ignoren la allowlist de hosts (más robusto).
    `'strict-dynamic'`,
    // En dev, Next requiere eval para Fast Refresh. Jamás en producción.
    ...(isDev ? [`'unsafe-eval'`] : []),
    ...CSP_ALLOWLIST.script,
  ];

  const directives: Array<[string, string[] | string]> = [
    ['default-src', [`'self'`]],
    ['script-src', scriptSrc],
    // 'unsafe-inline' en style-src es un compromiso conocido de Next (estilos inline
    // de next/font y componentes). NO afecta a script-src, que sí es estricto por nonce.
    ['style-src', [`'self'`, `'unsafe-inline'`]],
    ['img-src', [`'self'`, 'data:', 'blob:', ...CSP_ALLOWLIST.img]],
    ['font-src', [`'self'`, 'data:', ...CSP_ALLOWLIST.font]],
    ['connect-src', [`'self'`, ...CSP_ALLOWLIST.connect]],
    ['frame-src', CSP_ALLOWLIST.frame.length ? CSP_ALLOWLIST.frame : [`'none'`]],
    // Anti-clickjacking moderno; reemplaza/refuerza X-Frame-Options.
    ['frame-ancestors', [`'none'`]],
    ['base-uri', [`'self'`]],
    // Los formularios/Server Actions solo pueden postear al propio origen.
    ['form-action', [`'self'`]],
    ['object-src', [`'none'`]],
    ['manifest-src', [`'self'`]],
    // Fuerza HTTPS en subrecursos (defensa en profundidad junto a HSTS — S1).
    ['upgrade-insecure-requests', ''],
  ];

  return directives
    .map(([name, value]) => {
      if (value === '' || (Array.isArray(value) && value.length === 0)) return name;
      const v = Array.isArray(value) ? value.join(' ') : value;
      return `${name} ${v}`;
    })
    .join('; ');
}

/**
 * Cabeceras de seguridad estáticas (no dependen del nonce).
 * Centralizadas aquí para que middleware.ts y tests las compartan.
 */
export function staticSecurityHeaders(): Record<string, string> {
  return {
    // S1 — Transporte forzado. 2 años, subdominios, candidato a preload.
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    // S4 — Anti MIME-sniffing.
    'X-Content-Type-Options': 'nosniff',
    // S4 — Anti-clickjacking (defensa en profundidad junto a frame-ancestors).
    'X-Frame-Options': 'DENY',
    // S4 — No filtrar la URL completa a orígenes cruzados.
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    // S4 — Desactiva APIs potentes que la web no usa + opt-out de FLoC.
    'Permissions-Policy':
      'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), browsing-topics=(), interest-cohort=()',
    // Aislamiento de ventana (mitiga ataques tipo XS-Leaks / tabnabbing).
    'Cross-Origin-Opener-Policy': 'same-origin',
    // Las respuestas de navegación no deben ser embebibles como subrecurso cross-origin.
    'Cross-Origin-Resource-Policy': 'same-origin',
    // Sin caché de credenciales en proxies para respuestas sensibles (refuerzo).
    'X-DNS-Prefetch-Control': 'off',
  };
}

/** Nombre de la cabecera que transporta el nonce hacia el layout (Server Components). */
export const NONCE_HEADER = 'x-nonce';
