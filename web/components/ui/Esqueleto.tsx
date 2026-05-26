import { cn } from '@/lib/utils';

/** Bloque de carga con shimmer suave (percepción de velocidad, no spinners). */
export function Esqueleto({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-ink-100', className)} aria-hidden="true" />;
}

/** Esqueleto de una TarjetaProducto (para loading.tsx de catálogo). */
export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-md border border-ink-200 bg-white">
      <Esqueleto className="aspect-square rounded-none" />
      <div className="space-y-2 p-4">
        <Esqueleto className="h-3 w-1/3" />
        <Esqueleto className="h-4 w-full" />
        <Esqueleto className="h-4 w-2/3" />
        <Esqueleto className="mt-3 h-6 w-1/2" />
        <Esqueleto className="mt-3 h-11 w-full" />
      </div>
    </div>
  );
}
