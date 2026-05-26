import type { Metadata } from 'next';
import Link from 'next/link';
import { buildMetadata, NAP } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Política de cookies',
  description:
    'Política de cookies de Núñez Gil: qué cookies utilizamos, con qué finalidad y cómo gestionarlas o desactivarlas desde tu navegador.',
  path: '/legal/cookies',
});

export default function CookiesPage() {
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
              Política de cookies
            </li>
          </ol>
        </nav>

        <article className="max-w-3xl">
          <h1 className="text-3xl font-extrabold tracking-tight text-brand-900 lg:text-4xl">
            Política de cookies
          </h1>

          <div className="mt-8 space-y-8 text-ink-700">
            <section>
              <h2 className="text-xl font-bold text-brand-900">1. ¿Qué son las cookies?</h2>
              <p className="mt-3 leading-relaxed">
                Las cookies son pequeños archivos de texto que los sitios web almacenan en tu
                dispositivo al navegar. Permiten recordar tus preferencias y obtener información
                estadística sobre el uso de la página. Esta política explica las que utilizamos en{' '}
                {NAP.email.split('@')[1]} y cómo puedes gestionarlas.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-brand-900">2. Cookies que utilizamos</h2>
              <ul className="mt-3 space-y-3 leading-relaxed">
                <li>
                  <span className="font-semibold text-brand-900">Técnicas (necesarias).</span> Son
                  imprescindibles para el funcionamiento del sitio (navegación, seguridad y, en su
                  caso, sesión del Área Clientes). No requieren consentimiento.
                </li>
                <li>
                  <span className="font-semibold text-brand-900">Analíticas.</span> Utilizamos
                  Google Analytics 4 para medir de forma agregada cómo se usa la web y mejorarla.
                  Solo se instalan si prestas tu consentimiento.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-brand-900">3. Cookies de terceros</h2>
              <p className="mt-3 leading-relaxed">
                Las cookies analíticas son gestionadas por Google LLC. Puedes consultar su política
                de privacidad y los mecanismos de exclusión en las páginas de ayuda de Google
                Analytics. No utilizamos cookies con fines publicitarios ni de seguimiento entre
                sitios.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-brand-900">4. Cómo gestionar o desactivar las cookies</h2>
              <p className="mt-3 leading-relaxed">
                Puedes permitir, bloquear o eliminar las cookies instaladas en tu equipo
                configurando las opciones del navegador. A continuación tienes las instrucciones de
                los más habituales: Google Chrome, Mozilla Firefox, Microsoft Edge, Safari y Opera.
                Ten en cuenta que desactivar las cookies técnicas puede afectar al funcionamiento de
                algunas secciones del sitio.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-brand-900">5. Actualizaciones</h2>
              <p className="mt-3 leading-relaxed">
                Podemos actualizar esta política para adaptarla a cambios normativos o técnicos. Te
                recomendamos revisarla periódicamente. Para cualquier duda puedes escribirnos a{' '}
                {NAP.email}.
              </p>
            </section>
          </div>

          <p className="mt-10 text-sm text-ink-500">
            Consulta también nuestra{' '}
            <Link href="/legal/privacidad" className="underline hover:text-brand-700">
              política de privacidad
            </Link>{' '}
            y el{' '}
            <Link href="/legal/aviso-legal" className="underline hover:text-brand-700">
              aviso legal
            </Link>
            .
          </p>
        </article>
      </div>
    </div>
  );
}
