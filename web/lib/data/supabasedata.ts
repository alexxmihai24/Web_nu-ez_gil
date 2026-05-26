/**
 * Capa de acceso al catálogo vía Supabase (supabase-js + RLS lectura pública).
 * Implementa el contrato de `./types`. Las páginas consumen `@/lib/data`, que
 * despacha aquí cuando Supabase está configurado y cae al dataset estático si no.
 * Nombres y comentarios en español (decisión de cliente).
 */
import { supabase } from '@/lib/supabase/cliente';
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
import { applyQuery } from './query-utils';

// --- Tipos de fila (la publishable key solo lee; tipamos lo que pedimos) ---
interface FilaCategoria {
  slug: string;
  nombre: string;
  nivel: number;
  parent_slug: string | null;
  imagen_url: string | null;
}
interface FilaMarca {
  slug: string;
  nombre: string;
  logo_url: string | null;
}
interface FilaVariante {
  precio_centimos: number | null;
  precio_anterior_centimos: number | null;
  disponibilidad: Availability;
  posicion: number | null;
}
interface FilaListado {
  slug: string;
  nombre: string;
  referencia: string;
  imagen_url: string | null;
  es_nuevo: boolean;
  es_oferta: boolean;
  es_outlet: boolean;
  marcas: { nombre: string } | null;
  variantes_producto: FilaVariante[] | null;
}

const cliente = () => {
  if (!supabase) throw new Error('Supabase no configurado');
  return supabase;
};

const SELECT_LISTADO =
  'slug,nombre,referencia,imagen_url,es_nuevo,es_oferta,es_outlet,marcas(nombre),variantes_producto(precio_centimos,precio_anterior_centimos,disponibilidad,posicion)';

function badgesDe(row: { es_nuevo: boolean; es_oferta: boolean; es_outlet: boolean }): Badge[] {
  const b: Badge[] = [];
  if (row.es_nuevo) b.push('novedad');
  if (row.es_oferta) b.push('oferta');
  if (row.es_outlet) b.push('outlet');
  return b;
}

function primeraVariante(variantes: FilaVariante[] | null): FilaVariante | undefined {
  return [...(variantes ?? [])].sort((a, b) => (a.posicion ?? 0) - (b.posicion ?? 0))[0];
}

function aListItem(row: FilaListado): ProductListItem {
  const v = primeraVariante(row.variantes_producto);
  return {
    id: row.slug,
    slug: row.slug,
    name: row.nombre,
    reference: row.referencia,
    brandName: row.marcas?.nombre ?? null,
    imageUrl: row.imagen_url ?? null,
    priceCents: v?.precio_centimos ?? null,
    oldPriceCents: v?.precio_anterior_centimos ?? null,
    availability: (v?.disponibilidad as Availability) ?? 'on_order',
    badges: badgesDe(row),
  };
}

function aCategoria(c: FilaCategoria, children: Category[] = []): Category {
  return {
    id: c.slug,
    slug: c.slug,
    name: c.nombre,
    level: (c.nivel as 1 | 2 | 3) ?? 1,
    parentSlug: c.parent_slug,
    imageUrl: c.imagen_url,
    children,
  };
}

function paginaVacia(q?: ProductQuery): Paginated<ProductListItem> {
  return { items: [], total: 0, page: Math.max(1, q?.page ?? 1), pageSize: q?.pageSize ?? 24 };
}

// ---------------------------------------------------------------------------
// Contrato
// ---------------------------------------------------------------------------

export async function obtenerDepartamentos(): Promise<Category[]> {
  const { data, error } = await cliente()
    .from('categorias')
    .select('slug,nombre,nivel,parent_slug,imagen_url')
    .eq('activa', true)
    .order('nivel', { ascending: true })
    .order('posicion', { ascending: true });
  if (error) throw error;

  const filas = (data ?? []) as FilaCategoria[];
  const nodos = new Map<string, Category>();
  for (const f of filas) nodos.set(f.slug, aCategoria(f));
  const raices: Category[] = [];
  for (const f of filas) {
    const nodo = nodos.get(f.slug)!;
    const padre = f.parent_slug ? nodos.get(f.parent_slug) : undefined;
    if (padre) padre.children!.push(nodo);
    else raices.push(nodo);
  }
  return raices;
}

export async function obtenerCategoriaPorSlug(slug: string): Promise<Category | null> {
  const c = cliente();
  const [{ data: cat, error: e1 }, { data: hijos, error: e2 }] = await Promise.all([
    c.from('categorias').select('slug,nombre,nivel,parent_slug,imagen_url').eq('slug', slug).maybeSingle(),
    c
      .from('categorias')
      .select('slug,nombre,nivel,parent_slug,imagen_url')
      .eq('parent_slug', slug)
      .eq('activa', true)
      .order('posicion', { ascending: true }),
  ]);
  if (e1) throw e1;
  if (e2) throw e2;
  if (!cat) return null;
  const children = ((hijos ?? []) as FilaCategoria[]).map((h) => aCategoria(h));
  return aCategoria(cat as FilaCategoria, children);
}

