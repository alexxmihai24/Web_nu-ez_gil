import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Category } from '@/lib/data/types';
import { ImagenRespaldo } from '@/components/ui/MarcaNG';

interface CategoryCardProps {
  category: Pick<Category, 'name' | 'slug' | 'imageUrl' | 'parentSlug'>;
  /** Href completo. Si se omite, se compone con el slug (nivel 1 → /slug). */
  href?: string;
  priority?: boolean;
  /** "tile" = foto grande con texto sobre scrim (home). "compact" = fila (sidebar/listado). */
  variant?: 'tile' | 'compact';
  sizes?: string;
  className?: string;
}

/**
 * TarjetaCategoria — Server Component. Foto representativa con leve overlay azul al hover
 * y nombre en blanco encima (scrim para garantizar contraste). Fallback de marca si
 * no hay imagen. Ver diseno-ui.md §5.4.
 */
export function TarjetaCategoria({
  category,
  href,
  priority = false,
  variant = 'tile',
  sizes = '(max-width:640px) 50vw, (max-width:1024px) 33vw, 280px',
  className,
}: CategoryCardProps) {
  const url = href ?? `/${category.slug}`;

  if (variant === 'compact') {
    return (
      <Link
        href={url}
        className={cn(
          'flex items-center gap-3 rounded-md border border-ink-200 bg-white p-2.5 transition-colors hover:border-brand-200 hover:bg-brand-50',
          className
        )}
      >
        <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-sm bg-ink-50">
          {category.imageUrl ? (
            <Image src={category.imageUrl} alt="" fill sizes="48px" className="object-contain p-1" />
          ) : (
            <ImagenRespaldo />
          )}
        </span>
        <span className="flex-1 text-sm font-medium text-ink-800">{category.name}</span>
        <ArrowRight className="h-4 w-4 text-ink-400" aria-hidden="true" />
      </Link>
    );
  }

  return (
    <Link
      href={url}
      className={cn(
        'group relative block overflow-hidden rounded-lg border border-ink-200 bg-white shadow-xs transition-shadow hover:shadow-md',
        className
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-ink-50">
        {category.imageUrl ? (
          <Image
            src={category.imageUrl}
            alt={category.name}
            fill
            sizes={sizes}
            priority={priority}
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-105 motion-reduce:group-hover:scale-100"
          />
        ) : (
          <ImagenRespaldo />
        )}
        {/* Scrim azul de doble capa → contraste AA del texto blanco incluso sobre
            fotos claras o de fondo blanco. Se intensifica suavemente al hover. */}
        <span
          className="absolute inset-0 bg-gradient-to-t from-brand-900 via-brand-900/55 to-brand-900/5 transition-colors duration-300 group-hover:from-brand-900 group-hover:via-brand-900/70"
          aria-hidden="true"
        />
      </div>
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 p-4">
        <h3 className="text-base font-bold leading-tight text-white [text-shadow:0_1px_4px_rgba(2,8,23,0.6)]">
          {category.name}
        </h3>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-colors group-hover:bg-accent-500">
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
