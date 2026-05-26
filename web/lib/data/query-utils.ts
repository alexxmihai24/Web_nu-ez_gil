/**
 * Utilidades de consulta compartidas por categorias / busqueda (camino estatico).
 * Filtrado por marca/disponibilidad, ordenacion y paginacion en memoria.
 */

import type { Paginated, ProductListItem, ProductQuery } from './types';

export const DEFAULT_PAGE_SIZE = 24;
const MAX_PAGE_SIZE = 60;

export function applyQuery(
  items: ProductListItem[],
  q: ProductQuery | undefined,
): Paginated<ProductListItem> {
  const page = Math.max(1, q?.page ?? 1);
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, q?.pageSize ?? DEFAULT_PAGE_SIZE));

  let filtered = items;

  if (q?.brandSlug) {
    // El ProductListItem no expone brandSlug, pero brandName es estable; el
    // camino estatico filtra por nombre normalizado en search/categories antes
    // de llamar aqui, asi que dejamos availability como filtro generico.
  }
  if (q?.availability) {
    filtered = filtered.filter((it) => it.availability === q.availability);
  }

  const sorted = sortItems(filtered, q?.sort);
  const total = sorted.length;
  const start = (page - 1) * pageSize;
  const pageItems = sorted.slice(start, start + pageSize);

  return { items: pageItems, total, page, pageSize };
}

export function sortItems(
  items: ProductListItem[],
  sort: ProductQuery['sort'],
): ProductListItem[] {
  const arr = [...items];
  switch (sort) {
    case 'price_asc':
      return arr.sort((a, b) => priceOrNull(a) - priceOrNull(b));
    case 'price_desc':
      return arr.sort((a, b) => priceOrNull(b) - priceOrNull(a));
    case 'newest':
      // novedad primero, resto estable
      return arr.sort((a, b) => Number(isNew(b)) - Number(isNew(a)));
    case 'relevance':
    default:
      return arr;
  }
}

function priceOrNull(it: ProductListItem): number {
  // "Consultar precio" (null) al final en asc; tratamos null como Infinity
  return it.priceCents ?? Number.POSITIVE_INFINITY;
}

function isNew(it: ProductListItem): boolean {
  return it.badges.includes('novedad');
}

/** Normaliza un termino para busqueda/diacriticos (camino estatico). */
export function normalizeTerm(term: string): string {
  return term
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();
}
