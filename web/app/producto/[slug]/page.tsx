import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Truck, ShieldCheck, Phone } from 'lucide-react';
import { getProductBySlug } from '@/lib/data';
import { env } from '@/lib/env';
import { formatPrice } from '@/lib/utils';
import { Contenedor } from '@/components/ui/Contenedor';
import { MigasDePan } from '@/components/ui/MigasDePan';
import { Titulo } from '@/components/ui/Titulo';
import { Badge, InsigniaDisponibilidad } from '@/components/ui/Badge';
import { Precio } from '@/components/ui/Precio';
import { GaleriaProducto } from '@/components/catalog/GaleriaProducto';
import { CajaCompra } from '@/components/catalog/CajaCompra';

export const revalidate = 3600;

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug).catch(() => null);
  if (!product) return { title: 'Producto' };
  const brandSuffix = product.brandName ? ` · ${product.brandName}` : '';
  return {
    title: `${product.name}${brandSuffix}`,
    description:
      product.description?.slice(0, 155) ??
      `${product.name} (Ref. ${product.reference}). Precio sin IVA, disponibilidad y envío gratis desde 100 €.`,
    alternates: { canonical: `/producto/${product.slug}` },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug).catch(() => null);
  if (!product) notFound();

  const breadcrumbs = [
    ...product.breadcrumb.map((crumb) => ({ name: crumb.name, href: `/${crumb.slug}` })),
    { name: product.name },
  ];

  const galleryImages = product.gallery?.length
    ? product.gallery
    : product.imageUrl
      ? [product.imageUrl]
      : [];

  const altText = product.brandName ? `${product.name} — ${product.brandName}` : product.name;

  // JSON-LD Product (rich results) — coordina con el agente SEO.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    sku: product.reference,
    ...(product.brandName ? { brand: { '@type': 'Brand', name: product.brandName } } : {}),
    ...(product.description ? { description: product.description } : {}),
    ...(galleryImages.length ? { image: galleryImages } : {}),
    ...(product.priceCents != null
      ? {
          offers: {
            '@type': 'Offer',
            price: (product.priceCents / 100).toFixed(2),
            priceCurrency: 'EUR',
            url: `${env.NEXT_PUBLIC_SITE_URL}/producto/${product.slug}`,
            availability:
              product.availability === 'in_stock'
                ? 'https://schema.org/InStock'
                : product.availability === 'on_order'
                  ? 'https://schema.org/PreOrder'
                  : 'https://schema.org/OutOfStock',
          },
        }
      : {}),
  };

  return (
    <Contenedor className="py-6 lg:py-8">
      <MigasDePan items={breadcrumbs} />

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(340px,420px)] lg:gap-12">
        <GaleriaProducto images={galleryImages} alt={altText} />

        <div className="lg:sticky lg:top-[180px] lg:self-start">
          {product.brandName ? (
            <p className="text-sm font-semibold uppercase tracking-wide text-ink-500">
              {product.brandName}
            </p>
          ) : null}

          <Titulo level={1} size="2xl" className="mt-1">
            {product.name}
          </Titulo>

          <p className="tabular mt-2 text-sm text-ink-500">Referencia: {product.reference}</p>

          {product.badges.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {product.badges.map((badge) => (
                <Badge key={badge} kind={badge} />
              ))}
            </div>
          ) : null}

          <hr className="my-5 border-ink-200" />

          <Precio cents={product.priceCents} oldCents={product.oldPriceCents} size="xl" />

          <div className="mt-4">
            <InsigniaDisponibilidad availability={product.availability} className="text-sm" />
          </div>

          <div className="mt-6">
            <CajaCompra
              productId={product.id}
              productSlug={product.slug}
              name={product.name}
              availability={product.availability}
            />
          </div>

          <ul className="mt-6 space-y-2.5 rounded-md bg-ink-50 p-4 text-sm text-ink-600">
            <li className="flex items-center gap-2.5">
              <Truck className="h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
              Envío gratis desde 100 € en Córdoba (200 € resto de península).
            </li>
            <li className="flex items-center gap-2.5">
              <ShieldCheck className="h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
              Solicitud sin compromiso: confirmamos disponibilidad y presupuesto.
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
              ¿Dudas? Llámanos al{' '}
              <a href="tel:957655388" className="font-semibold text-brand-700 hover:underline">
                957 65 53 88
              </a>
            </li>
          </ul>
        </div>
      </div>

      {product.description || (product.specs && product.specs.length > 0) ? (
        <section className="mt-12 max-w-3xl">
          <Titulo level={2} size="xl">
            Detalles del producto
          </Titulo>
          {product.description ? (
            <p className="mt-4 whitespace-pre-line text-ink-700">{product.description}</p>
          ) : null}
          {product.specs && product.specs.length > 0 ? (
            <dl className="mt-6 divide-y divide-ink-200 overflow-hidden rounded-md border border-ink-200">
              {product.specs.map((spec) => (
                <div key={spec.label} className="grid grid-cols-2 gap-4 px-4 py-2.5 text-sm odd:bg-ink-50">
                  <dt className="font-medium text-ink-600">{spec.label}</dt>
                  <dd className="tabular text-ink-900">{spec.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </section>
      ) : null}

      <div className="mt-10">
        <Link
          href={`/${product.categorySlug}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-accent-600"
        >
          Ver más productos de la categoría
        </Link>
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {product.priceCents != null ? (
        <p className="sr-only">Precio: {formatPrice(product.priceCents)}, I.V.A. no incluido.</p>
      ) : null}
    </Contenedor>
  );
}
