import type { ProductListItem } from '@/lib/data/types';
import { cn } from '@/lib/utils';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: ProductListItem[];
  /** Prioriza la imagen de los primeros N cards (LCP de la primera fila). */
  priorityCount?: number;
  className?: string;
}

/** Grid responsive de productos: 2 col móvil · 3 tablet · 4 desktop · 5 en xl. */
export function ProductGrid({ products, priorityCount = 0, className }: ProductGridProps) {
  return (
    <ul
      className={cn(
        'grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
        className
      )}
    >
      {products.map((p, i) => (
        <li key={p.id}>
          <ProductCard product={p} priority={i < priorityCount} className="h-full" />
        </li>
      ))}
    </ul>
  );
}
