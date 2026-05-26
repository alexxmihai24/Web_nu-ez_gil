import type { Metadata } from 'next';
import Link from 'next/link';
import { buildMetadata, BreadcrumbSchema } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Quiénes somos · Mayorista de hostelería desde 1994',
  description:
    'Núñez Gil: mayorista de hostelería e industrial en Montilla (Córdoba) desde 1994. Exposición y logística de 1.500 m² y +10.000 referencias en constante actualización.',
  path: '/quienes-somos',
  absoluteTitle: true,
});

const FACTS = [
  { value: '1994', label: 'Al servicio de la hostelería' },
  { value: '1.500 m²', label: 'Exposición y departamento logístico' },
  { value: '+10.000', label: 'Referencias en constante actualización' },
  { value: 'Córdoba', label: 'Sede en Montilla, servicio a Andalucía' },
];

const CATALOG = [
  'Menaje y mantelerías',
  'Proyectos e instalaciones de maquinaria',
  'Ropa laboral',
  'Productos de acogida',
  'Limpieza y química profesional',
  'Celulosa y dispensadores',
];

export default function QuienesSomosPage() {
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
              Quiénes somos
            </li>
          </ol>
        </nav>

        <header className="max-w-3xl">
          <p className="text-2xs font-semibold uppercase tracking-[0.18em] text-accent-500">
            Núñez Gil · Montilla (Córdoba)
          </p>
          <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-brand-900 lg:text-4xl">
            Quiénes somos
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-ink-700">
            Empresa dedicada al servicio del sector hostelero desde el año 1994, pone a su
            disposición un amplio catálogo en productos de menaje, mantelerías, proyectos e
            instalaciones de maquinaria, ropa laboral, productos de acogida, limpieza y celulosa.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-ink-700">
            Disponemos de unas instalaciones con exposición, departamento logístico de 1.500 m² y
            más de 10.000 referencias en constante actualización para proporcionar el servicio más
            eficaz a nuestros clientes.
          </p>
        </header>

        <dl className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FACTS.map((fact) => (
            <div
              key={fact.value}
              className="rounded-md border border-ink-200 bg-white p-6 shadow-xs"
            >
              <dt className="tabular text-3xl font-extrabold text-brand-700">{fact.value}</dt>
              <dd className="mt-1 text-sm text-ink-500">{fact.label}</dd>
            </div>
          ))}
        </dl>

        <section className="mt-14 grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-xl font-bold text-brand-900">Qué encontrarás en Núñez Gil</h2>
            <ul className="mt-4 space-y-2">
              {CATALOG.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-ink-700">
                  <span
                    aria-hidden="true"
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg bg-brand-700 p-8 text-white">
            <h2 className="text-xl font-bold">Atención profesional a hostelería e industria</h2>
            <p className="mt-3 text-brand-100">
              Trabajamos como mayorista B2B para restaurantes, hoteles, colectividades e industria
              en Montilla, la provincia de Córdoba y toda Andalucía. Solicita presupuesto sin
              compromiso.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/contacto"
                className="rounded-md bg-accent-500 px-5 py-2.5 font-semibold text-white transition-colors hover:bg-accent-600"
              >
                Solicitar presupuesto
              </Link>
              <Link
                href="/marcas"
                className="rounded-md border border-white/30 px-5 py-2.5 font-semibold text-white transition-colors hover:bg-white/10"
              >
                Ver marcas
              </Link>
            </div>
          </div>
        </section>
      </div>

      <BreadcrumbSchema
        items={[
          { name: 'Inicio', url: '/' },
          { name: 'Quiénes somos', url: '/quienes-somos' },
        ]}
      />
    </div>
  );
}
