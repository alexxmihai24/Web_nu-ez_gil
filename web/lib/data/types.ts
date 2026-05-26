/**
 * CONTRATO DE DATOS COMPARTIDO (Fase 2) — base bloqueada.
 * Backend Architect IMPLEMENTA estas funciones (en lib/data/*.ts) y Frontend Developer
 * las CONSUME. Ningún agente edita este archivo: si hace falta cambiarlo, anótalo en
 * el resumen para que lo ajuste el orquestador (evita colisiones en paralelo).
 *
 * Precios: enteros en CÉNTIMOS, sin IVA (decisión cliente: precios públicos + "I.V.A. no incluido").
 */

export type Availability = 'in_stock' | 'on_order' | 'out_of_stock';
export type Badge = 'novedad' | 'oferta' | 'outlet';

export interface Brand {
  id: string;
  slug: string;
  name: string;
  logoUrl?: string | null;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  level: 1 | 2 | 3; // Departamento → Categoría → Subcategoría
  parentSlug?: string | null;
  imageUrl?: string | null;
  children?: Category[];
}

export interface ProductListItem {
  id: string;
  slug: string;
  name: string;
  reference: string;
  brandName?: string | null;
  imageUrl?: string | null; // null → el ProductCard usa fallback de marca (nunca 1×1)
  priceCents?: number | null; // null → "Consultar precio"
  oldPriceCents?: number | null; // para badge Oferta (precio tachado)
  availability: Availability;
  badges: Badge[];
}

export interface ProductDetail extends ProductListItem {
  description?: string | null;
  specs?: Array<{ label: string; value: string }>;
  gallery: string[];
  categorySlug: string;
  breadcrumb: Array<{ name: string; slug: string }>;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ProductQuery {
  page?: number;
  pageSize?: number;
  sort?: 'relevance' | 'price_asc' | 'price_desc' | 'newest';
  brandSlug?: string;
  availability?: Availability;
}

/**
 * Firmas que el Backend DEBE exportar desde `@/lib/data` (lib/data/index.ts):
 *
 *   getDepartments(): Promise<Category[]>                       // árbol para el mega-menú (6 universos → 13 deptos)
 *   getCategoryBySlug(slug: string): Promise<Category | null>   // con children
 *   getProductsByCategory(slug: string, q?: ProductQuery): Promise<Paginated<ProductListItem>>
 *   getProductBySlug(slug: string): Promise<ProductDetail | null>
 *   getBrands(): Promise<Brand[]>
 *   getFeatured(kind: Badge): Promise<ProductListItem[]>        // Novedades / Ofertas / Outlet
 *   searchProducts(term: string, q?: ProductQuery): Promise<Paginated<ProductListItem>>
 */
