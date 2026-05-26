import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getBrands, searchProducts } from '@/lib/data';
import { Contenedor } from '@/components/ui/Contenedor';
import { MigasDePan } from '@/components/ui/MigasDePan';
import { Titulo } from '@/components/ui/Titulo';
import { RejillaProductos } from '@/components/catalog/RejillaProductos';
import { BarraHerramientas } from '@/components/catalog/BarraHerramientas';
import { Paginacion } from '@/components/ui/Paginacion';
import { EstadoVacio } from '@/components/ui/EstadoVacio';
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
    <Contenedor className="py-6 lg:py-8">
      <MigasDePan items={[{ name: 'Marcas', href: '/marcas' }, { name: brand.name }]} />
      <Titulo level={1} size="3xl" className="mt-4">
        {brand.name}
      </Titulo>

      {products.length > 0 ? (
        <div className="mt-6">
          <BarraHerramientas total={total} />
          <Titulo level={2} size="xl" className="sr-only">
            Productos de {brand.name}
          </Titulo>
          <RejillaProductos products={products} priorityCount={5} className="mt-6" />
          <Paginacion page={page} total={total} pageSize={PAGE_SIZE} buildHref={buildHref} />
        </div>
      ) : (
        <div className="mt-8">
          <EstadoVacio
            title={`Aún no mostramos productos de ${brand.name}`}
            description="Consúltanos disponibilidad y te ayudamos con tu pedido."
            action={{ label: 'Contactar', href: '/contacto' }}
          />
        </div>
      )}
    </Contenedor>
  );
}
