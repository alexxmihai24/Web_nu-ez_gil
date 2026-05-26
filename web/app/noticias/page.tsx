import type { Metadata } from 'next';
import Link from 'next/link';
import { buildMetadata, BreadcrumbSchema } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Noticias y guías de limpieza profesional y hostelería',
  description:
    'Guías y consejos de limpieza industrial, química profesional e higiene en hostelería del mayorista Núñez Gil en Córdoba. Contenido editorial en preparación.',
  path: '/noticias',
  absoluteTitle: true,
});

/**
 * Índice de Noticias / blog. Se han retirado los posts de relleno
 * ("noticia-ejemplo") del sitio anterior. Aún no hay artículos publicados, así
 * que se muestra un índice honesto (sin contenido falso) con la línea editorial
 * prevista. Cuando existan posts reales, sustituir el estado vacío por el listado
 * (cada post → /noticias/[slug] con schema BlogPosting + FAQPage).
 */
const TEMAS = [
  'Higiene y plan APPCC en hostelería',
  'Química profesional: desinfectantes y desincrustantes',
  'Celulosa y dispensadores: cómo reducir costes',
  'Limpieza de acero inoxidable en cocinas',
  'Envases de un solo uso y normativa',
  'EPIs y ropa laboral en hostelería e industria',
];

export default function NoticiasPage() {
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
              Noticias
            </li>
          </ol>
        </nav>

        <header className="max-w-3xl">
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-brand-900 lg:text-4xl">
            Noticias y guías para hostelería e industria
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-ink-700">
            Estamos preparando contenido práctico sobre limpieza profesional, química industrial,
            higiene en hostelería y ahorro de costes en consumibles. Vuelve pronto para leer
            nuestras guías.
          </p>
        </header>

        <section className="mt-10 rounded-lg border border-ink-200 bg-white p-8 shadow-xs">
          <h2 className="text-xl font-bold text-brand-900">Temas que trataremos</h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {TEMAS.map((tema) => (
              <li key={tema} className="flex items-start gap-2.5 text-ink-700">
                <span
                  aria-hidden="true"
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500"
                />
                {tema}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-ink-600">
            ¿Tienes una duda concreta sobre productos para tu negocio? Te asesoramos sin
            compromiso.
          </p>
          <div className="mt-4">
            <Link
              href="/contacto"
              className="inline-flex rounded-md bg-accent-500 px-5 py-2.5 font-semibold text-white transition-colors hover:bg-accent-600"
            >
              Consultar con un especialista
            </Link>
          </div>
        </section>
      </div>

      <BreadcrumbSchema
        items={[
          { name: 'Inicio', url: '/' },
          { name: 'Noticias', url: '/noticias' },
        ]}
      />
    </div>
  );
}
