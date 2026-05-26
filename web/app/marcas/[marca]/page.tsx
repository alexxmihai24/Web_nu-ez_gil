import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getBrands, searchProducts } from '@/lib/data';
import { Container } from '@/components/ui/Container';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Heading } from '@/components/ui/Heading';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { Toolbar } from '@/components/catalog/Toolbar';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import type { ProductQuery } from '@/lib/data/types';

export const revalidate = 3600;
const PAGE_SIZE = 24;

interface BrandPageProps {
  params: Promise<{ marca: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * Productos de una marca. El contrato bloqueado expone getBrands() + searchProducts();
 * usamos el nombre de la marca como término de búsqueda con filtro brandSlug. Si el
 * backend añade un getProductsByBrand dedicado, basta cambiar esta llamada.
 */
export async function generateStaticParams() {
  try {
    const brands = await getBrands();
    return brands.map((b) => ({ marca: b.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: BrandPageProps): Promise<Metadata> {
  const { marca } = await params;
  const brands = await getBrands().catch(() => []);
  const brand = brands.find((b) => b.slug === marca);
  if (!brand) return { title: 'Marca' };
  return {
    title: brand.name,
    description: `Productos de ${brand.name} en Núñez Gil. Precios sin IVA y envío gratis desde 100 €.`,
    alternates: { canonical: `/marcas/${brand.slug}` },
  };
}

export default async function BrandPage({ params, searchParams }: BrandPageProps) {
  const { marca } = await params;
  const sp = await searchParams;

  const brands = await getBrands().catch(() => []);
  const brand = brands.find((b) => b.slug === marca);
  if (!brand) notFound();

  const page = Math.max(1, Number(sp.page) || 1);
  const query: ProductQuery = {
    page,
    pageSize: PAGE_SIZE,
    sort: (sp.sort as ProductQuery['sort']) ?? 'relevance',
    brandSlug: brand.slug,
  };

  const result = await searchProducts(brand.name, query).catch(() => null);
  const products = result?.items ?? [];
  const total = result?.total ?? products.length;

  const buildHref = (p: number) => {
    const next = new URLSearchParams();
    if (sp.sort) next.set('sort', String(sp.sort));
    if (p > 1) next.set('page', String(p));
    const qs = next.toString();
    return qs ? `/marcas/${brand.slug}?${qs}` : `/marcas/${brand.slug}`;
  };

  return (
    <Container className="py-6 lg:py-8">
      <Breadcrumbs items={[{ name: 'Marcas', href: '/marcas' }, { name: brand.name }]} />
      <Heading level={1} size="3xl" className="mt-4">
        {brand.name}
      </Heading>

      {products.length > 0 ? (
        <div className="mt-6">
          <Toolbar total={total} />
          <Heading level={2} size="xl" className="sr-only">
            Productos de {brand.name}
          </Heading>
          <ProductGrid products={products} priorityCount={5} className="mt-6" />
          <Pagination page={page} total={total} pageSize={PAGE_SIZE} buildHref={buildHref} />
        </div>
      ) : (
        <div className="mt-8">
          <EmptyState
            title={`Aún no mostramos productos de ${brand.name}`}
            description="Consúltanos disponibilidad y te ayudamos con tu pedido."
            action={{ label: 'Contactar', href: '/contacto' }}
          />
        </div>
      )}
    </Container>
  );
}
