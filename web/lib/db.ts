import { PrismaClient } from '@prisma/client';

/**
 * Singleton de PrismaClient.
 *
 * En desarrollo, el hot-reload de Next.js re-evalúa los módulos en cada cambio.
 * Sin este patrón se acumularían conexiones a la DB ("too many connections").
 * Reutilizamos la misma instancia a través de `globalThis`.
 *
 * NOTA (Fase 2): el catálogo público puede funcionar SIN base de datos usando el
 * dataset estático de respaldo (lib/data/seed-data.ts). Por eso este cliente solo
 * se usa cuando existe DATABASE_URL; ver `hasDatabase()` en lib/data/index.ts.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
