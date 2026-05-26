/**
 * Limitador de tasa en memoria para login y formularios (anti fuerza bruta / flood).
 * Resuelve la parte DoS del threat model (login, contacto, buscador) — hallazgo S6.
 *
 * Diseño:
 *   - Sliding window log ligero por clave (IP, `login:email`, `contact:ip`...).
 *   - Sin dependencias externas: válido en Edge y Node. EDGE-SAFE.
 *   - Almacenamiento en `Map` de proceso → suficiente para fase 1 (instancia única
 *     o pocas instancias). LIMITACIÓN documentada: en serverless multi-instancia el
 *     estado NO es compartido; para garantías estrictas migrar a Upstash/Vercel KV
 *     manteniendo esta MISMA interfaz (`limit()`). Ver SECURITY.md.
 *
 * No es un control de seguridad fuerte por sí solo: combinar con CAPTCHA
 * (Turnstile/reCAPTCHA) en formularios públicos y con bloqueo por cuenta.
 */

export interface RateLimitResult {
  /** true si la petición se permite; false si se ha superado el límite. */
  success: boolean;
  /** Máximo de peticiones permitidas en la ventana. */
  limit: number;
  /** Peticiones restantes en la ventana actual. */
  remaining: number;
  /** Epoch (ms) en el que la ventana se libera lo suficiente para reintentar. */
  reset: number;
  /** Segundos sugeridos para la cabecera Retry-After cuando success=false. */
  retryAfter: number;
}

export interface RateLimiterOptions {
  /** Nº máximo de peticiones permitidas dentro de la ventana. */
  limit: number;
  /** Tamaño de la ventana en milisegundos. */
  windowMs: number;
  /** Prefijo opcional para namespacing de claves (p. ej. 'login', 'contact'). */
  prefix?: string;
}

type Hits = number[];

/**
 * Almacén global de proceso. Se ata a `globalThis` para sobrevivir al
 * hot-reload de Next en desarrollo (evita fugas y reinicios del contador).
 */
const STORE_KEY = '__ng_rate_limit_store__';
const globalStore = globalThis as unknown as { [STORE_KEY]?: Map<string, Hits> };
const store: Map<string, Hits> = (globalStore[STORE_KEY] ??= new Map());

// Limpieza perezosa para acotar memoria: purga claves vacías cada N operaciones.
let opsSinceSweep = 0;
const SWEEP_EVERY = 500;

function sweep(now: number, windowMs: number): void {
  for (const [key, hits] of store) {
    const fresh = hits.filter((t) => now - t < windowMs);
    if (fresh.length === 0) store.delete(key);
    else if (fresh.length !== hits.length) store.set(key, fresh);
  }
}

/**
 * Crea un limitador con una política fija. Devuelve un objeto con `limit(key)`.
 *
 * @example
 *   const loginIp = createRateLimiter({ limit: 10, windowMs: 10 * 60_000, prefix: 'login:ip' });
 *   const res = await loginIp.limit(ip);
 *   if (!res.success) return { error: 'Demasiados intentos.' };
 */
export function createRateLimiter(options: RateLimiterOptions) {
  const { limit, windowMs, prefix } = options;

  return {
    /**
     * Registra un intento para `key` y devuelve si está dentro del límite.
     * Consume una unidad de cuota cuando se permite.
     */
    async limit(key: string): Promise<RateLimitResult> {
      const now = Date.now();
      const fullKey = prefix ? `${prefix}:${key}` : key;

      if (++opsSinceSweep >= SWEEP_EVERY) {
        opsSinceSweep = 0;
        sweep(now, windowMs);
      }

      const windowStart = now - windowMs;
      const hits = (store.get(fullKey) ?? []).filter((t) => t > windowStart);

      if (hits.length >= limit) {
        const oldest = hits[0];
        const reset = oldest + windowMs;
        return {
          success: false,
          limit,
          remaining: 0,
          reset,
          retryAfter: Math.max(1, Math.ceil((reset - now) / 1000)),
        };
      }

      hits.push(now);
      store.set(fullKey, hits);

      return {
        success: true,
        limit,
        remaining: Math.max(0, limit - hits.length),
        reset: now + windowMs,
        retryAfter: 0,
      };
    },

    /** Resetea la cuota de una clave (p. ej. tras un login correcto). */
    async reset(key: string): Promise<void> {
      const fullKey = prefix ? `${prefix}:${key}` : key;
      store.delete(fullKey);
    },
  };
}

export type RateLimiter = ReturnType<typeof createRateLimiter>;

/**
 * Limitadores preconfigurados según el threat model (OWASP):
 *   - login por IP:      10 / 10 min   (fuerza bruta distribuida)
 *   - login por cuenta:   5 / 15 min   (credential stuffing dirigido a un email)
 *   - formularios:        5 / 10 min   (contacto / solicitud de pedido)
 *   - buscador:          30 / 1 min    (búsquedas costosas)
 * Cimientos para Fase 3; consúmelos desde las Server Actions correspondientes.
 */
export const limiters = {
  loginByIp: createRateLimiter({ limit: 10, windowMs: 10 * 60_000, prefix: 'login:ip' }),
  loginByAccount: createRateLimiter({ limit: 5, windowMs: 15 * 60_000, prefix: 'login:acct' }),
  form: createRateLimiter({ limit: 5, windowMs: 10 * 60_000, prefix: 'form' }),
  search: createRateLimiter({ limit: 30, windowMs: 60_000, prefix: 'search' }),
};

/**
 * Extrae la IP del cliente de las cabeceras de proxy de forma robusta.
 * En Vercel, `x-forwarded-for` es de confianza (proxy controlado).
 */
export function clientIpFromHeaders(h: Headers): string {
  const xff = h.get('x-forwarded-for');
  if (xff) return xff.split(',')[0]!.trim();
  return h.get('x-real-ip')?.trim() || 'unknown';
}
