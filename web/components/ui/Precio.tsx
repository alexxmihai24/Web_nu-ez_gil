import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/utils';

interface PriceProps {
  /** Precio en céntimos, sin IVA. null → "Consultar precio". */
  cents?: number | null;
  /** Precio anterior tachado (badge Oferta). */
  oldCents?: number | null;
  size?: 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  md: 'text-lg',
  lg: 'text-2xl',
  xl: 'text-3xl',
} as const;

/**
 * Precio destacado en `brand-900` con cifras tabulares + leyenda OBLIGATORIA
 * "I.V.A. no incluido" (decisión de cliente). Precio anterior tachado si hay oferta.
 */
export function Precio({ cents, oldCents, size = 'md', className }: PriceProps) {
  if (cents == null) {
    return (
      <p className={cn('font-semibold text-ink-600', sizeMap[size], className)}>
        Consultar precio
      </p>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-baseline gap-2">
        <span className={cn('tabular font-bold text-brand-900', sizeMap[size])}>
          {formatPrice(cents)}
        </span>
        {oldCents != null && oldCents > cents ? (
          <span className="tabular text-sm font-medium text-ink-400 line-through">
            {formatPrice(oldCents)}
          </span>
        ) : null}
      </div>
      <p className="text-2xs text-ink-500">I.V.A. no incluido</p>
    </div>
  );
}
