import Image from 'next/image';
import { cn } from '@/lib/utils';
import { ImagenRespaldo } from './MarcaNG';

interface ProductImageProps {
  src?: string | null;
  alt: string;
  /** `sizes` correcto por contexto (evita descargar 800×800 en una card de 240px). */
  sizes: string;
  priority?: boolean;
  className?: string;
  imgClassName?: string;
}

/**
 * Imagen de producto/categoría normalizada: cuadrada, `object-contain` sobre fondo
 * neutro. Si no hay `src` → fallback de marca NG (NUNCA un 1×1 roto — corrige P6).
 * El contenedor reserva el aspect-ratio → CLS 0.
 */
export function ImagenProducto({
  src,
  alt,
  sizes,
  priority = false,
  className,
  imgClassName,
}: ProductImageProps) {
  return (
    <div className={cn('relative aspect-square overflow-hidden bg-ink-50', className)}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className={cn('object-contain p-3 transition-transform duration-200 ease-out', imgClassName)}
        />
      ) : (
        <ImagenRespaldo />
      )}
    </div>
  );
}
