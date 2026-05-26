import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { cn } from '@/lib/utils';

interface SectionProps {
  title: string;
  eyebrow?: string;
  /** Enlace "ver todo" opcional a la derecha del título. */
  viewAll?: { href: string; label?: string };
  /** Color de fondo de la sección. */
  tone?: 'white' | 'subtle';
  children: ReactNode;
  className?: string;
}

/**
 * Envoltorio de sección de home — Server Component. Cabecera (H2 + "ver todo") con
 * ritmo vertical de marca (py-12/py-20). El contenido (grid o carrusel) va dentro.
 */
export function Section({ title, eyebrow, viewAll, tone = 'white', children, className }: SectionProps) {
  return (
    <section className={cn(tone === 'subtle' ? 'bg-ink-50' : 'bg-white', className)}>
      <Container className="py-12 lg:py-16">
        <div className="mb-7 flex items-end justify-between gap-4">
          <Heading level={2} eyebrow={eyebrow} size="2xl">
            {title}
          </Heading>
          {viewAll ? (
            <Link
              href={viewAll.href}
              className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-accent-600"
            >
              {viewAll.label ?? 'Ver todo'}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          ) : null}
        </div>
        {children}
      </Container>
    </section>
  );
}
