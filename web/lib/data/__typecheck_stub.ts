// TEMP stub (borrar) — solo para validar el contrato del Frontend contra types.ts.
import type {
  Category, ProductListItem, ProductDetail, Paginated, ProductQuery, Brand, Badge,
} from './types';
export async function getDepartments(): Promise<Category[]> { return []; }
export async function getCategoryBySlug(_s: string): Promise<Category | null> { return null; }
export async function getProductsByCategory(_s: string, _q?: ProductQuery): Promise<Paginated<ProductListItem>> { return { items: [], total: 0, page: 1, pageSize: 24 }; }
export async function getProductBySlug(_s: string): Promise<ProductDetail | null> { return null; }
export async function getBrands(): Promise<Brand[]> { return []; }
export async function getFeatured(_k: Badge): Promise<ProductListItem[]> { return []; }
export async function searchProducts(_t: string, _q?: ProductQuery): Promise<Paginated<ProductListItem>> { return { items: [], total: 0, page: 1, pageSize: 24 }; }
