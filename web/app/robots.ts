import type { MetadataRoute } from 'next';
import { SITE, absoluteUrl } from '@/lib/seo';

/**
 * robots.txt dinámico. Permite el rastreo general y bloquea rutas
 * transaccionales/privadas y variantes de orden/paginación que generan crawl
 * waste. NO se bloquean CSS/JS ni /marcas (Google necesita renderizar).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/acceso',
          '/carrito',
          '/checkout',
          '/area-clientes',
          '/buscador',
          '/*?*orderby=',
          '/*?*sort=',
          '/*?*mostrar=',
          '/*?*pageSize=',
        ],
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: SITE.url,
  };
}
