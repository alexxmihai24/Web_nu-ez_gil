import type { Metadata } from 'next';
import Link from 'next/link';
import { buildMetadata, SITE, NAP } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Aviso legal',
  description:
    'Aviso legal de Núñez Gil Mayorista de Hostelería e Industrial, S.L. (CIF B14784235): titularidad del sitio, condiciones de uso y propiedad intelectual.',
  path: '/legal/aviso-legal',
});

export default function AvisoLegalPage() {
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
              Aviso legal
            </li>
          </ol>
        </nav>

        <article className="max-w-3xl">
          <h1 className="text-3xl font-extrabold tracking-tight text-brand-900 lg:text-4xl">
            Aviso legal
          </h1>

          <div className="mt-8 space-y-8 text-ink-700">
            <section>
              <h2 className="text-xl font-bold text-brand-900">1. Titular del sitio web</h2>
              <p className="mt-3 leading-relaxed">
                En cumplimiento de la Ley 34/2002, de Servicios de la Sociedad de la Información y
                de Comercio Electrónico (LSSI-CE), se informa de los datos del titular de este
                sitio web:
              </p>
              <ul className="mt-3 space-y-1">
                <li>
                  <strong>Titular:</strong> {SITE.legalName}
                </li>
                <li>
                  <strong>CIF:</strong> B14784235
                </li>
                <li>
                  <strong>Domicilio:</strong> {NAP.streetAddress}, {NAP.postalCode}{' '}
                  {NAP.addressLocality} ({NAP.addressRegion}), España
                </li>
                <li>
                  <strong>Teléfono:</strong> <span className="tabular">{NAP.telephoneDisplay}</span>
                </li>
                <li>
                  <strong>Email:</strong> {NAP.email}
                </li>
                <li>
                  <strong>Sitio web:</strong> {SITE.url}
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-brand-900">2. Objeto y condiciones de uso</h2>
              <p className="mt-3 leading-relaxed">
                Este sitio web es un catálogo profesional B2B de productos de hostelería, limpieza
                industrial, química profesional, celulosa y consumibles. El acceso y uso del sitio
                atribuye la condición de usuario e implica la aceptación de las presentes
                condiciones. El usuario se compromete a utilizar el sitio de forma lícita y a no
                emplearlo para fines contrarios a la ley, a la buena fe o al orden público.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-brand-900">
                3. Propiedad intelectual e industrial
              </h2>
              <p className="mt-3 leading-relaxed">
                Los contenidos del sitio (textos, fotografías, logotipos, diseño y código) son
                titularidad de {SITE.name} o de terceros que han autorizado su uso. Las marcas
                comerciales de los fabricantes distribuidos pertenecen a sus respectivos titulares.
                Queda prohibida su reproducción, distribución o transformación sin autorización.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-brand-900">4. Responsabilidad</h2>
              <p className="mt-3 leading-relaxed">
                {SITE.name} no se hace responsable de los daños derivados del mal uso del sitio ni
                de la indisponibilidad temporal por causas técnicas. La información del catálogo
                (precios, disponibilidad y especificaciones) es orientativa y puede actualizarse
                sin previo aviso.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-brand-900">5. Legislación aplicable</h2>
              <p className="mt-3 leading-relaxed">
                Las presentes condiciones se rigen por la legislación española. Para cualquier
                controversia, las partes se someten a los juzgados y tribunales que correspondan
                conforme a derecho.
              </p>
            </section>
          </div>

          <p className="mt-10 text-sm text-ink-500">
            Consulta también nuestra{' '}
            <Link href="/legal/privacidad" className="underline hover:text-brand-700">
              política de privacidad
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
