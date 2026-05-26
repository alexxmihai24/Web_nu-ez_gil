import type { Metadata } from 'next';
import Link from 'next/link';
import { buildMetadata, NAP } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Cómo comprar',
  description:
    'Cómo comprar en Núñez Gil: navega el catálogo con precios sin IVA, añade productos a tu solicitud y envíanos tu pedido o presupuesto. Envío gratis desde 100 €.',
  path: '/legal/como-comprar',
});

const STEPS = [
  {
    title: 'Explora el catálogo',
    body: 'Navega por departamentos, marcas o el buscador. Cada producto muestra su referencia, formato y precio público (I.V.A. no incluido).',
  },
  {
    title: 'Añade a tu solicitud',
    body: 'Indica las cantidades y añade los artículos a tu solicitud de pedido. Puedes revisar y ajustar las unidades en cualquier momento.',
  },
  {
    title: 'Envía la solicitud',
    body: 'Completa tus datos de contacto y envíanos la solicitud. No se realiza pago online: es una petición de pedido o presupuesto, sin compromiso.',
  },
  {
    title: 'Te confirmamos',
    body: 'Nuestro equipo revisa la disponibilidad, confirma el importe final con I.V.A. y coordina contigo la entrega o recogida.',
  },
];

export default function ComoComprarPage() {
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
              Cómo comprar
            </li>
          </ol>
        </nav>

        <article className="max-w-3xl">
          <h1 className="text-3xl font-extrabold tracking-tight text-brand-900 lg:text-4xl">
            Cómo comprar
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-ink-600">
            Comprar en Núñez Gil es sencillo. Trabajamos con un modelo profesional de solicitud de
            pedido y presupuesto, pensado para hostelería, limpieza e industria.
          </p>

          <ol className="mt-10 space-y-6">
            {STEPS.map((step, i) => (
              <li key={step.title} className="flex gap-4">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-700 text-sm font-bold text-white"
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <div>
                  <h2 className="text-lg font-bold text-brand-900">{step.title}</h2>
                  <p className="mt-1.5 leading-relaxed text-ink-700">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-10 space-y-8 text-ink-700">
            <section>
              <h2 className="text-xl font-bold text-brand-900">Precios e I.V.A.</h2>
              <p className="mt-3 leading-relaxed">
                Todos los precios mostrados en el catálogo son precios públicos sin I.V.A. (&laquo;I.V.A.
                no incluido&raquo;). El importe final con impuestos se confirma al validar tu
                solicitud.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-brand-900">Envío</h2>
              <p className="mt-3 leading-relaxed">
                Envío gratuito en pedidos a partir de 100 € en nuestra zona de reparto. Para otras
                zonas o entregas urgentes, consúltanos y te informamos de las condiciones.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-brand-900">¿Necesitas ayuda?</h2>
              <p className="mt-3 leading-relaxed">
                Nuestro equipo te asesora en lo que necesites. Llámanos al{' '}
                <a href={`tel:${NAP.telephone}`} className="font-medium text-brand-700 hover:underline">
                  {NAP.telephoneDisplay}
                </a>
                , escríbenos a{' '}
                <a href={`mailto:${NAP.email}`} className="font-medium text-brand-700 hover:underline">
                  {NAP.email}
                </a>{' '}
                o visita la página de{' '}
                <Link href="/contacto" className="font-medium text-brand-700 hover:underline">
                  contacto
                </Link>
                .
              </p>
            </section>
          </div>

          <p className="mt-10 text-sm text-ink-500">
            Consulta también las{' '}
            <Link href="/legal/condiciones-envio" className="underline hover:text-brand-700">
              condiciones de envío
            </Link>
            .
          </p>
        </article>
      </div>
    </div>
  );
}
