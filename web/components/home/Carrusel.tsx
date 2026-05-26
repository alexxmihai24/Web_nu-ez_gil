'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ProductListItem } from '@/lib/data/types';
import { TarjetaProducto } from '@/components/catalog/TarjetaProducto';

interface ProductCarouselProps {
  products: ProductListItem[];
}

/**
 * Carrusel de productos — Client island con scroll-snap nativo (sin dependencia de
 * librería). En táctil se arrastra; en ≥sm aparecen flechas laterales SOLO cuando
 * el contenido desborda (si todo cabe, no se muestran → no quedan flechas flotando
 * en el vacío). Cada flecha se desvanece cuando ya no hay nada en esa dirección.
 * Respeta prefers-reduced-motion (smooth desactivado globalmente). Los productos
 * llegan ya resueltos desde el Server.
 */
export function Carrusel({ products }: ProductCarouselProps) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const actualizarEstado = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const { scrollLeft, scrollWidth, clientWidth } = track;
    setCanPrev(scrollLeft > 8);
    setCanNext(scrollLeft < scrollWidth - clientWidth - 8);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    actualizarEstado();
    const ro = new ResizeObserver(actualizarEstado);
    ro.observe(track);
    return () => ro.disconnect();
  }, [actualizarEstado, products.length]);

  const desplazar = (dir: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const amount = Math.max(track.clientWidth * 0.8, 240);
    track.scrollBy({ left: dir * amount, behavior: 'smooth' });
  };

  if (products.length === 0) return null;

  const hayOverflow = canPrev || canNext;

  // top-1/3: las flechas se centran sobre la imagen del producto (zona segura),
  // no sobre el título → no tapan texto en las tarjetas de los bordes.
  const btnBase =
    'absolute top-1/3 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-ink-200 bg-white/95 text-ink-700 shadow-md backdrop-blur-sm transition-[opacity,color,border-color] duration-200 hover:border-brand-300 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 disabled:pointer-events-none disabled:opacity-0 sm:flex';

  return (
    <div className="relative">
      <ul
        ref={trackRef}
        onScroll={actualizarEstado}
        className="-mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {products.map((p, i) => (
          <li
            key={p.id}
            className="w-[calc(50%-0.5rem)] shrink-0 snap-start sm:w-[calc(33.333%-0.667rem)] lg:w-[calc(25%-0.75rem)] xl:w-[calc(20%-0.8rem)]"
          >
            <TarjetaProducto product={p} priority={i < 2} sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 240px" className="h-full" />
          </li>
        ))}
      </ul>

      {hayOverflow ? (
        <>
          <button
            type="button"
            onClick={() => desplazar(-1)}
            aria-label="Anterior"
            disabled={!canPrev}
            className={`${btnBase} left-1`}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => desplazar(1)}
            aria-label="Siguiente"
            disabled={!canNext}
            className={`${btnBase} right-1`}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      ) : null}
    </div>
  );
}
