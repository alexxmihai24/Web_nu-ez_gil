import type { Metadata } from 'next';
import { Boton } from '@/components/ui/Boton';

export const metadata: Metadata = {
  title: 'Área de clientes',
  description: 'El área de clientes de Núñez Gil estará disponible próximamente.',
  alternates: { canonical: '/acceso' },
};

export default function PaginaAcceso() {
  return (
    <div className="bg-ink-50">
      <div className="container-ng flex flex-col items-center py-20 text-center lg:py-28">
        <h1 className="text-3xl font-extrabold tracking-tight text-brand-900 lg:text-4xl">
          Área de clientes
        </h1>
        <p className="mt-4 max-w-xl text-lg text-ink-700">
          Estamos preparando el acceso para clientes. Mientras tanto, puedes enviarnos una
          solicitud de presupuesto o contactar directamente con nosotros.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Boton href="/solicitud" variant="primary">
            Hacer una solicitud
          </Boton>
          <Boton href="/contacto" variant="secondary">
            Contactar
          </Boton>
        </div>
      </div>
    </div>
  );
}
