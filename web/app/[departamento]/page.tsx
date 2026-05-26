import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCategoryBySlug, getDepartments, getProductsByCategory } from '@/lib/data';
import { CatalogShell } from '@/components/catalog/CatalogShell';
import { CategoryCard } from '@/components/catalog/CategoryCard';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { Toolbar } from '@/components/catalog/Toolbar';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { Heading } from '@/components/ui/Heading';
import type { ProductQuery } from '@/lib/data/types';

export const revalidate = 3600;
const PAGE_SIZE = 24;

interface PageProps {
  params: Promise<{ departamento: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/** Pre-renderiza los ~13 departamentos (nivel 1) en build; ISR para el resto. */
export async function generateStaticParams() {
  try {
    const departments = await getDepartments();
    return departments.map((d) => ({ departamento: d.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { departamento } = await params;
  const category = await getCategoryBySlug(departamento).catch(() => null);
  if (!category) return { title: 'Categoría' };
  return {
    title: category.name,
    description: `${category.name} — productos profesionales de hostelería e industrial. Precios sin IVA, envío gratis desde 100 €.`,
    alternates: { canonical: `/${category.slug}` },
  };
}

export default async function DepartmentPage({ params, searchParams }: PageProps) {
  const { departamento } = await params;
  const sp = await searchParams;

  const category = await getCategoryBySlug(departamento).catch(() => null);
  if (!category) notFound();

  const children = category.children ?? [];
  const hasChildren = children.length > 0;

  // Si el departamento agrupa categorías → rejilla de CategoryCards.
  if (hasChildren) {
    return (
      <CatalogShell
        title={category.name}
        activeDepartment={category.slug}
        breadcrumbs={[{ name: category.name }]}
      >
        <Heading level={2} size="xl" className="sr-only">
          Categorías
        </Heading>
        <ul className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
          {children.map((child, i) => (
            <li key={child.id}>
              <CategoryCard
                category={child}
                href={`/${category.slug}/${child.slug}`}
                priority={i < 4}
                className="h-full"
              />
            </li>
          ))}
        </ul>
      </CatalogShell>
    );
  }

  // Departamento hoja → listado de productos directo.
  const page = Math.max(1, Number(sp.page) || 1);
  const query: ProductQuery = {
    page,
    pageSize: PAGE_SIZE,
    sort: (sp.sort as ProductQuery['sort']) ?? 'relevance',
  };
  const result = await getProductsByCategory(category.slug, query).catch(() => null);
  const products = result?.items ?? [];

  const buildHref = (p: number) => {
    const params = new URLSearchParams();
    if (sp.sort) params.set('sort', String(sp.sort));
    if (p > 1) params.set('page', String(p));
    const qs = params.toString();
    return qs ? `/${category.slug}?${qs}` : `/${category.slug}`;
  };

  return (
    <CatalogShell
      title={category.name}
      activeDepartment={category.slug}
      breadcrumbs={[{ name: category.name }]}
    >
      {products.length > 0 ? (
        <>
          <Toolbar total={result?.total ?? products.length} />
          <Heading level={2} size="xl" className="sr-only">
            Productos
          </Heading>
          <ProductGrid products={products} priorityCount={5} className="mt-6" />
          <Pagination
            page={page}
            total={result?.total ?? products.length}
            pageSize={PAGE_SIZE}
            buildHref={buildHref}
          />
        </>
      ) : (
        <EmptyState
          title="Aún no hay productos en esta sección"
          description="Estamos ampliando el catálogo. Consúltanos y te ayudamos a encontrar lo que necesitas."
          action={{ label: 'Contactar', href: '/contacto' }}
        />
      )}
    </CatalogShell>
  );
}
