import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { ProductListItem } from '@/lib/data/types';
import { ProductImage } from '@/components/ui/ProductImage';
import { Badge, AvailabilityBadge } from '@/components/ui/Badge';
import { Price } from '@/components/ui/Price';
import { AddToRequestButton } from './AddToRequestButton';

interface ProductCardProps {
  product: ProductListItem;
  /** El primer row de la home / listado puede priorizar la imagen (LCP). */
  priority?: boolean;
  /** Ancho del card en el grid → calcula `sizes`. Por defecto grid de catálogo. */
  sizes?: string;
  className?: string;
}

const DEFAULT_SIZES = '(max-width:640px) 50vw, (max-width:1024px) 33vw, 240px';

/**
 * ProductCard B2B — Server Component (la única isla Client es el CTA).
 * Anatomía: foto cuadrada object-contain + fallback de marca · badges · marca ·
 * nombre (line-clamp-2, altura fija → grid alineado) · referencia mono-tabular ·
 * disponibilidad · precio + "I.V.A. no incluido" · CTA teal a ancho completo.
 * Resuelve el bug P6 (cards vacías). Ver diseno-ui.md §4.3.
 */
export function ProductCard({ product, priority = false, sizes = DEFAULT_SIZES, className }: ProductCardProps) {
  const href = `/producto/${product.slug}`;
  const altImg = product.brandName ? `${product.name} — ${product.brandName}` : product.name;
  const visibleBadges = product.badges.slice(0, 2);

  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-md border border-ink-200 bg-white transition-[box-shadow,transform,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md',
        className
      )}
    >
      {/* Imagen + badges. El enlace cubre la zona de imagen y título. */}
      <div className="relative">
        {visibleBadges.length > 0 ? (
          <div className="absolute left-2 top-2 z-10 flex flex-col items-start gap-1">
            {visibleBadges.map((b) => (
              <Badge key={b} kind={b} />
            ))}
          </div>
        ) : null}
        <Link href={href} tabIndex={-1} aria-hidden="true">
          <ProductImage
            src={product.imageUrl}
            alt={altImg}
            sizes={sizes}
            priority={priority}
            imgClassName="group-hover:scale-[1.03] motion-reduce:group-hover:scale-100"
          />
        </Link>
      </div>

      {/* Cuerpo */}
      <div className="flex flex-1 flex-col p-4">
        {product.brandName ? (
          <p className="text-2xs font-semibold uppercase tracking-wide text-ink-500">
            {product.brandName}
          </p>
        ) : (
          <p className="text-2xs font-semibold uppercase tracking-wide text-ink-300" aria-hidden="true">
            &nbsp;
          </p>
        )}

        <h3 className="mt-1 min-h-[2.7em] text-base font-semibold leading-snug text-ink-900">
          <Link
            href={href}
            className="line-clamp-2 rounded-sm outline-none after:absolute after:inset-0 focus-visible:ring-2 focus-visible:ring-accent-500/50"
          >
            {product.name}
          </Link>
        </h3>

        <p className="tabular mt-1 text-xs text-ink-400">Ref. {product.reference}</p>

        <div className="mt-2">
          <AvailabilityBadge availability={product.availability} />
        </div>

        <div className="mt-3 flex flex-1 flex-col justify-end">
          <Price cents={product.priceCents} oldCents={product.oldPriceCents} size="md" className="mb-3" />
          {/* z-10 para quedar por encima del overlay del enlace de la card */}
          <div className="relative z-10">
            <AddToRequestButton
              productId={product.id}
              productSlug={product.slug}
              name={product.name}
              availability={product.availability}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
