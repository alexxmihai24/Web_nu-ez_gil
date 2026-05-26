import type { Metadata } from 'next';
import Link from 'next/link';
import { buildMetadata, LocalBusinessSchema, BreadcrumbSchema, NAP } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Contacto · Núñez Gil (Montilla, Córdoba)',
  description:
    'Contacta con Núñez Gil: C/ Pilas de Panchía 2, Montilla (Córdoba). Tel. 957 65 53 88. Mayorista de hostelería e industrial al servicio de toda Andalucía.',
  path: '/contacto',
  absoluteTitle: true,
});

/**
 * Mapa embebido con OpenStreetMap — SIN token (no se usa Mapbox sk., hallazgo S2).
 * El bbox encuadra el casco urbano de Montilla; es solo orientativo para mostrar
 * la población. Las coordenadas exactas de la nave (GEO en lib/seo/config.ts)
 * están pendientes de confirmar con el cliente; cuando lleguen, ajustar el bbox
 * y el `marker` a la posición real.
 */
const OSM_EMBED =
  'https://www.openstreetmap.org/export/embed.html?bbox=-4.6520%2C37.5780%2C-4.6240%2C37.5940&layer=mapnik&marker=37.5860%2C-4.6380';
const OSM_LINK = 'https://www.openstreetmap.org/?mlat=37.5860&mlon=-4.6380#map=15/37.5860/-4.6380';

export default function ContactoPage() {
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
              Contacto
            </li>
          </ol>
        </nav>

        <header className="max-w-3xl">
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-brand-900 lg:text-4xl">
            Contacto
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-ink-700">
            Estamos en Montilla (Córdoba) y atendemos a profesionales de la hostelería e industria
            de toda Andalucía. Llámanos, escríbenos o ven a visitar nuestra exposición.
          </p>
        </header>

        <div className="mt-10 grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-xl font-bold text-brand-900">Datos de contacto</h2>
            <address className="mt-4 space-y-4 not-italic text-ink-700">
              <div>
                <p className="text-2xs font-semibold uppercase tracking-wider text-ink-400">
                  Dirección
                </p>
                <p className="mt-1">
                  {NAP.streetAddress}
                  <br />
                  {NAP.postalCode} {NAP.addressLocality} ({NAP.addressRegion})
                </p>
              </div>
              <div>
                <p className="text-2xs font-semibold uppercase tracking-wider text-ink-400">
                  Teléfono
                </p>
                <p className="mt-1">
                  <a href={`tel:${NAP.telephone}`} className="tabular hover:text-brand-700">
                    {NAP.telephoneDisplay}
                  </a>
                  {' · '}
                  <a href={`tel:${NAP.mobile}`} className="tabular hover:text-brand-700">
                    {NAP.mobileDisplay}
                  </a>
                </p>
              </div>
              <div>
                <p className="text-2xs font-semibold uppercase tracking-wider text-ink-400">
                  Email
                </p>
                <p className="mt-1">
                  <a href={`mailto:${NAP.email}`} className="hover:text-brand-700">
                    {NAP.email}
                  </a>
                </p>
              </div>
            </address>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={`tel:${NAP.telephone}`}
                className="rounded-md bg-accent-500 px-5 py-2.5 font-semibold text-white transition-colors hover:bg-accent-600"
              >
                Llamar ahora
              </a>
              <a
                href={`mailto:${NAP.email}`}
                className="rounded-md border border-ink-300 bg-white px-5 py-2.5 font-semibold text-brand-700 transition-colors hover:bg-ink-100"
              >
                Enviar email
              </a>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-brand-900">Cómo llegar</h2>
            <div className="mt-4 overflow-hidden rounded-lg border border-ink-200 bg-white shadow-xs">
              <iframe
                title="Ubicación de Núñez Gil en Montilla (Córdoba) en OpenStreetMap"
                src={OSM_EMBED}
                loading="lazy"
                className="aspect-[4/3] w-full"
                style={{ border: 0 }}
              />
            </div>
            <p className="mt-2 text-sm text-ink-500">
              <a
                href={OSM_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-brand-700"
              >
                Ver mapa más grande en OpenStreetMap
              </a>
            </p>
          </div>
        </div>
      </div>

      <LocalBusinessSchema />
      <BreadcrumbSchema
        items={[
          { name: 'Inicio', url: '/' },
          { name: 'Contacto', url: '/contacto' },
        ]}
      />
    </div>
  );
}
