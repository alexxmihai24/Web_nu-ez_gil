import type { MetadataRoute } from 'next';
import { SITE, absoluteUrl } from '@/lib/seo';
import type { Category, Brand } from '@/lib/data/types';

/**
 * Sitemap dinámico (sustituye el XML estático de 2022 con URLs http://).
 * Un único sitemap (el catálogo ronda ~200 categorías + N productos, lejos del
 * límite de 50k URLs). Incluye: páginas estáticas indexables, árbol de categorías
 * (vía @/lib/data) y marcas. Se EXCLUYEN rutas noindex (acceso, carrito, checkout,
 * buscador) y las legales se mantienen con baja relevancia (sin priority, que
 * Google ignora).
 *
 * Resiliencia: la capa de datos (@/lib/data) la implementa Backend en paralelo.
 * Si aún no está disponible o falla, el sitemap degrada a las páginas estáticas
 * en lugar de romper el build.
 */

export const revalidate = 3600; // 1 h

const STATIC_PATHS: Array<{ path: string; priority?: number }> = [
  { path: '/', priority: 1 },
  { path: '/marcas', priority: 0.6 },
  { path: '/quienes-somos', priority: 0.5 },
  { path: '/contacto', priority: 0.5 },
  { path: '/noticias', priority: 0.5 },
  { path: '/legal/aviso-legal', priority: 0.2 },
  { path: '/legal/privacidad', priority: 0.2 },
  { path: '/legal/cookies', priority: 0.2 },
  { path: '/legal/como-comprar', priority: 0.3 },
  { path: '/legal/condiciones-envio', priority: 0.3 },
];

/** Aplana el árbol de categorías a rutas, respetando la política de URLs:
 *  N1 → /{slug} · N2 → /{slug} · N3 → /{parentSlug}/{slug}. */
function categoryPaths(tree: Category[]): string[] {
  const paths = new Set<string>();
  const walk = (nodes: Category[]) => {
    for (const node of nodes) {
      const path =
        node.level === 3 && node.parentSlug
          ? `/${node.parentSlug}/${node.slug}`
          : `/${node.slug}`;
      paths.add(path);
      if (node.children?.length) walk(node.children);
    }
  };
  walk(tree);
  return [...paths];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map(({ path, priority }) => ({
    url: absoluteUrl(path),
    lastModified: now,
    changeFrequency: 'weekly',
    priority,
  }));

  // Catálogo dinámico — import diferido y tolerante a fallos (Backend en paralelo).
  let dynamicEntries: MetadataRoute.Sitemap = [];
  try {
    const data = await import('@/lib/data');
    const [tree, brands] = await Promise.all([
      data.getDepartments?.() ?? Promise.resolve([] as Category[]),
      data.getBrands?.() ?? Promise.resolve([] as Brand[]),
    ]);

    const categoryEntries: MetadataRoute.Sitemap = categoryPaths(tree).map((path) => ({
      url: absoluteUrl(path),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    const brandEntries: MetadataRoute.Sitemap = brands.map((brand) => ({
      url: absoluteUrl(`/marcas/${brand.slug}`),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    }));

    dynamicEntries = [...categoryEntries, ...brandEntries];
  } catch {
    // @/lib/data aún no disponible: degradar a estáticas. El sitemap se
    // recompleta tras el build conjunto cuando Backend exponga las funciones.
    dynamicEntries = [];
  }

  return [...staticEntries, ...dynamicEntries].filter((e) => e.url.startsWith(SITE.url));
}
