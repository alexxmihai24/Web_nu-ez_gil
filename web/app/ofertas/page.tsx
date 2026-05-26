import type { Metadata } from 'next';
import { getFeatured } from '@/lib/data';
import { Contenedor } from '@/components/ui/Contenedor';
import { RejillaProductos } from '@/components/catalog/RejillaProductos';
import { EstadoVacio } from '@/components/ui/EstadoVacio';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Ofertas',
  description:
    'Productos con precio rebajado para tu negocio. Precios sin IVA y envío gratis desde 100 € en Córdoba.',
  alternates: { canonical: '/ofertas' },
};

export default async function PaginaOfertas() {
  const productos = await getFeatured('oferta').catch(() => []);
  return (
    <Contenedor className="py-10 lg:py-12">
      <p className="text-2xs font-bold uppercase tracking-[0.16em] text-accent-600">Precio rebajado</p>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-brand-900 lg:text-4xl">Ofertas</h1>
      <p className="mt-2 max-w-prose text-ink-600">
        Aprovecha los precios rebajados en productos seleccionados.
      </p>
      {productos.length > 0 ? (
        <RejillaProductos products={productos} priorityCount={5} className="mt-8" />
      ) : (
        <div className="mt-10">
          <EstadoVacio
            title="Ahora mismo no hay ofertas activas"
            description="Consúltanos y te informamos de las mejores condiciones para tu pedido."
            action={{ label: 'Contactar', href: '/contacto' }}
          />
        </div>
      )}
    </Contenedor>
  );
}