/** Slug + todos sus descendientes (un departamento muestra su subárbol). */
async function slugsDescendientes(slug: string): Promise<string[]> {
  const { data, error } = await cliente()
    .from('categorias')
    .select('slug,parent_slug')
    .eq('activa', true);
  if (error) throw error;
  const filas = (data ?? []) as Array<{ slug: string; parent_slug: string | null }>;
  const hijosPorPadre = new Map<string, string[]>();
  for (const f of filas) {
    if (!f.parent_slug) continue;
    const arr = hijosPorPadre.get(f.parent_slug) ?? [];
    arr.push(f.slug);
    hijosPorPadre.set(f.parent_slug, arr);
  }
  const out = new Set<string>([slug]);
  const pila = [slug];
  while (pila.length) {
    const s = pila.pop()!;
    for (const h of hijosPorPadre.get(s) ?? []) {
      if (!out.has(h)) {
        out.add(h);
        pila.push(h);
      }
    }
  }
  return [...out];
}

export async function obtenerProductosPorCategoria(
  slug: string,
  q?: ProductQuery,
): Promise<Paginated<ProductListItem>> {
  const slugs = await slugsDescendientes(slug);
  if (slugs.length === 0) return paginaVacia(q);
  const { data, error } = await cliente()
    .from('productos')
    .select(SELECT_LISTADO)
    .eq('activo', true)
    .in('categoria_slug', slugs);
  if (error) throw error;
  const items = ((data ?? []) as unknown as FilaListado[]).map(aListItem);
  return applyQuery(items, q);
}

export async function obtenerProductoPorSlug(slug: string): Promise<ProductDetail | null> {
  const c = cliente();
  const { data, error } = await c
    .from('productos')
    .select(
      'slug,nombre,referencia,descripcion,imagen_url,especificaciones,categoria_slug,es_nuevo,es_oferta,es_outlet,marcas(nombre),variantes_producto(precio_centimos,precio_anterior_centimos,disponibilidad,posicion),imagenes_producto(url,posicion)',
    )
    .eq('slug', slug)
    .eq('activo', true)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const p = data as unknown as FilaListado & {
    descripcion: string | null;
    especificaciones: Array<{ label: string; value: string }> | null;
    categoria_slug: string | null;
    imagenes_producto: Array<{ url: string; posicion: number }> | null;
  };

  const base = aListItem(p);
  const galeria = [...(p.imagenes_producto ?? [])]
    .sort((a, b) => a.posicion - b.posicion)
    .map((i) => i.url);

  // Breadcrumb subiendo por parent_slug.
  const { data: todas } = await c.from('categorias').select('slug,nombre,parent_slug');
  const mapa = new Map(((todas ?? []) as Array<{ slug: string; nombre: string; parent_slug: string | null }>).map((x) => [x.slug, x]));
  const breadcrumb: Array<{ name: string; slug: string }> = [];
  let cur = p.categoria_slug ? mapa.get(p.categoria_slug) : undefined;
  let guardia = 0;
  while (cur && guardia++ < 6) {
    breadcrumb.unshift({ name: cur.nombre, slug: cur.slug });
    cur = cur.parent_slug ? mapa.get(cur.parent_slug) : undefined;
  }

  return {
    ...base,
    description: p.descripcion ?? null,
    specs: p.especificaciones ?? [],
    gallery: galeria.length ? galeria : base.imageUrl ? [base.imageUrl] : [],
    categorySlug: p.categoria_slug ?? '',
    breadcrumb,
  };
}

export async function obtenerMarcas(): Promise<Brand[]> {
  const { data, error } = await cliente()
    .from('marcas')
    .select('slug,nombre,logo_url')
    .eq('activa', true)
    .order('posicion', { ascending: true });
  if (error) throw error;
  return ((data ?? []) as FilaMarca[]).map((m) => ({
    id: m.slug,
    slug: m.slug,
    name: m.nombre,
    logoUrl: m.logo_url,
  }));
}

export async function obtenerDestacados(tipo: Badge): Promise<ProductListItem[]> {
  const columna = tipo === 'novedad' ? 'es_nuevo' : tipo === 'oferta' ? 'es_oferta' : 'es_outlet';
  const { data, error } = await cliente()
    .from('productos')
    .select(SELECT_LISTADO)
    .eq('activo', true)
    .eq(columna, true)
    .order('destacado', { ascending: false })
    .order('creado_en', { ascending: false })
    .limit(12);
  if (error) throw error;
  return ((data ?? []) as unknown as FilaListado[]).map(aListItem);
}

export async function buscarProductos(
  termino: string,
  q?: ProductQuery,
): Promise<Paginated<ProductListItem>> {
  const t = termino.trim();
  if (!t && !q?.brandSlug) return paginaVacia(q);

  let consulta = cliente().from('productos').select(SELECT_LISTADO).eq('activo', true);
  if (q?.brandSlug) {
    consulta = consulta.eq('marca_slug', q.brandSlug);
  } else if (t) {
    const patron = `%${t.replace(/[%_,]/g, '')}%`;
    consulta = consulta.or(`nombre.ilike.${patron},referencia.ilike.${patron}`);
  }
  const { data, error } = await consulta;
  if (error) throw error;
  const items = ((data ?? []) as unknown as FilaListado[]).map(aListItem);
  return applyQuery(items, q);
}
