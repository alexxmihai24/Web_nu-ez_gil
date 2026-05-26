/**
 * Punto de entrada del módulo SEO. Frontend importa desde aquí:
 *   import { buildMetadata, ProductSchema, BreadcrumbSchema } from '@/lib/seo';
 */
export { SITE, NAP, AREA_SERVED, GEO, absoluteUrl } from './config';
export { buildMetadata, truncate, type BuildMetadataInput } from './metadata';
export { JsonLd } from './JsonLd';
export {
  SiteGraphSchema,
  OrganizationSchema,
  LocalBusinessSchema,
  ProductSchema,
  BreadcrumbSchema,
  type BreadcrumbItem,
} from './schema';
