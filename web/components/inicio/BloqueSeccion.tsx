import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/Container';

interface PropsBloqueSeccion {
  titulo: string;
  /** Antetítulo pequeño en teal sobre el título. */
  antetitulo?: string;
  /** Enlace "ver todo" opcional a la derecha del encabezado. */
  verTodo?: { href: string; texto?: string };
  /** Fondo alterno (gris muy claro) para ritmar la página. */
  tono?: 'claro' | 'tenue';
  children: ReactNode;
}

/**
 * Envoltorio de sección de la home — encabezado (antetítulo + H2 + "ver todo")
 * y contenido. Mantiene ritmo vertical y alternancia de fondo.
 */
export function BloqueSeccion({ titulo, antetitulo, verTodo, tono = 'claro', children }: PropsBloqueSeccion) {
  return (
    <section className={tono === 'tenue' ? 'bg-ink-50 py-14 lg:py-20' : 'py-14 lg:py-20'}>
      <Container>
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            {antetitulo ? (
              <p className="text-2xs font-bold uppercase tracking-[0.16em] text-accent-600">{antetitulo}</p>
            ) : null}
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-brand-900 lg:text-3xl">
              {titulo}
            </h2>
          </div>
          {verTodo ? (
            <Link
              href={verTodo.href}
              className="group hidden shrink-0 items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800 sm:inline-flex"
            >
              {verTodo.texto ?? 'Ver todo'}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          ) : null}
        </div>
        {children}
      </Container>
    </section>
  );
}
