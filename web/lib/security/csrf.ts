import 'server-only';
import { cookies, headers } from 'next/headers';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { env } from '@/lib/env';

/**
 * Protección CSRF para Server Actions y Route Handlers que mutan estado
 * (login, registro, cambio de contraseña/email, solicitud de pedido, contacto).
 *
 * Modelo de defensa en profundidad (resuelve S6 del informe):
 *   1) Verificación de Origin/Referer contra el Host de confianza
 *      (bloquea peticiones cross-site clásicas). Next ya hace una comprobación
 *      similar en Server Actions, pero la reforzamos de forma explícita y testeable.
 *   2) Double-submit token: cookie no-HttpOnly + campo de formulario; ambos deben
 *      coincidir (comparación en tiempo constante). Vincula la petición al origen
 *      que pudo leer la cookie same-site.
 *
 * SameSite=Lax en la cookie de sesión es la primera línea; esto es la segunda.
 *
 * SERVER-ONLY: usa `node:crypto` y `next/headers`. Nunca importar en cliente.
 */

const CSRF_COOKIE = 'ng_csrf';
const CSRF_FIELD = 'csrf';
const TOKEN_BYTES = 32; // 256 bits

export class CsrfError extends Error {
  readonly code: 'origin_mismatch' | 'missing_origin' | 'token_mismatch' | 'token_missing';
  constructor(code: CsrfError['code'], message: string) {
    super(message);
    this.name = 'CsrfError';
    this.code = code;
  }
}

/** Hosts considerados de confianza para la verificación de Origin. */
function trustedHosts(requestHost: string | null): Set<string> {
  const hosts = new Set<string>();
  if (requestHost) hosts.add(requestHost.toLowerCase());
  try {
    hosts.add(new URL(env.NEXT_PUBLIC_SITE_URL).host.toLowerCase());
  } catch {
    /* env validado en arranque; ignorar */
  }
  return hosts;
}

/**
 * Emite (o reutiliza) el token CSRF y lo persiste en una cookie legible por JS
 * (necesario para el patrón double-submit). Devuelve el valor para renderizarlo
 * en un <input type="hidden" name="csrf">.
 *
 * La cookie NO es HttpOnly por diseño (double-submit), pero sí Secure+SameSite=Lax,
 * y el token NO concede acceso por sí mismo: solo demuestra mismo-origen.
 */
export async function issueCsrfToken(): Promise<string> {
  const store = await cookies();
  const existing = store.get(CSRF_COOKIE)?.value;
  if (existing && existing.length >= 43) return existing; // base64url de 32 bytes ≈ 43 chars

  const token = randomBytes(TOKEN_BYTES).toString('base64url');
  store.set(CSRF_COOKIE, token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8,
  });
  return token;
}

/** Nombre del campo de formulario esperado (para mantener consistencia). */
export const CSRF_FIELD_NAME = CSRF_FIELD;

/**
 * Verifica el Origin/Referer de la petición contra los hosts de confianza.
 * Lanza CsrfError si la petición es cross-site. Para peticiones same-origin
 * algunos navegadores no envían Origin en GET; esta función está pensada para
 * mutaciones (POST/Server Action), donde Origin debería estar presente.
 */
export async function assertSameOrigin(): Promise<void> {
  const h = await headers();
  const host = h.get('host');
  const trusted = trustedHosts(host);

  const origin = h.get('origin');
  if (origin) {
    let originHost: string;
    try {
      originHost = new URL(origin).host.toLowerCase();
    } catch {
      throw new CsrfError('origin_mismatch', 'Cabecera Origin malformada.');
    }
    if (!trusted.has(originHost)) {
      throw new CsrfError('origin_mismatch', 'Origin no coincide con el host de confianza.');
    }
    return;
  }

  // Sin Origin: caer al Referer como respaldo.
  const referer = h.get('referer');
  if (referer) {
    try {
      const refHost = new URL(referer).host.toLowerCase();
      if (!trusted.has(refHost)) {
        throw new CsrfError('origin_mismatch', 'Referer no coincide con el host de confianza.');
      }
      return;
    } catch {
      throw new CsrfError('origin_mismatch', 'Cabecera Referer malformada.');
    }
  }

  // Ni Origin ni Referer en una mutación → rechazar (fail-closed).
  throw new CsrfError('missing_origin', 'Falta Origin/Referer en una petición mutadora.');
}

/** Comparación en tiempo constante de dos strings (anti timing). */
function constantTimeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) {
    // Comparar contra sí mismo para no revelar la longitud por timing.
    timingSafeEqual(ba, ba);
    return false;
  }
  return timingSafeEqual(ba, bb);
}

/**
 * Verificación completa de CSRF para una mutación.
 * 1) Origin/Referer same-origin.
 * 2) (Si se proporciona formToken) double-submit token == cookie.
 *
 * @param formToken  Valor del campo `csrf` del formulario. Si es `undefined`,
 *   solo se aplica la verificación de Origin (suficiente para Server Actions
 *   con SameSite=Lax; el token añade defensa extra en mutaciones sensibles).
 */
export async function assertCsrf(formToken?: string | null): Promise<void> {
  await assertSameOrigin();

  if (formToken === undefined) return;

  if (!formToken) {
    throw new CsrfError('token_missing', 'Falta el token CSRF en el formulario.');
  }
  const cookieToken = (await cookies()).get(CSRF_COOKIE)?.value;
  if (!cookieToken) {
    throw new CsrfError('token_missing', 'Falta la cookie CSRF.');
  }
  if (!constantTimeEqual(cookieToken, formToken)) {
    throw new CsrfError('token_mismatch', 'El token CSRF no coincide.');
  }
}
