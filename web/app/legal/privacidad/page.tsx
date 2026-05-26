import type { Metadata } from 'next';
import Link from 'next/link';
import { buildMetadata, SITE, NAP } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Política de privacidad',
  description:
    'Política de privacidad de Núñez Gil: responsable del tratamiento, finalidad, base legal, conservación y derechos del usuario conforme al RGPD y la LOPDGDD.',
  path: '/legal/privacidad',
});

export default function PrivacidadPage() {
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
              Política de privacidad
            </li>
          </ol>
        </nav>

        <article className="max-w-3xl">
          <h1 className="text-3xl font-extrabold tracking-tight text-brand-900 lg:text-4xl">
            Política de privacidad
          </h1>

          <div className="mt-8 space-y-8 text-ink-700">
            <section>
              <h2 className="text-xl font-bold text-brand-900">1. Responsable del tratamiento</h2>
              <p className="mt-3 leading-relaxed">
                {SITE.legalName}, con CIF B14784235 y domicilio en {NAP.streetAddress},{' '}
                {NAP.postalCode} {NAP.addressLocality} ({NAP.addressRegion}), es responsable del
                tratamiento de los datos personales que nos facilites. Puedes contactar en{' '}
                {NAP.email} o en el teléfono {NAP.telephoneDisplay}.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-brand-900">2. Finalidad del tratamiento</h2>
              <p className="mt-3 leading-relaxed">
                Tratamos tus datos para gestionar las solicitudes de presupuesto y pedido, atender
                tus consultas, gestionar la relación comercial y, en su caso, administrar tu cuenta
                de cliente. No se realiza venta con pago online: el flujo finaliza con el envío de
                una solicitud de pedido.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-brand-900">3. Base legal</h2>
              <p className="mt-3 leading-relaxed">
                La base jurídica es la ejecución de la relación contractual o precontractual (tu
                solicitud), el consentimiento que prestes en los formularios y el interés legítimo
                en atender tus comunicaciones.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-brand-900">4. Conservación</h2>
              <p className="mt-3 leading-relaxed">
                Conservamos los datos durante el tiempo necesario para la finalidad para la que se
                recabaron y mientras existan obligaciones legales de conservación.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-brand-900">5. Destinatarios</h2>
              <p className="mt-3 leading-relaxed">
                No se cederán datos a terceros salvo obligación legal o cuando sea necesario para
                prestar el servicio (p. ej. agencias de transporte para la entrega de pedidos).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-brand-900">6. Tus derechos</h2>
              <p className="mt-3 leading-relaxed">
                Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición,
                limitación y portabilidad escribiendo a {NAP.email}, adjuntando copia de un
                documento identificativo. Si consideras que el tratamiento no se ajusta a la
                normativa, puedes reclamar ante la Agencia Española de Protección de Datos
                (www.aepd.es).
              </p>
            </section>
          </div>

          <p className="mt-10 text-sm text-ink-500">
            Más información en el{' '}
            <Link href="/legal/aviso-legal" className="underline hover:text-brand-700">
              aviso legal
            </Link>{' '}
            y la{' '}
            <Link href="/legal/cookies" className="underline hover:text-brand-700">
              política de cookies
            </Link>
            .
          </p>
        </article>
      </div>
    </div>
  );
}
