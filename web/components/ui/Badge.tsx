import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { Availability, Badge as BadgeKind } from '@/lib/data/types';

const commercial: Record<BadgeKind, { label: string; className: string }> = {
  novedad: { label: 'Novedad', className: 'bg-badge-novedad text-white' },
  oferta: { label: 'Oferta', className: 'bg-badge-oferta text-white' },
  outlet: { label: 'Outlet', className: 'bg-badge-outlet text-white' },
};

/** Badge comercial sólido (esquina de la card). */
export function Badge({ kind, className }: { kind: BadgeKind; className?: string }) {
  const { label, className: tone } = commercial[kind];
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm px-2 py-0.5 text-2xs font-semibold uppercase tracking-wide',
        tone,
        className
      )}
    >
      {label}
    </span>
  );
}

const availabilityMap: Record<Availability, { label: string; dot: string; text: string }> = {
  in_stock: { label: 'En stock', dot: 'bg-success', text: 'text-success' },
  on_order: { label: 'Bajo pedido', dot: 'bg-warning', text: 'text-warning' },
  out_of_stock: { label: 'Agotado', dot: 'bg-error', text: 'text-error' },
};

/** Indicador de disponibilidad: punto de color + texto (no es un badge sólido). */
export function AvailabilityBadge({
  availability,
  className,
}: {
  availability: Availability;
  className?: string;
}) {
  const { label, dot, text } = availabilityMap[availability];
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium', text, className)}>
      <span className={cn('h-2 w-2 rounded-full', dot)} aria-hidden="true" />
      {label}
    </span>
  );
}

/** Pill neutro genérico (eyebrow, contador, etiqueta). */
export function Pill({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-2xs font-semibold uppercase tracking-wide text-brand-700',
        className
      )}
    >
      {children}
    </span>
  );
}
