'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ProductListItem } from '@/lib/data/types';
import { ProductCard } from '@/components/catalog/ProductCard';

interface ProductCarouselProps {
  products: ProductListItem[];
}

/**
 * Carrusel de productos — Client island con scroll-snap nativo (sin dependencia de
 * librería). Botones prev/next desplazan; en táctil se arrastra. Resuelve el bug P6:
 * cada card tiene datos completos y fallback. Respeta prefers-reduced-motion (smooth
 * desactivado globalmente). Los productos llegan ya resueltos desde el Server.
 */
export function ProductCarousel({ products }: ProductCarouselProps) {
  const trackRef = useRef<HTMLUListElement>(null);

  const scrollBy = (dir: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const amount = Math.max(track.clientWidth * 0.8, 240);
    track.scrollBy({ left: dir * amount, behavior: 'smooth' });
  };

  if (products.length === 0) return null;

  return (
    <div className="relative">
      <div className="absolute -top-12 right-0 hidden gap-2 sm:flex">
        <button
          type="button"
          onClick={() => scrollBy(-1)}
          aria-label="Anterior"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-ink-300 bg-white text-ink-600 transition-colors hover:border-brand-300 hover:text-brand-700"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => scrollBy(1)}
          aria-label="Siguiente"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-ink-300 bg-white text-ink-600 transition-colors hover:border-brand-300 hover:text-brand-700"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <ul
        ref={trackRef}
        className="-mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {products.map((p, i) => (
          <li
            key={p.id}
            className="w-[calc(50%-0.5rem)] shrink-0 snap-start sm:w-[calc(33.333%-0.667rem)] lg:w-[calc(25%-0.75rem)] xl:w-[calc(20%-0.8rem)]"
          >
            <ProductCard product={p} priority={i < 2} sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 240px" className="h-full" />
          </li>
        ))}
      </ul>
    </div>
  );
}
