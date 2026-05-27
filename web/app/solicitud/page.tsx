import type { Metadata } from 'next';
import Link from 'next/link';
import { Cesta } from '@/components/solicitud/Cesta';

export const metadata: Metadata = {
  title: 'Tu solicitud de presupuesto',
  description: 'Revisa los productos de tu solicitud y pídenos presupuesto sin compromiso.',
  robots: { index: false, follow: true }, // cesta personal, no indexar
  alternates: { canonical: '/solicitud' },
};

export default function PaginaSolicitud() {
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
              Solicitud
            </li>
          </ol>
        </nav>
        <h1 className="text-3xl font-extrabold tracking-tight text-brand-900 lg:text-4xl">
          Tu solicitud de presupuesto
        </h1>
        <p className="mt-3 max-w-2xl text-ink-700">
          Revisa los productos, ajusta cantidades y envíanos tus datos. Te responderemos con el
          presupuesto sin compromiso.
        </p>
        <div className="mt-10">
          <Cesta />
        </div>
      </div>
    </div>
  );
}
