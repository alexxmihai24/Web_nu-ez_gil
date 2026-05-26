import type { Metadata } from 'next';
import { SITE, absoluteUrl } from './config';

/**
 * Helpers para construir `Metadata` (Next App Router) por plantilla, con límites
 * SEO aplicados: title ≤ 60 car., description ≤ 155 car. La template del layout
 * añade el sufijo " · Núñez Gil" automáticamente, por lo que los `title` que se
 * pasan aquí son SOLO el segmento propio de la página (sin marca), salvo `home`.
 *
 * Frontend puede adoptar `buildMetadata()` en sus rutas dinámicas (categoría,
 * producto, marca) llamándolo desde `generateMetadata()`.
 */

const TITLE_MAX = 60;
const DESC_MAX = 155;

/** Trunca respetando palabras y añade «…» si se corta. */
export function truncate(text: string, max: number): string {
  const t = text.trim().replace(/\s+/g, ' ');
  if (t.length <= max) return t;
  const slice = t.slice(0, max - 1);
  const lastSpace = slice.lastIndexOf(' ');
  return `${(lastSpace > max * 0.6 ? slice.slice(0, lastSpace) : slice).trimEnd()}…`;
}

export interface BuildMetadataInput {
  /** Segmento propio del título (la marca la añade la template del layout). */
  title: string;
  description: string;
  /** Ruta relativa para el canonical (p. ej. "/contacto"). */
  path: string;
  /** Imagen OG específica (ruta o URL absoluta). Por defecto, la de marca. */
  ogImage?: string;
  /** OG type — "website" por defecto, "article" para posts. */
  ogType?: 'website' | 'article';
  /** Marca noindex (login, carrito, búsqueda, etc.). */
  noindex?: boolean;
  /**
   * Si el título ya incluye la marca y NO debe pasar por la template del layout
   * (caso de la home). Cuando es true, se usa `title.absolute`.
   */
  absoluteTitle?: boolean;
}

export function buildMetadata({
  title,
  description,
  path,
  ogImage = SITE.defaultOgImage,
  ogType = 'website',
  noindex = false,
  absoluteTitle = false,
}: BuildMetadataInput): Metadata {
  const safeTitle = truncate(title, TITLE_MAX);
  const safeDescription = truncate(description, DESC_MAX);
  const canonical = path; // relativo: Next lo resuelve contra metadataBase
  const ogImageUrl = ogImage.startsWith('http') ? ogImage : absoluteUrl(ogImage);

  return {
    title: absoluteTitle ? { absolute: safeTitle } : safeTitle,
    description: safeDescription,
    alternates: { canonical },
    openGraph: {
      type: ogType,
      locale: SITE.locale,
      siteName: SITE.name,
      url: absoluteUrl(path),
      title: safeTitle,
      description: safeDescription,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: SITE.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: safeTitle,
      description: safeDescription,
      images: [ogImageUrl],
    },
    robots: noindex
      ? { index: false, follow: true }
      : { index: true, follow: true, 'max-image-preview': 'large' },
  };
}
