/**
 * Constantes SEO compartidas — fuente de verdad para NAP, host canónico y datos
 * de marca usados por metadatos y JSON-LD. Mantener coherente con app/layout.tsx
 * (metadataBase) y con el footer/contacto (NAP idéntico carácter a carácter).
 *
 * Host canónico CONFIRMADO en app/layout.tsx: https://nunezgil.com (SIN www).
 * Separador de título CONFIRMADO en la template del layout: " · ".
 */

export const SITE = {
  /** Host canónico SIN barra final. Coincide con metadataBase del layout. */
  url: 'https://nunezgil.com',
  name: 'Núñez Gil',
  legalName: 'NÚÑEZ GIL MAYORISTA DE HOSTELERÍA E INDUSTRIAL, S.L.',
  /** CIF / VAT intracomunitario. */
  vatID: 'ESB14784235',
  foundingDate: '1994',
  locale: 'es_ES',
  /** Imagen Open Graph por defecto (1200×630). El asset lo genera Diseño. */
  defaultOgImage: '/og/default.jpg',
  logo: '/logo.png',
} as const;

/** NAP (Name-Address-Phone) — debe ser idéntico en web, JSON-LD y directorios. */
export const NAP = {
  streetAddress: 'C/ Pilas de Panchía, 2',
  postalCode: '14550',
  addressLocality: 'Montilla',
  addressRegion: 'Córdoba',
  addressCountry: 'ES',
  /** Teléfono fijo en formato E.164 para tel: y JSON-LD. */
  telephone: '+34957655388',
  telephoneDisplay: '957 65 53 88',
  mobile: '+34600578187',
  mobileDisplay: '600 57 81 87',
  email: 'info@nunezgil.com',
} as const;

/** Áreas de servicio declaradas en LocalBusiness. */
export const AREA_SERVED = ['Montilla', 'Córdoba', 'Andalucía', 'España'] as const;

/**
 * Coordenadas geográficas: PENDIENTE de confirmar con el cliente (lat/lng exactas
 * de la nave). No se inventan: si están a null, el JSON-LD omite `geo`.
 */
export const GEO: { latitude: number; longitude: number } | null = null;

/** Construye una URL absoluta canónica a partir de una ruta relativa. */
export function absoluteUrl(path = '/'): string {
  if (path.startsWith('http')) return path;
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${SITE.url}${clean === '/' ? '' : clean}`;
}
