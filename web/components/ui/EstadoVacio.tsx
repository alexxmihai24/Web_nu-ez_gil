import type { ReactNode } from 'react';
import { PackageSearch } from 'lucide-react';
import { Boton } from './Boton';

interface EmptyStateProps {
  title: string;
  description?: string;
  /** CTA opcional (sin callejón sin salida — ver UX §0.3). */
  action?: { label: string; href: string };
  children?: ReactNode;
}

/** Estado vacío con icono lineal + mensaje + CTA. Nunca una página en blanco. */
export function EstadoVacio({ title, description, action, children }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-ink-200 bg-white px-6 py-16 text-center">
      <PackageSearch className="h-10 w-10 text-ink-300" aria-hidden="true" />
      <p className="mt-4 text-lg font-semibold text-ink-900">{title}</p>
      {description ? <p className="mt-1 max-w-md text-sm text-ink-500">{description}</p> : null}
      {children}
      {action ? (
        <Boton href={action.href} variant="primary" className="mt-6">
          {action.label}
        </Boton>
      ) : null}
    </div>
  );
}
