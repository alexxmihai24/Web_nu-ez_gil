import 'server-only';
import { hash, verify, type Options } from '@node-rs/argon2';

/**
 * Hashing y verificación de contraseñas con argon2id.
 * Cimiento para el Área Clientes (Fase 3). SERVER-ONLY: `@node-rs/argon2` es
 * un binding nativo de Node; nunca debe importarse en componentes cliente ni
 * en el runtime Edge.
 *
 * Parámetros según recomendación OWASP para argon2id (Password Storage CS):
 *   memoryCost = 19456 KiB (19 MiB), timeCost = 2, parallelism = 1.
 * argon2id incluye salt aleatorio por hash internamente (formato PHC), así que
 * NO se almacena salt aparte: el digest ya lo contiene.
 */

const ARGON2_OPTS: Options = {
  // 2 = Algorithm.Argon2id (resistente a side-channel y a GPU). Se castea al tipo
  // del enum sin importar su VALOR: bajo `isolatedModules` no se pueden importar
  // los miembros de un `const enum` foráneo, así que usamos el literal numérico.
  algorithm: 2 as Options['algorithm'],
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
};

/** Longitud mínima de contraseña exigida (política B2B). Validar también con Zod. */
export const MIN_PASSWORD_LENGTH = 12;
/** Límite superior para evitar DoS por hashing de payloads enormes. */
export const MAX_PASSWORD_LENGTH = 200;

/**
 * Digest dummy con los MISMOS parámetros, para verificar siempre un hash aunque
 * el usuario no exista (evita oráculo de enumeración por timing en el login).
 * Se genera de forma perezosa una vez por proceso.
 */
let dummyHashPromise: Promise<string> | null = null;
export async function getDummyHash(): Promise<string> {
  dummyHashPromise ??= hash('argon2id-timing-equalizer-dummy-secret', ARGON2_OPTS);
  return dummyHashPromise;
}

/**
 * Hashea una contraseña en claro. Lanza si está fuera de los límites de longitud.
 * El llamador DEBE haber validado la política de complejidad con Zod antes.
 */
export async function hashPassword(plain: string): Promise<string> {
  if (plain.length < MIN_PASSWORD_LENGTH || plain.length > MAX_PASSWORD_LENGTH) {
    throw new RangeError('La contraseña no cumple la política de longitud.');
  }
  return hash(plain, ARGON2_OPTS);
}

/**
 * Verifica una contraseña contra su digest. Devuelve false ante cualquier error
 * (digest corrupto, etc.) en vez de lanzar, para no filtrar detalles al llamador.
 */
export async function verifyPassword(digest: string, plain: string): Promise<boolean> {
  if (plain.length === 0 || plain.length > MAX_PASSWORD_LENGTH) return false;
  try {
    return await verify(digest, plain);
  } catch {
    return false;
  }
}

/**
 * Verificación con igualación de timing para el flujo de login: si el usuario no
 * existe, verifica igualmente contra el dummy hash para que el coste de CPU sea
 * indistinguible. Devuelve siempre boolean.
 *
 * @param digest  Hash del usuario, o `null`/`undefined` si no existe.
 */
export async function verifyPasswordTimingSafe(
  digest: string | null | undefined,
  plain: string,
): Promise<boolean> {
  const target = digest ?? (await getDummyHash());
  const ok = await verifyPassword(target, plain);
  // Si no había usuario, el resultado debe ser false aunque (improbable) coincida.
  return digest ? ok : false;
}
