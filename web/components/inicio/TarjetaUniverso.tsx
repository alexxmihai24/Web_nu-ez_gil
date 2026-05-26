import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ImageFallback } from '@/components/ui/BrandMark';

interface PropsTarjetaUniverso {
  nombre: string;
  /** Slug del departamento destino. */
  slug: string;
  /** Foto representativa real (del catálogo). Si falta → marca NG. */
  imagenUrl?: string | null;
  /** Nº de departamentos que agrupa el universo (sello informativo). */
  totalDepartamentos?: number;
  prioridad?: boolean;
  className?: string;
}

/**
 * Tarjeta de "universo" de la home — foto real a sangre con velo azul y nombre
 * en blanco. Resuelve el bug de las tarjetas grises vacías. Hover: zoom suave de
 * la foto + el velo se intensifica y la flecha se tiñe de teal.
 */
export function TarjetaUniverso({
  nombre,
  slug,
  imagenUrl,
  totalDepartamentos,
  prioridad = false,
  className,
}: PropsTarjetaUniverso) {
  return (
    <Link
      href={`/${slug}`}
      className={cn(
        'group relative block overflow-hidden rounded-lg bg-brand-900 shadow-sm ring-1 ring-ink-200/60 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:ring-brand-300',
        className,
      )}
    >
      <div className="relative aspect-[5/4] overflow-hidden">
        {imagenUrl ? (
          <Image
            src={imagenUrl}
            alt=""
            fill
            sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 360px"
            priority={prioridad}
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06] motion-reduce:group-hover:scale-100"
          />
        ) : (
          <ImageFallback />
        )}
        {/* Velo azul para contraste AA del texto sobre la foto (incl. fotos claras) */}
        <span
          className="absolute inset-0 bg-gradient-to-t from-brand-900 via-brand-900/55 to-brand-900/5 transition-colors duration-300 group-hover:from-brand-900 group-hover:via-brand-900/70"
          aria-hidden="true"
        />
      </div>

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 lg:p-5">
        <div>
          {totalDepartamentos ? (
            <p className="mb-1 text-2xs font-semibold uppercase tracking-[0.14em] text-accent-300">
              {totalDepartamentos} {totalDepartamentos === 1 ? 'sección' : 'secciones'}
            </p>
          ) : null}
          <h3 className="text-lg font-bold leading-tight text-white [text-shadow:0_1px_4px_rgba(2,8,23,0.6)] lg:text-xl">
            {nombre}
          </h3>
        </div>
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-colors duration-300 group-hover:bg-accent-500"
          aria-hidden="true"
        >
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}
