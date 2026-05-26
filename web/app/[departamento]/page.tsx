import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCategoryBySlug, getDepartments, getProductsByCategory } from '@/lib/data';
import { MarcoCatalogo } from '@/components/catalog/MarcoCatalogo';
import { TarjetaCategoria } from '@/components/catalog/TarjetaCategoria';
import { RejillaProductos } from '@/components/catalog/RejillaProductos';
import { BarraHerramientas } from '@/components/catalog/BarraHerramientas';
import { Paginacion } from '@/components/ui/Paginacion';
import { EstadoVacio } from '@/components/ui/EstadoVacio';
import { Titulo } from '@/components/ui/Titulo';
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
      <MarcoCatalogo
        title={category.name}
        activeDepartment={category.slug}
        breadcrumbs={[{ name: category.name }]}
      >
        <Titulo level={2} size="xl" className="sr-only">
          Categorías
        </Titulo>
        <ul className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
          {children.map((child, i) => (
            <li key={child.id}>
              <TarjetaCategoria
                category={child}
                href={`/${category.slug}/${child.slug}`}
                priority={i < 4}
                className="h-full"
              />
            </li>
          ))}
        </ul>
      </MarcoCatalogo>
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
    <MarcoCatalogo
      title={category.name}
      activeDepartment={category.slug}
      breadcrumbs={[{ name: category.name }]}
    >
      {products.length > 0 ? (
        <>
          <BarraHerramientas total={result?.total ?? products.length} />
          <Titulo level={2} size="xl" className="sr-only">
            Productos
          </Titulo>
          <RejillaProductos products={products} priorityCount={5} className="mt-6" />
          <Paginacion
            page={page}
            total={result?.total ?? products.length}
            pageSize={PAGE_SIZE}
            buildHref={buildHref}
          />
        </>
      ) : (
        <EstadoVacio
          title="Aún no hay productos en esta sección"
          description="Estamos ampliando el catálogo. Consúltanos y te ayudamos a encontrar lo que necesitas."
          action={{ label: 'Contactar', href: '/contacto' }}
        />
      )}
    </MarcoCatalogo>
  );
}
