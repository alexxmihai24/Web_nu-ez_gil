import 'server-only';
import { cookies } from 'next/headers';
import { randomBytes, createHash } from 'node:crypto';

/**
 * Sesión OPACA server-side, revocable. Cimiento para el Área Clientes (Fase 3).
 * Resuelve el hallazgo S3 (cookie de sesión sin flags) del informe.
 *
 * Diseño de seguridad:
 *   - Token aleatorio de 256 bits, URL-safe. Al cliente va el token EN CLARO;
 *     en el almacén se guarda SOLO su hash SHA-256 → si se filtra la BD, los
 *     tokens robados no sirven (no son reversibles a la cookie).
 *   - Cookie `HttpOnly` (inaccesible a JS → mitiga robo por XSS), `Secure`
 *     (solo HTTPS), `SameSite=Lax` (anti-CSRF básico sin romper enlaces entrantes).
 *   - Revocación real server-side (logout, cambio de contraseña, "cerrar en todos
 *     los dispositivos") borrando el registro del almacén.
 *
 * DESACOPLADO DE PRISMA a propósito: define una interfaz `SessionStore` que en
 * Fase 3 se implementará contra la tabla `Session` de Prisma. El almacén por
 * defecto es en memoria (NO persistente, NO multi-instancia) para que estos
 * cimientos compilen y se puedan testear sin esquema de BD. El orquestador
 * cableará el store de producción vía `setSessionStore()`. Ver SECURITY.md.
 *
 * SERVER-ONLY: usa `node:crypto` y `next/headers`.
 */

export const SESSION_COOKIE = 'ng_session';
const TOKEN_BYTES = 32; // 256 bits
const DEFAULT_TTL_MS = 1000 * 60 * 60 * 8; // 8 horas

export interface SessionRecord {
  /** Hash SHA-256 (hex) del token; clave primaria lógica. */
  tokenHash: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
}

/**
 * Contrato del almacén de sesiones. Implementar contra Prisma en Fase 3:
 *   create  → prisma.session.create
 *   findByTokenHash → prisma.session.findUnique({ where: { tokenHash } })
 *   deleteByTokenHash → prisma.session.delete
 *   deleteByUserId → prisma.session.deleteMany({ where: { userId } })
 */
export interface SessionStore {
  create(record: SessionRecord): Promise<void>;
  findByTokenHash(tokenHash: string): Promise<SessionRecord | null>;
  deleteByTokenHash(tokenHash: string): Promise<void>;
  deleteByUserId(userId: string): Promise<void>;
}

/** Almacén por defecto en memoria (placeholder de desarrollo/tests). */
class InMemorySessionStore implements SessionStore {
  private readonly map = new Map<string, SessionRecord>();
  async create(record: SessionRecord): Promise<void> {
    this.map.set(record.tokenHash, record);
  }
  async findByTokenHash(tokenHash: string): Promise<SessionRecord | null> {
    return this.map.get(tokenHash) ?? null;
  }
  async deleteByTokenHash(tokenHash: string): Promise<void> {
    this.map.delete(tokenHash);
  }
  async deleteByUserId(userId: string): Promise<void> {
    for (const [k, v] of this.map) if (v.userId === userId) this.map.delete(k);
  }
}

// Atado a globalThis para sobrevivir al hot-reload de Next en desarrollo.
const STORE_KEY = '__ng_session_store__';
const g = globalThis as unknown as { [STORE_KEY]?: SessionStore };
g[STORE_KEY] ??= new InMemorySessionStore();

/**
 * Inyecta el almacén de producción (p. ej. respaldo Prisma) en el arranque.
 * Llamar una vez desde el bootstrap del servidor en Fase 3.
 */
export function setSessionStore(store: SessionStore): void {
  g[STORE_KEY] = store;
}

function getStore(): SessionStore {
  return g[STORE_KEY]!;
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function cookieOptions(maxAgeMs: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: Math.floor(maxAgeMs / 1000),
  };
}

/**
 * Crea una sesión para `userId`, persiste el HASH del token y fija la cookie.
 * Regenerar (destruir + crear) tras el login para prevenir session fixation.
 */
export async function createSession(
  userId: string,
  opts: { ttlMs?: number } = {},
): Promise<void> {
  const ttlMs = opts.ttlMs ?? DEFAULT_TTL_MS;
  const token = randomBytes(TOKEN_BYTES).toString('base64url');
  const now = new Date();

  await getStore().create({
    tokenHash: hashToken(token),
    userId,
    createdAt: now,
    expiresAt: new Date(now.getTime() + ttlMs),
  });

  (await cookies()).set(SESSION_COOKIE, token, cookieOptions(ttlMs));
}

/**
 * Lee y valida la sesión actual desde la cookie. Devuelve el userId o null.
 * Si la sesión expiró, la elimina (limpieza perezosa) y devuelve null.
 */
export async function getSession(): Promise<{ userId: string } | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const record = await getStore().findByTokenHash(hashToken(token));
  if (!record) return null;

  if (record.expiresAt.getTime() <= Date.now()) {
    await getStore().deleteByTokenHash(record.tokenHash);
    return null;
  }
  return { userId: record.userId };
}

/** Destruye la sesión actual (logout): borra el registro y la cookie. */
export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    await getStore().deleteByTokenHash(hashToken(token));
  }
  store.delete(SESSION_COOKIE);
}

/** Revoca TODAS las sesiones de un usuario (cambio de contraseña, "cerrar en todos"). */
export async function destroyAllSessions(userId: string): Promise<void> {
  await getStore().deleteByUserId(userId);
}
