/**
 * Helpers Prisma compartidos para mapear Product -> ProductListItem y construir
 * select / orderBy / paginacion. Solo se usan en el camino con base de datos.
 * Import dinamico desde categories.ts / products.ts / search.ts (nunca en local sin DB).
 */

import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import type {
  Availability,
  Badge,
  Brand,
  Category,
  Paginated,
  ProductDetail,
  ProductListItem,
  ProductQuery,
} from './types';
import { DEFAULT_PAGE_SIZE } from './query-utils';

const FEATURED_LIMIT = 12;

/** Campos minimos para pintar una tarjeta de producto. */
export const listItemSelect = {
  id: true,
  slug: true,
  name: true,
  reference: true,
  isNew: true,
  isOffer: true,
  isOutlet: true,
  brand: { select: { name: true } },
  images: { orderBy: { position: 'asc' }, take: 1, select: { url: true } },
  variants: {
    where: { isActive: true, deletedAt: null },
    orderBy: { position: 'asc' },
    take: 1,
    select: { priceCents: true, oldPriceCents: true, availability: true },
  },
} satisfies Prisma.ProductSelect;

type ListRow = Prisma.ProductGetPayload<{ select: typeof listItemSelect }>;

export function toListItem(p: ListRow): ProductListItem {
  const v = p.variants[0];
  const badges: Badge[] = [];
  if (p.isNew) badges.push('novedad');
  if (p.isOffer) badges.push('oferta');
  if (p.isOutlet) badges.push('outlet');
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    reference: p.reference,
    brandName: p.brand?.name ?? null,
    imageUrl: p.images[0]?.url ?? null,
    priceCents: v?.priceCents ?? null,
    oldPriceCents: v?.oldPriceCents ?? null,
    availability: (v?.availability as Availability) ?? 'on_order',
    badges,
  };
}

export function orderByFor(q?: ProductQuery): Prisma.ProductOrderByWithRelationInput[] {
  switch (q?.sort) {
    case 'newest':
      return [{ isNew: 'desc' }, { createdAt: 'desc' }];
    case 'price_asc':
    case 'price_desc':
      return [{ name: 'asc' }];
    case 'relevance':
    default:
      return [{ isFeatured: 'desc' }, { name: 'asc' }];
  }
}

export function paginationFor(q?: ProductQuery): {
  skip: number;
  take: number;
  page: number;
  pageSize: number;
} {
  const page = Math.max(1, q?.page ?? 1);
  const pageSize = Math.min(60, Math.max(1, q?.pageSize ?? DEFAULT_PAGE_SIZE));
  return { skip: (page - 1) * pageSize, take: pageSize, page, pageSize };
}

function emptyPage(q?: ProductQuery): Paginated<ProductListItem> {
  const { page, pageSize } = paginationFor(q);
  return { items: [], total: 0, page, pageSize };
}

function listFilters(q?: ProductQuery): Prisma.ProductWhereInput {
  return {
    isActive: true,
    deletedAt: null,
    ...(q?.brandSlug ? { brand: { slug: q.brandSlug } } : {}),
    ...(q?.availability
      ? { variants: { some: { availability: q.availability, isActive: true, deletedAt: null } } }
      : {}),
  };
}

// ---------------------------------------------------------------------------
// CONTRATO (lib/data/types.ts) — camino Prisma/Postgres.
// Importado de forma diferida desde index.ts SOLO cuando hay DATABASE_URL.
// ---------------------------------------------------------------------------

export async function dbGetBrands(): Promise<Brand[]> {
  const rows = await prisma.brand.findMany({
    where: { isActive: true, deletedAt: null },
    orderBy: [{ position: 'asc' }, { name: 'asc' }],
    select: { id: true, slug: true, name: true, logoUrl: true },
  });
  return rows.map((b) => ({ id: b.id, slug: b.slug, name: b.name, logoUrl: b.logoUrl }));
}

export async function dbGetDepartments(): Promise<Category[]> {
  const rows = await prisma.category.findMany({
    where: { isActive: true, deletedAt: null },
    orderBy: [{ level: 'asc' }, { position: 'asc' }],
    select: { id: true, slug: true, name: true, level: true, parentId: true, imageUrl: true },
  });
  const slugById = new Map(rows.map((c) => [c.id, c.slug]));
  const nodes = new Map<string, Category>();
  for (const c of rows) {
    nodes.set(c.id, {
      id: c.id,
      slug: c.slug,
      name: c.name,
      level: c.level as 1 | 2 | 3,
      parentSlug: c.parentId ? slugById.get(c.parentId) ?? null : null,
      imageUrl: c.imageUrl,
      children: [],
    });
  }
  const roots: Category[] = [];
  for (const c of rows) {
    const node = nodes.get(c.id)!;
    const parent = c.parentId ? nodes.get(c.parentId) : undefined;
    if (parent) parent.children!.push(node);
    else roots.push(node);
  }
  return roots;
}

export async function dbGetCategoryBySlug(slug: string): Promise<Category | null> {
  const c = await prisma.category.findFirst({
    where: { slug, isActive: true, deletedAt: null },
    select: {
      id: true,
      slug: true,
      name: true,
      level: true,
      imageUrl: true,
      parent: { select: { slug: true } },
      children: {
        where: { isActive: true, deletedAt: null },
        orderBy: { position: 'asc' },
        select: { id: true, slug: true, name: true, level: true, imageUrl: true },
      },
    },
  });
  if (!c) return null;
  return {
    id: c.id,
    slug: c.slug,
    name: c.name,
    level: c.level as 1 | 2 | 3,
    parentSlug: c.parent?.slug ?? null,
    imageUrl: c.imageUrl,
    children: c.children.map((ch) => ({
      id: ch.id,
      slug: ch.slug,
      name: ch.name,
      level: ch.level as 1 | 2 | 3,
      parentSlug: c.slug,
      imageUrl: ch.imageUrl,
      children: [],
    })),
  };
}

