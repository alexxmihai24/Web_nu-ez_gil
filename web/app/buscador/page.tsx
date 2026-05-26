import type { Metadata } from 'next';
import Link from 'next/link';
import { searchProducts } from '@/lib/data';
import { Container } from '@/components/ui/Container';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Heading } from '@/components/ui/Heading';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { Toolbar } from '@/components/catalog/Toolbar';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { UNIVERSES } from '@/components/layout/universes';
import type { ProductQuery } from '@/lib/data/types';

export const metadata: Metadata = {
  title: 'Buscador',
  description: 'Busca entre +10.000 referencias por producto, marca o número de referencia.',
  robots: { index: false, follow: true }, // resultados de búsqueda: noindex (buena práctica SEO)
};

const PAGE_SIZE = 24;

interface SearchPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function firstParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const sp = await searchParams;
  // Compatibilidad: el form histórico usa `terminobuscar`; el nuevo usa `q`.
  const term = (firstParam(sp.q) || firstParam(sp.terminobuscar)).trim();
  const page = Math.max(1, Number(firstParam(sp.page)) || 1);

  const query: ProductQuery = {
    page,
    pageSize: PAGE_SIZE,
    sort: (firstParam(sp.sort) as ProductQuery['sort']) || 'relevance',
  };

  const result = term ? await searchProducts(term, query).catch(() => null) : null;
  const products = result?.items ?? [];
  const total = result?.total ?? 0;

  const buildHref = (p: number) => {
    const params = new URLSearchParams();
    params.set('q', term);
    if (sp.sort) params.set('sort', firstParam(sp.sort));
    if (p > 1) params.set('page', String(p));
    return `/buscador?${params.toString()}`;
  };

  return (
    <Container className="py-6 lg:py-8">
      <Breadcrumbs items={[{ name: 'Buscador' }]} />

      <Heading level={1} size="3xl" className="mt-4">
        {term ? <>Resultados para «{term}»</> : 'Buscador'}
      </Heading>

      {!term ? (
        <div className="mt-8">
          <EmptyState
            title="¿Qué estás buscando?"
            description="Escribe un producto, una marca o una referencia en el buscador de la cabecera."
            action={{ label: 'Ver catálogo', href: '/quimica-industrial' }}
          />
        </div>
      ) : products.length > 0 ? (
        <div className="mt-6">
          <Toolbar total={total} />
          <Heading level={2} size="xl" className="sr-only">
            Productos
          </Heading>
          <ProductGrid products={products} priorityCount={5} className="mt-6" />
          <Pagination page={page} total={total} pageSize={PAGE_SIZE} buildHref={buildHref} />
        </div>
      ) : (
        <div className="mt-8">
          <EmptyState
            title={`Sin resultados para «${term}»`}
            description="Revisa la ortografía o prueba con términos más generales. También puedes explorar por departamento:"
            action={{ label: 'Contactar', href: '/contacto' }}
          >
            <ul className="mt-5 flex flex-wrap justify-center gap-2">
              {UNIVERSES.flatMap((u) => u.departments)
                .slice(0, 8)
                .map((d) => (
                  <li key={d.slug}>
                    <Link
                      href={`/${d.slug}`}
                      className="inline-flex rounded-full border border-ink-200 bg-white px-3 py-1.5 text-sm text-ink-600 transition-colors hover:border-brand-300 hover:text-brand-700"
                    >
                      {d.name}
                    </Link>
                  </li>
                ))}
            </ul>
          </EmptyState>
        </div>
      )}
    </Container>
  );
}
