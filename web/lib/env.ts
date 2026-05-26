import { z } from 'zod';

/**
 * Validación de variables de entorno (fail-fast en arranque).
 * Base compartida — ya incluye todas las claves anticipadas por los agentes
 * (Backend: DATABASE_URL; Security: SESSION_SECRET; Email de solicitud, etc.)
 * para que NINGÚN agente necesite editar este archivo en paralelo.
 *
 * Regla de seguridad (agentes/seguridad.md): los secretos NUNCA en el cliente.
 * Solo las claves con prefijo NEXT_PUBLIC_ son accesibles en el navegador.
 */
const serverSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().url().optional(),
  // Secreto de sesión: obligatorio en producción, ≥ 32 caracteres.
  SESSION_SECRET: z.string().min(32).optional(),
  // Email transaccional (envío de la solicitud de pedido/presupuesto).
  RESEND_API_KEY: z.string().optional(),
  CONTACT_TO_EMAIL: z.string().email().default('info@nunezgil.com'),
});

const publicSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().default('https://nunezgil.com'),
  NEXT_PUBLIC_GA_ID: z.string().default('G-RWL5CKME4Q'),
});

const parsedServer = serverSchema.safeParse(process.env);
if (!parsedServer.success && process.env.NODE_ENV === 'production') {
  console.error('❌ Variables de entorno inválidas:', parsedServer.error.flatten().fieldErrors);
  throw new Error('Configuración de entorno inválida');
}

export const env = {
  ...(parsedServer.success ? parsedServer.data : serverSchema.parse({})),
  ...publicSchema.parse({
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
  }),
};
