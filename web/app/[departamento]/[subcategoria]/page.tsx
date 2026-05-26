import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCategoryBySlug, getProductsByCategory } from '@/lib/data';
import { CatalogShell } from '@/components/catalog/CatalogShell';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { CategoryCard } from '@/components/catalog/CategoryCard';
import { Toolbar } from '@/components/catalog/Toolbar';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { Heading } from '@/components/ui/Heading';
import type { ProductQuery } from '@/lib/data/types';

export const revalidate = 3600;
const PAGE_SIZE = 24;

interface PageProps {
  params: Promise<{ departamento: string; subcategoria: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { departamento, subcategoria } = await params;
  const category = await getCategoryBySlug(subcategoria).catch(() => null);
  if (!category) return { title: 'Subcategoría' };
  return {
    title: category.name,
    description: `${category.name} — catálogo profesional. Precios sin IVA, disponibilidad y envío gratis desde 100 €.`,
    alternates: { canonical: `/${departamento}/${category.slug}` },
  };
}

export default async function SubcategoryPage({ params, searchParams }: PageProps) {
  const { departamento, subcategoria } = await params;
  const sp = await searchParams;

  const [department, category] = await Promise.all([
    getCategoryBySlug(departamento).catch(() => null),
    getCategoryBySlug(subcategoria).catch(() => null),
  ]);
  if (!category) notFound();

  const children = category.children ?? [];
  const page = Math.max(1, Number(sp.page) || 1);
  const query: ProductQuery = {
    page,
    pageSize: PAGE_SIZE,
    sort: (sp.sort as ProductQuery['sort']) ?? 'relevance',
    brandSlug: typeof sp.marca === 'string' ? sp.marca : undefined,
    availability:
      sp.disponibilidad === 'in_stock' || sp.disponibilidad === 'on_order' || sp.disponibilidad === 'out_of_stock'
        ? sp.disponibilidad
        : undefined,
  };

  const result = await getProductsByCategory(category.slug, query).catch(() => null);
  const products = result?.items ?? [];
  const total = result?.total ?? products.length;

  const breadcrumbs = [
    ...(department ? [{ name: department.name, href: `/${department.slug}` }] : []),
    { name: category.name },
  ];

  const buildHref = (p: number) => {
    const next = new URLSearchParams();
    for (const key of ['sort', 'marca', 'disponibilidad'] as const) {
      if (sp[key]) next.set(key, String(sp[key]));
    }
    if (p > 1) next.set('page', String(p));
    const qs = next.toString();
    return qs ? `/${departamento}/${category.slug}?${qs}` : `/${departamento}/${category.slug}`;
  };

  return (
    <CatalogShell title={category.name} activeDepartment={departamento} breadcrumbs={breadcrumbs}>
      {/* Si la subcategoría tuviera más niveles, mostramos sus hijos arriba. */}
      {children.length > 0 ? (
        <>
          <Heading level={2} size="lg">
            Subcategorías
          </Heading>
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {children.map((child) => (
              <li key={child.id}>
                <CategoryCard
                  category={child}
                  href={`/${category.slug}/${child.slug}`}
                  variant="compact"
                />
              </li>
            ))}
          </ul>
          <hr className="my-8 border-ink-200" />
        </>
      ) : null}

      {products.length > 0 ? (
        <>
          <Toolbar total={total} />
          <Heading level={2} size="xl" className="sr-only">
            Productos
          </Heading>
          <ProductGrid products={products} priorityCount={5} className="mt-6" />
          <Pagination page={page} total={total} pageSize={PAGE_SIZE} buildHref={buildHref} />
        </>
      ) : (
        <EmptyState
          title="No hay productos que mostrar"
          description="Prueba a quitar filtros o consúltanos la disponibilidad de lo que buscas."
          action={{ label: 'Consultar disponibilidad', href: '/contacto' }}
        />
      )}
    </CatalogShell>
  );
}
