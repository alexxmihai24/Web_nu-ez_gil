import type { Metadata } from 'next';
import Link from 'next/link';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Condiciones de envío',
  description:
    'Condiciones de envío de Núñez Gil: envío gratis desde 100 € en la provincia de Córdoba y desde 200 € en el resto de la península. Plazos y zonas de entrega.',
  path: '/legal/condiciones-envio',
});

export default function CondicionesEnvioPage() {
  return (
    <div className="bg-ink-50">
      <div className="container-ng py-12 lg:py-16">
        <nav aria-label="Migas de pan" className="mb-6 text-sm text-ink-500">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-brand-700">
                Inicio
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="font-medium text-ink-700" aria-current="page">
              Condiciones de envío
            </li>
          </ol>
        </nav>

        <article className="max-w-3xl">
          <h1 className="text-3xl font-extrabold tracking-tight text-brand-900 lg:text-4xl">
            Condiciones de envío
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-ink-700">
            Servimos pedidos a profesionales de la hostelería e industria. Estas son nuestras
            condiciones de envío para que sepas qué esperar al tramitar tu solicitud.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-ink-200 bg-white p-6 shadow-xs">
              <p className="text-2xs font-semibold uppercase tracking-wider text-accent-500">
                Provincia de Córdoba
              </p>
              <p className="mt-2 text-lg font-bold text-brand-900">
                Envío gratis desde <span className="tabular">100 €</span>
              </p>
              <p className="mt-1 text-sm text-ink-500">Importe sin IVA.</p>
            </div>
            <div className="rounded-lg border border-ink-200 bg-white p-6 shadow-xs">
              <p className="text-2xs font-semibold uppercase tracking-wider text-accent-500">
                Resto de la península
              </p>
              <p className="mt-2 text-lg font-bold text-brand-900">
                Envío gratis desde <span className="tabular">200 €</span>
              </p>
              <p className="mt-1 text-sm text-ink-500">Importe sin IVA.</p>
            </div>
          </div>

          <div className="mt-8 space-y-8 text-ink-700">
            <section>
              <h2 className="text-xl font-bold text-brand-900">Pedidos por debajo del mínimo</h2>
              <p className="mt-3 leading-relaxed">
                Para pedidos inferiores a los importes anteriores, los gastos de envío se calculan
                según el peso, el volumen y la zona de entrega. Te informamos del coste exacto al
                confirmar tu solicitud, antes de cerrar el pedido.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-brand-900">Plazos y zonas de entrega</h2>
              <p className="mt-3 leading-relaxed">
                Preparamos los pedidos desde nuestras instalaciones de Montilla (Córdoba). El plazo
                de entrega depende del destino y de la disponibilidad de stock; te confirmamos la
                fecha estimada al tramitar la solicitud. Para envíos a Canarias, Baleares, Ceuta y
                Melilla, consúltanos las condiciones específicas.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-brand-900">Sin pago online</h2>
              <p className="mt-3 leading-relaxed">
                El pedido se tramita como solicitud, sin pago con tarjeta en la web. Acordamos
                contigo la forma de pago y el envío al confirmar el pedido.
              </p>
            </section>
          </div>

          <p className="mt-10 text-sm text-ink-500">
            Consulta también{' '}
            <Link href="/legal/como-comprar" className="underline hover:text-brand-700">
              cómo comprar
            </Link>
            .
          </p>
        </article>
      </div>
    </div>
  );
}
