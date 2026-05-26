/**
 * CAPA DE DATOS — implementación del contrato (lib/data/types.ts).
 *
 * Despacho:
 *   - Supabase configurado  → camino `./supabasedata` (supabase-js + RLS lectura pública).
 *   - Si Supabase falla o no está configurado → dataset estático de respaldo
 *     (`./static-store` + `./seeddata`), para que la web nunca se quede en blanco.
 *
 * Las páginas consumen estas firmas (contrato bloqueado). Los nombres internos del
 * camino Supabase están en español; estas firmas se mantienen por compatibilidad.
 */

import type {
  Badge,
  Brand,
  Category,
  Paginated,
  ProductDetail,
  ProductListItem,
  ProductQuery,
} from './types';
import { supabaseConfigurado } from '@/lib/supabase/cliente';
import { getStore } from './static-store';
import { applyQuery, normalizeTerm } from './query-utils';
import * as sb from './supabasedata';

const FEATURED_LIMIT = 12;

// ---------------------------------------------------------------------------
// Camino estático (respaldo) — derivado del dataset memoizado en static-store.ts
// ---------------------------------------------------------------------------

function staticDepartments(): Category[] {
  return getStore().departments;
}
function staticCategoryBySlug(slug: string): Category | null {
  return getStore().categoriesBySlug.get(slug) ?? null;
}
function staticProductsByCategory(slug: string, q?: ProductQuery): Paginated<ProductListItem> {
  return applyQuery(getStore().productsByCategorySlug.get(slug) ?? [], q);
}
function staticProductBySlug(slug: string): ProductDetail | null {
  return getStore().details.get(slug) ?? null;
}
function staticBrands(): Brand[] {
  return getStore().brands;
}
function staticFeatured(kind: Badge): ProductListItem[] {
  return getStore()
    .listItems.filter((it) => it.badges.includes(kind))
    .slice(0, FEATURED_LIMIT);
}
function staticSearch(term: string, q?: ProductQuery): Paginated<ProductListItem> {
  const store = getStore();
  let base: ProductListItem[];
  if (q?.brandSlug) {
    const brand = store.brandsBySlug.get(q.brandSlug);
    base = brand ? store.listItems.filter((it) => it.brandName === brand.name) : [];
  } else {
    const nt = normalizeTerm(term);
    base = nt
      ? store.listItems.filter(
          (it) =>
            normalizeTerm(it.name).includes(nt) ||
            normalizeTerm(it.reference).includes(nt) ||
            (it.brandName ? normalizeTerm(it.brandName).includes(nt) : false),
        )
      : [];
  }
  return applyQuery(base, q);
}

/** Ejecuta el camino Supabase y, si lanza (p. ej. tablas aún sin crear), usa el respaldo. */
async function conRespaldo<T>(supabasePath: () => Promise<T>, respaldo: () => T): Promise<T> {
  if (!supabaseConfigurado) return respaldo();
  try {
    return await supabasePath();
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[lib/data] Supabase falló, usando dataset estático:', (e as Error).message);
    }
    return respaldo();
  }
}

// ---------------------------------------------------------------------------
// API pública del contrato
// ---------------------------------------------------------------------------

export function getDepartments(): Promise<Category[]> {
  return conRespaldo(sb.obtenerDepartamentos, staticDepartments);
}
export function getCategoryBySlug(slug: string): Promise<Category | null> {
  return conRespaldo(() => sb.obtenerCategoriaPorSlug(slug), () => staticCategoryBySlug(slug));
}
export function getProductsByCategory(
  slug: string,
  q?: ProductQuery,
): Promise<Paginated<ProductListItem>> {
  return conRespaldo(() => sb.obtenerProductosPorCategoria(slug, q), () => staticProductsByCategory(slug, q));
}
export function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  return conRespaldo(() => sb.obtenerProductoPorSlug(slug), () => staticProductBySlug(slug));
}
export function getBrands(): Promise<Brand[]> {
  return conRespaldo(sb.obtenerMarcas, staticBrands);
}
export function getFeatured(kind: Badge): Promise<ProductListItem[]> {
  return conRespaldo(() => sb.obtenerDestacados(kind), () => staticFeatured(kind));
}
export function searchProducts(term: string, q?: ProductQuery): Promise<Paginated<ProductListItem>> {
  return conRespaldo(() => sb.buscarProductos(term, q), () => staticSearch(term, q));
}
