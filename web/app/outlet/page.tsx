import type { Metadata } from 'next';
import { getFeatured } from '@/lib/data';
import { Container } from '@/components/ui/Container';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { EmptyState } from '@/components/ui/EmptyState';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Outlet',
  description:
    'Últimas unidades y liquidación de stock. Precios sin IVA y envío gratis desde 100 € en Córdoba.',
  alternates: { canonical: '/outlet' },
};

export default async function PaginaOutlet() {
  const productos = await getFeatured('outlet').catch(() => []);
  return (
    <Container className="py-10 lg:py-12">
      <p className="text-2xs font-bold uppercase tracking-[0.16em] text-accent-600">Últimas unidades</p>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-brand-900 lg:text-4xl">Outlet</h1>
      <p className="mt-2 max-w-prose text-ink-600">
        Liquidación de stock: productos seleccionados a precio reducido hasta fin de existencias.
      </p>
      {productos.length > 0 ? (
        <ProductGrid products={productos} priorityCount={5} className="mt-8" />
      ) : (
        <div className="mt-10">
          <EmptyState
            title="No hay artículos en outlet ahora mismo"
            description="Vuelve pronto o consúltanos disponibilidad."
            action={{ label: 'Ver catálogo', href: '/quimica-industrial' }}
          />
        </div>
      )}
    </Container>
  );
}