/** Ids de la categoría y todos sus descendientes (un departamento muestra su subárbol). */
async function descendantCategoryIds(slug: string): Promise<string[]> {
  const all = await prisma.category.findMany({
    where: { isActive: true, deletedAt: null },
    select: { id: true, slug: true, parentId: true },
  });
  const root = all.find((c) => c.slug === slug);
  if (!root) return [];
  const childrenByParent = new Map<string, string[]>();
  for (const c of all) {
    if (!c.parentId) continue;
    const arr = childrenByParent.get(c.parentId) ?? [];
    arr.push(c.id);
    childrenByParent.set(c.parentId, arr);
  }
  const ids = new Set<string>([root.id]);
  const stack = [root.id];
  while (stack.length) {
    const id = stack.pop()!;
    for (const childId of childrenByParent.get(id) ?? []) {
      if (!ids.has(childId)) {
        ids.add(childId);
        stack.push(childId);
      }
    }
  }
  return [...ids];
}

export async function dbGetProductsByCategory(
  slug: string,
  q?: ProductQuery,
): Promise<Paginated<ProductListItem>> {
  const ids = await descendantCategoryIds(slug);
  if (ids.length === 0) return emptyPage(q);
  const where: Prisma.ProductWhereInput = {
    ...listFilters(q),
    categories: { some: { categoryId: { in: ids } } },
  };
  const { skip, take, page, pageSize } = paginationFor(q);
  const [rows, total] = await Promise.all([
    prisma.product.findMany({ where, select: listItemSelect, orderBy: orderByFor(q), skip, take }),
    prisma.product.count({ where }),
  ]);
  return { items: rows.map(toListItem), total, page, pageSize };
}

export async function dbGetFeatured(kind: Badge): Promise<ProductListItem[]> {
  const flag: Prisma.ProductWhereInput =
    kind === 'novedad' ? { isNew: true } : kind === 'oferta' ? { isOffer: true } : { isOutlet: true };
  const rows = await prisma.product.findMany({
    where: { isActive: true, deletedAt: null, ...flag },
    select: listItemSelect,
    orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
    take: FEATURED_LIMIT,
  });
  return rows.map(toListItem);
}

export async function dbSearchProducts(
  term: string,
  q?: ProductQuery,
): Promise<Paginated<ProductListItem>> {
  const t = term.trim();
  if (!t && !q?.brandSlug) return emptyPage(q);
  const where: Prisma.ProductWhereInput = {
    ...listFilters(q),
    ...(t && !q?.brandSlug
      ? {
          OR: [
            { name: { contains: t, mode: 'insensitive' } },
            { reference: { contains: t, mode: 'insensitive' } },
            { brand: { name: { contains: t, mode: 'insensitive' } } },
          ],
        }
      : {}),
  };
  const { skip, take, page, pageSize } = paginationFor(q);
  const [rows, total] = await Promise.all([
    prisma.product.findMany({ where, select: listItemSelect, orderBy: orderByFor(q), skip, take }),
    prisma.product.count({ where }),
  ]);
  return { items: rows.map(toListItem), total, page, pageSize };
}

function buildBreadcrumb(primary: {
  slug: string;
  name: string;
  parent: { slug: string; name: string; parent: { slug: string; name: string } | null } | null;
}): Array<{ name: string; slug: string }> {
  const out: Array<{ name: string; slug: string }> = [];
  const p2 = primary.parent;
  const p3 = p2?.parent ?? null;
  if (p3) out.push({ name: p3.name, slug: p3.slug });
  if (p2) out.push({ name: p2.name, slug: p2.slug });
  out.push({ name: primary.name, slug: primary.slug });
  return out;
}

export async function dbGetProductBySlug(slug: string): Promise<ProductDetail | null> {
  const p = await prisma.product.findFirst({
    where: { slug, isActive: true, deletedAt: null },
    select: {
      id: true,
      slug: true,
      name: true,
      reference: true,
      description: true,
      isNew: true,
      isOffer: true,
      isOutlet: true,
      brand: { select: { name: true } },
      images: { orderBy: { position: 'asc' }, select: { url: true } },
      variants: {
        where: { isActive: true, deletedAt: null },
        orderBy: { position: 'asc' },
        take: 1,
        select: { priceCents: true, oldPriceCents: true, availability: true },
      },
      categories: {
        where: { isPrimary: true },
        take: 1,
        select: {
          category: {
            select: {
              slug: true,
              name: true,
              parent: {
                select: {
                  slug: true,
                  name: true,
                  parent: { select: { slug: true, name: true } },
                },
              },
            },
          },
        },
      },
    },
  });
  if (!p) return null;

  const v = p.variants[0];
  const badges: Badge[] = [];
  if (p.isNew) badges.push('novedad');
  if (p.isOffer) badges.push('oferta');
  if (p.isOutlet) badges.push('outlet');
  const imageUrl = p.images[0]?.url ?? null;
  const primary = p.categories[0]?.category ?? null;

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    reference: p.reference,
    brandName: p.brand?.name ?? null,
    imageUrl,
    priceCents: v?.priceCents ?? null,
    oldPriceCents: v?.oldPriceCents ?? null,
    availability: (v?.availability as Availability) ?? 'on_order',
    badges,
    description: p.description,
    specs: [],
    gallery: p.images.length ? p.images.map((i) => i.url) : imageUrl ? [imageUrl] : [],
    categorySlug: primary?.slug ?? '',
    breadcrumb: primary ? buildBreadcrumb(primary) : [],
  };
}
