import { cn } from '@/lib/utils';

/**
 * Marca "NG" en SVG inline. Se usa como:
 *  - fallback de imagen de producto/categoría (NUNCA un 1×1 roto — corrige bug P6),
 *  - wordmark del header/footer.
 * Sin dependencia de red → siempre renderiza.
 */
export function BrandMark({
  className,
  title = 'Núñez Gil',
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 48 48"
      role="img"
      aria-label={title}
      className={cn('select-none', className)}
      fill="none"
    >
      <rect width="48" height="48" rx="10" fill="currentColor" opacity="0.08" />
      <text
        x="50%"
        y="50%"
        dominantBaseline="central"
        textAnchor="middle"
        fontFamily="var(--font-archivo), system-ui, sans-serif"
        fontSize="20"
        fontWeight="800"
        letterSpacing="-1"
        fill="currentColor"
      >
        NG
      </text>
    </svg>
  );
}

/**
 * Placeholder de imagen faltante (producto/categoría) — fondo neutro + marca NG en gris.
 * Ocupa todo el contenedor (que ya reserva el aspect-ratio → CLS 0).
 */
export function ImageFallback({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex h-full w-full items-center justify-center bg-ink-50 text-ink-300',
        className
      )}
      aria-hidden="true"
    >
      <BrandMark className="h-1/3 w-1/3 max-h-20 max-w-20" />
    </div>
  );
}
