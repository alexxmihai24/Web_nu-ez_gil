/**
 * CAPA DE DATOS — implementación del contrato (lib/data/types.ts).
 *
 * Despacho según entorno (ver dbavailable.ts):
 *   - Con DATABASE_URL  → camino Prisma/Postgres (./productdb), import diferido para
 *     no incluir @prisma/client en el bundle del camino estático.
 *   - Sin DATABASE_URL  → dataset estático de respaldo (./static-store + ./seeddata),
 *     que es lo que sirve el catálogo público mientras no se migra a Postgres.
 *
 * Todas las funciones devuelven Promesas (contrato bloqueado), aunque el camino
 * estático resuelva de forma síncrona.
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
import { hasDatabase } from './dbavailable';
import { getStore } from './static-store';
import { applyQuery, normalizeTerm } from './query-utils';

const FEATURED_LIMIT = 12;

// ---------------------------------------------------------------------------
// Camino estático (sin DB) — derivado del dataset memoizado en static-store.ts
// ---------------------------------------------------------------------------

function staticDepartments(): Category[] {
  return getStore().departments;
}

function staticCategoryBySlug(slug: string): Category | null {
  return getStore().categoriesBySlug.get(slug) ?? null;
}

function staticProductsByCategory(slug: string, q?: ProductQuery): Paginated<ProductListItem> {
  const items = getStore().productsByCategorySlug.get(slug) ?? [];
  return applyQuery(items, q);
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
    // Página de marca: el filtro es la marca; el término (su nombre) es redundante.
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

// ---------------------------------------------------------------------------
// API pública del contrato — despacha DB ↔ estático
// ---------------------------------------------------------------------------

export async function getDepartments(): Promise<Category[]> {
  if (hasDatabase()) return (await import('./productdb')).dbGetDepartments();
  return staticDepartments();
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  if (hasDatabase()) return (await import('./productdb')).dbGetCategoryBySlug(slug);
  return staticCategoryBySlug(slug);
}

export async function getProductsByCategory(
  slug: string,
  q?: ProductQuery,
): Promise<Paginated<ProductListItem>> {
  if (hasDatabase()) return (await import('./productdb')).dbGetProductsByCategory(slug, q);
  return staticProductsByCategory(slug, q);
}

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  if (hasDatabase()) return (await import('./productdb')).dbGetProductBySlug(slug);
  return staticProductBySlug(slug);
}

export async function getBrands(): Promise<Brand[]> {
  if (hasDatabase()) return (await import('./productdb')).dbGetBrands();
  return staticBrands();
}

export async function getFeatured(kind: Badge): Promise<ProductListItem[]> {
  if (hasDatabase()) return (await import('./productdb')).dbGetFeatured(kind);
  return staticFeatured(kind);
}

export async function searchProducts(
  term: string,
  q?: ProductQuery,
): Promise<Paginated<ProductListItem>> {
  if (hasDatabase()) return (await import('./productdb')).dbSearchProducts(term, q);
  return staticSearch(term, q);
}
