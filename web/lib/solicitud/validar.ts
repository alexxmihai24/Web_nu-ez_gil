import type { LineaCesta, SolicitudPayload } from './tipos';

export type ResultadoValidacion =
  | { ok: true; value: SolicitudPayload }
  | { ok: false; errores: string[] };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_LINEAS = 100;
const MAX_QTY = 999;
const MAX_TEXTO = 2000;

/**
 * Valida y normaliza el cuerpo de una solicitud. Pura (sin I/O) → testeable.
 * Reglas: ≥1 línea, qty 1..999, nombre/email/teléfono obligatorios, email con
 * formato, consentimiento marcado. Trunca textos largos para evitar abuso.
 */
export function validarSolicitud(payload: unknown): ResultadoValidacion {
  const errores: string[] = [];
  const p = (payload ?? {}) as Partial<SolicitudPayload>;
  const lineasRaw = Array.isArray(p.lineas) ? p.lineas : [];
  const c = (p.contacto ?? {}) as Partial<SolicitudPayload['contacto']>;

  if (lineasRaw.length === 0) errores.push('La solicitud no tiene productos.');
  if (lineasRaw.length > MAX_LINEAS) errores.push('Demasiados productos en la solicitud.');

  const lineas: LineaCesta[] = [];
  for (const l of lineasRaw) {
    const qty = Number((l as LineaCesta)?.qty);
    const slug = String((l as LineaCesta)?.slug ?? '').trim();
    const id = String((l as LineaCesta)?.id ?? '').trim();
    const name = String((l as LineaCesta)?.name ?? '').trim().slice(0, 300);
    if (!id || !slug || !Number.isFinite(qty) || qty < 1 || qty > MAX_QTY) {
      errores.push('Hay líneas con datos no válidos.');
      break;
    }
    lineas.push({ id, slug, name, qty: Math.floor(qty) });
  }

  const nombre = String(c.nombre ?? '').trim();
  const email = String(c.email ?? '').trim();
  const telefono = String(c.telefono ?? '').trim();
  if (!nombre) errores.push('El nombre es obligatorio.');
  if (!EMAIL_RE.test(email)) errores.push('El email no es válido.');
  if (!telefono) errores.push('El teléfono es obligatorio.');
  if (c.consentimiento !== true) errores.push('Debes aceptar el tratamiento de tus datos.');

  if (errores.length > 0) return { ok: false, errores };

  return {
    ok: true,
    value: {
      lineas,
      contacto: {
        nombre: nombre.slice(0, 200),
        empresa: String(c.empresa ?? '').trim().slice(0, 200) || undefined,
        email: email.slice(0, 200),
        telefono: telefono.slice(0, 50),
        cif: String(c.cif ?? '').trim().slice(0, 50) || undefined,
        mensaje: String(c.mensaje ?? '').trim().slice(0, MAX_TEXTO) || undefined,
        consentimiento: true,
      },
    },
  };
}
