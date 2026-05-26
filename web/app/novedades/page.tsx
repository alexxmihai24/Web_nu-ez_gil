import type { Metadata } from 'next';
import { getFeatured } from '@/lib/data';
import { Container } from '@/components/ui/Container';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { EmptyState } from '@/components/ui/EmptyState';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Novedades',
  description:
    'Últimos productos incorporados al catálogo de Núñez Gil. Precios sin IVA y envío gratis desde 100 € en Córdoba.',
  alternates: { canonical: '/novedades' },
};

export default async function PaginaNovedades() {
  const productos = await getFeatured('novedad').catch(() => []);
  return (
    <Container className="py-10 lg:py-12">
      <p className="text-2xs font-bold uppercase tracking-[0.16em] text-accent-600">Recién llegados</p>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-brand-900 lg:text-4xl">Novedades</h1>
      <p className="mt-2 max-w-prose text-ink-600">
        Lo último que ha entrado en nuestro catálogo profesional.
      </p>
      {productos.length > 0 ? (
        <ProductGrid products={productos} priorityCount={5} className="mt-8" />
      ) : (
        <div className="mt-10">
          <EmptyState
            title="Aún no hay novedades"
            description="Vuelve pronto: ampliamos el catálogo continuamente."
            action={{ label: 'Ver catálogo', href: '/quimica-industrial' }}
          />
        </div>
      )}
    </Container>
  );
}
