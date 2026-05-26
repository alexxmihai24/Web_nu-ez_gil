'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { X, ZoomIn } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ImageFallback } from '@/components/ui/BrandMark';

interface ProductGalleryProps {
  images: string[];
  alt: string;
}

/**
 * Galería de producto — Client island. Imagen principal cuadrada object-contain sobre
 * fondo neutro + miniaturas. Click en la principal abre lightbox (Esc/overlay cierra,
 * foco gestionado). Si no hay imágenes → fallback de marca. Ver diseno-ui.md §5.3.
 */
export function ProductGallery({ images, alt }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const hasImages = images.length > 0;
  const current = hasImages ? images[active] : null;

  useEffect(() => {
    if (!lightbox) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(false);
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [lightbox]);

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-lg border border-ink-200 bg-ink-50">
        {current ? (
          <>
            <Image
              src={current}
              alt={alt}
              fill
              priority
              sizes="(max-width:768px) 100vw, 50vw"
              className="object-contain p-6"
            />
            <button
              type="button"
              onClick={() => setLightbox(true)}
              aria-label="Ampliar imagen"
              className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-ink-700 shadow-sm transition-colors hover:bg-white hover:text-brand-700"
            >
              <ZoomIn className="h-5 w-5" />
            </button>
          </>
        ) : (
          <ImageFallback />
        )}
      </div>

      {images.length > 1 ? (
        <ul className="mt-3 flex flex-wrap gap-2.5" aria-label="Miniaturas">
          {images.map((src, i) => (
            <li key={src}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Ver imagen ${i + 1}`}
                aria-current={i === active}
                className={cn(
                  'relative h-16 w-16 overflow-hidden rounded-md border bg-ink-50 transition-colors',
                  i === active ? 'border-accent-500 ring-2 ring-accent-500/30' : 'border-ink-200 hover:border-brand-300'
                )}
              >
                <Image src={src} alt="" fill sizes="64px" className="object-contain p-1" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {lightbox && current ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Imagen ampliada: ${alt}`}
          className="fixed inset-0 z-modal flex items-center justify-center bg-brand-900/85 p-4"
          onClick={() => setLightbox(false)}
        >
          <button
            type="button"
            aria-label="Cerrar"
            onClick={() => setLightbox(false)}
            className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="relative h-full max-h-[85vh] w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <Image src={current} alt={alt} fill sizes="90vw" className="object-contain" />
          </div>
        </div>
      ) : null}
    </div>
  );
}
