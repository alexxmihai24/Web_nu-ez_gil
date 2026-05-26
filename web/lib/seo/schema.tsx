import { JsonLd } from './JsonLd';
import { SITE, NAP, AREA_SERVED, GEO, absoluteUrl } from './config';
import type { ProductDetail } from '@/lib/data/types';

/**
 * Componentes JSON-LD listos para insertar. Frontend puede adoptarlos:
 *  - <OrganizationSchema /> y <LocalBusinessSchema /> → en el layout raíz (van en
 *    un único @graph para enlazar entidades por @id; usar <SiteGraphSchema />).
 *  - <ProductSchema product={...} /> → en la ficha de producto.
 *  - <BreadcrumbSchema items={...} /> → en categoría/subcategoría/producto/marca.
 *
 * Precios PÚBLICOS sin IVA (decisión cliente): el Product incluye `offers` con
 * price + availability para mejor elegibilidad de rich results.
 */

const ORG_ID = `${SITE.url}/#organization`;
const LOCALBUSINESS_ID = `${SITE.url}/#localbusiness`;
const WEBSITE_ID = `${SITE.url}/#website`;

const postalAddress = {
  '@type': 'PostalAddress',
  streetAddress: NAP.streetAddress,
  addressLocality: NAP.addressLocality,
  addressRegion: NAP.addressRegion,
  postalCode: NAP.postalCode,
  addressCountry: NAP.addressCountry,
};

/**
 * Grafo de marca completo (Organization + LocalBusiness + WebSite enlazados por
 * @id). Pensado para inyectarse UNA vez en el layout raíz.
 *
 * Pendiente de dato del cliente (se omite si no existe, no se inventa):
 *  - `geo` (coordenadas) → GEO en config.ts
 *  - `openingHoursSpecification` (horario) → no confirmado, omitido
 *  - `sameAs` (GBP + RRSS) → se pasa por prop cuando el cliente los facilite
 */
export function SiteGraphSchema({ sameAs = [] }: { sameAs?: string[] }) {
  const organization: Record<string, unknown> = {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: SITE.name,
    legalName: SITE.legalName,
    url: SITE.url,
    logo: absoluteUrl(SITE.logo),
    vatID: SITE.vatID,
    foundingDate: SITE.foundingDate,
  };
  if (sameAs.length) organization.sameAs = sameAs;

  const localBusiness: Record<string, unknown> = {
    '@type': 'LocalBusiness',
    '@id': LOCALBUSINESS_ID,
    name: SITE.name,
    image: absoluteUrl(SITE.defaultOgImage),
    url: SITE.url,
    telephone: NAP.telephone,
    email: NAP.email,
    priceRange: '€€',
    address: postalAddress,
    areaServed: [...AREA_SERVED],
    parentOrganization: { '@id': ORG_ID },
  };
  if (GEO) {
    localBusiness.geo = {
      '@type': 'GeoCoordinates',
      latitude: GEO.latitude,
      longitude: GEO.longitude,
    };
  }

  const website = {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: SITE.url,
    name: SITE.name,
    inLanguage: 'es-ES',
    publisher: { '@id': ORG_ID },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE.url}/buscador?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <JsonLd
      id="ld-site-graph"
      data={{ '@context': 'https://schema.org', '@graph': [organization, localBusiness, website] }}
    />
  );
}

/** Atajo si solo se quiere Organization (sin LocalBusiness/WebSite). */
export function OrganizationSchema() {
  return (
    <JsonLd
      id="ld-organization"
      data={{ '@context': 'https://schema.org', '@id': ORG_ID, ...orgFields() }}
    />
  );
}

/** Atajo si solo se quiere LocalBusiness suelto (p. ej. /contacto). */
export function LocalBusinessSchema() {
  const geo = GEO
    ? { geo: { '@type': 'GeoCoordinates', latitude: GEO.latitude, longitude: GEO.longitude } }
    : {};
  return (
    <JsonLd
      id="ld-localbusiness"
      data={{
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        '@id': LOCALBUSINESS_ID,
        name: SITE.name,
        image: absoluteUrl(SITE.defaultOgImage),
        url: SITE.url,
        telephone: NAP.telephone,
        email: NAP.email,
        priceRange: '€€',
        address: postalAddress,
        areaServed: [...AREA_SERVED],
        ...geo,
      }}
    />
  );
}

function orgFields() {
  return {
    '@type': 'Organization',
    name: SITE.name,
    legalName: SITE.legalName,
    url: SITE.url,
    logo: absoluteUrl(SITE.logo),
    vatID: SITE.vatID,
    foundingDate: SITE.foundingDate,
  };
}

const AVAILABILITY_MAP: Record<ProductDetail['availability'], string> = {
  in_stock: 'https://schema.org/InStock',
  on_order: 'https://schema.org/PreOrder',
  out_of_stock: 'https://schema.org/OutOfStock',
};

/**
 * Product schema. Precio público SIN IVA → se declara `priceSpecification` con
 * `valueAddedTaxIncluded: false`. Si `priceCents` es null ("Consultar precio")
 * se emite el Product SIN `offers` (evita mismatch / warnings de Rich Results).
 * No se inventan `aggregateRating`/`review`.
 */
export function ProductSchema({ product }: { product: ProductDetail }) {
  const images = (product.gallery?.length ? product.gallery : [product.imageUrl])
    .filter((x): x is string => Boolean(x))
    .map((u) => (u.startsWith('http') ? u : absoluteUrl(u)));

  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    sku: product.reference,
    ...(product.brandName ? { brand: { '@type': 'Brand', name: product.brandName } } : {}),
    ...(images.length ? { image: images } : {}),
    ...(product.description ? { description: product.description } : {}),
  };

  if (typeof product.priceCents === 'number') {
    const price = (product.priceCents / 100).toFixed(2);
    data.offers = {
      '@type': 'Offer',
      url: absoluteUrl(`/${product.slug}`),
      priceCurrency: 'EUR',
      price,
      priceSpecification: {
        '@type': 'PriceSpecification',
        price,
        priceCurrency: 'EUR',
        valueAddedTaxIncluded: false,
      },
      availability: AVAILABILITY_MAP[product.availability],
      seller: { '@id': ORG_ID },
    };
  }

  return <JsonLd id="ld-product" data={data} />;
}

export interface BreadcrumbItem {
  name: string;
  /** Ruta relativa ("/quimica-industrial") o URL absoluta. */
  url: string;
}

/** BreadcrumbList. Pasar siempre "Inicio" como primer elemento. */
export function BreadcrumbSchema({ items }: { items: BreadcrumbItem[] }) {
  return (
    <JsonLd
      id="ld-breadcrumb"
      data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: item.name,
          item: absoluteUrl(item.url),
        })),
      }}
    />
  );
}
