import { env } from '@/lib/env';

/**
 * Decide si las funciones de lib/data usan Prisma (Postgres) o el dataset estatico.
 * Lee la URL ya validada por lib/env.ts. Sin base de datos configurada, el
 * catalogo publico funciona igualmente con el dataset de respaldo (lib/data/seeddata.ts).
 */
export function hasDatabase(): boolean {
  const url = env.DATABASE_URL;
  return typeof url === 'string' && url.length > 0;
}
