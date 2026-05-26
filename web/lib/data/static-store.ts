/**
 * Capa de acceso al DATASET ESTATICO (sin DB).
 * Construye, una sola vez (memoizado), las estructuras derivadas que consumen
 * las funciones de lib/data cuando no hay DATABASE_URL.
 */

import type {
  Brand,
  Category,
  ProductDetail,
  ProductListItem,
  Availability,
  Badge,
} from './types';
import {
  seedBrands,
  seedCategories,
  seedProducts,
  type SeedProduct,
} from './seeddata';

// --- Indices y arboles memoizados -------------------------------------------

interface BuiltStore {
  categoriesBySlug: Map<string, Category>;
  departments: Category[]; // arbol nivel 1 con children anidados
  brands: Brand[];
  brandsBySlug: Map<string, Brand>;
  listItems: ProductListItem[]; // todos los productos como ProductListItem
  details: Map<string, ProductDetail>; // por slug de producto
  productsByCategorySlug: Map<string, ProductListItem[]>; // incluye subcategorias
}

let _store: BuiltStore | null = null;

function firstVariantPricing(p: SeedProduct): {
  priceCents: number | null;
  oldPriceCents: number | null;
  unitPriceCents: number | null;
  availability: Availability;
} {
  const v = p.variants[0];
  if (!v) {
    return { priceCents: null, oldPriceCents: null, unitPriceCents: null, availability: 'on_order' };
  }
  return {
    priceCents: v.priceCents ?? null,
    oldPriceCents: v.oldPriceCents ?? null,
    unitPriceCents: v.unitPriceCents ?? null,
    availability: v.availability,
  };
}

function toListItem(p: SeedProduct, brandsBySlug: Map<string, Brand>): ProductListItem {
  const pricing = firstVariantPricing(p);
  const brand = p.brandSlug ? brandsBySlug.get(p.brandSlug) : null;
  return {
    id: p.slug,
    slug: p.slug,
    name: p.name,
    reference: p.reference,
    brandName: brand?.name ?? null,
    imageUrl: p.imageUrl ?? null,
    priceCents: pricing.priceCents,
    oldPriceCents: pricing.oldPriceCents,
    availability: pricing.availability,
    badges: p.badges ?? [],
  };
}

/** Sube por la cadena de padres para construir breadcrumb + buscar ancestros. */
function ancestorsOf(slug: string, bySlug: Map<string, Category>): Category[] {
  const chain: Category[] = [];
  let cur = bySlug.get(slug) ?? null;
  while (cur) {
    chain.unshift(cur);
    cur = cur.parentSlug ? bySlug.get(cur.parentSlug) ?? null : null;
  }
  return chain;
}

/** Todos los slugs descendientes (incl. el propio) de una categoria. */
function descendantSlugs(slug: string, childrenByParent: Map<string, Category[]>): Set<string> {
  const out = new Set<string>([slug]);
  const stack = [slug];
  while (stack.length) {
    const s = stack.pop()!;
    for (const child of childrenByParent.get(s) ?? []) {
      if (!out.has(child.slug)) {
        out.add(child.slug);
        stack.push(child.slug);
      }
    }
  }
  return out;
}

function build(): BuiltStore {
  // 1) Categorias planas -> Map + arbol
  const categoriesBySlug = new Map<string, Category>();
  for (const c of seedCategories) {
    categoriesBySlug.set(c.slug, {
      id: c.slug,
      slug: c.slug,
      name: c.name,
      level: c.level,
      parentSlug: c.parentSlug,
      imageUrl: c.imageUrl ?? null,
      children: [],
    });
  }

  const childrenByParent = new Map<string, Category[]>();
  const departments: Category[] = [];
  // ordenar por position estable
  const ordered = [...seedCategories].sort((a, b) => a.position - b.position);
  for (const c of ordered) {
    const node = categoriesBySlug.get(c.slug)!;
    if (c.parentSlug) {
      const arr = childrenByParent.get(c.parentSlug) ?? [];
      arr.push(node);
      childrenByParent.set(c.parentSlug, arr);
    } else {
      departments.push(node);
    }
  }
  // enlazar children en el arbol (clonando para no mutar children compartidos)
  for (const [parentSlug, kids] of childrenByParent) {
    const parent = categoriesBySlug.get(parentSlug);
    if (parent) parent.children = kids;
  }

  // 2) Marcas
  const brands: Brand[] = [...seedBrands]
    .sort((a, b) => a.position - b.position)
    .map((b) => ({ id: b.slug, slug: b.slug, name: b.name, logoUrl: b.logoUrl ?? null }));
  const brandsBySlug = new Map(brands.map((b) => [b.slug, b]));

  // 3) Productos -> ListItem + Detail
  const listItems: ProductListItem[] = [];
  const details = new Map<string, ProductDetail>();
  const directByCategory = new Map<string, ProductListItem[]>();

  for (const p of seedProducts) {
    const item = toListItem(p, brandsBySlug);
    listItems.push(item);

    const arr = directByCategory.get(p.categorySlug) ?? [];
    arr.push(item);
    directByCategory.set(p.categorySlug, arr);

    const crumbs = ancestorsOf(p.categorySlug, categoriesBySlug).map((c) => ({
      name: c.name,
      slug: c.slug,
    }));
    details.set(p.slug, {
      ...item,
      description: p.description ?? null,
      specs: p.specs ?? [],
      gallery: p.gallery && p.gallery.length ? p.gallery : item.imageUrl ? [item.imageUrl] : [],
      categorySlug: p.categorySlug,
      breadcrumb: crumbs,
    });
  }

  // 4) productos por categoria, agregando subarbol (un depto muestra todo lo de sus hijos)
  const productsByCategorySlug = new Map<string, ProductListItem[]>();
  for (const c of seedCategories) {
    const slugs = descendantSlugs(c.slug, childrenByParent);
    const collected: ProductListItem[] = [];
    const seen = new Set<string>();
    for (const s of slugs) {
      for (const it of directByCategory.get(s) ?? []) {
        if (!seen.has(it.id)) {
          seen.add(it.id);
          collected.push(it);
        }
      }
    }
    productsByCategorySlug.set(c.slug, collected);
  }

  return {
    categoriesBySlug,
    departments,
    brands,
    brandsBySlug,
    listItems,
    details,
    productsByCategorySlug,
  };
}

export function getStore(): BuiltStore {
  if (!_store) _store = build();
  return _store;
}

export type { Badge };
