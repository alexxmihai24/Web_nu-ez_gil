import { NextResponse } from 'next/server';
import { getProductsBySlugs } from '@/lib/data';
import { limiters, clientIpFromHeaders } from '@/lib/security/rate-limit';
import { validarSolicitud } from '@/lib/solicitud/validar';
import { enviarSolicitud } from '@/lib/solicitud/email';

/**
 * POST /api/solicitudes — recibe { lineas, contacto }, valida, resuelve los
 * productos (para el email) y envía la solicitud por email. Rate-limit anti-spam
 * con limiters.form (5/10min por IP). Runtime Node (Resend usa APIs de Node).
 */
export const runtime = 'nodejs';

export async function POST(request: Request): Promise<Response> {
  const rl = await limiters.form.limit(clientIpFromHeaders(request.headers));
  if (!rl.success) {
    return NextResponse.json(
      { ok: false, error: 'Demasiadas solicitudes. Inténtalo en unos minutos.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Cuerpo no válido.' }, { status: 400 });
  }

  const v = validarSolicitud(body);
  if (!v.ok) {
    return NextResponse.json({ ok: false, error: v.errores.join(' ') }, { status: 422 });
  }

  try {
    const productos = await getProductsBySlugs(v.value.lineas.map((l) => l.slug)).catch(() => []);
    const r = await enviarSolicitud(v.value, productos);
    return NextResponse.json({ ok: true, simulado: r.simulado });
  } catch (e) {
    console.error('[solicitud] fallo al enviar:', (e as Error).message);
    return NextResponse.json(
      { ok: false, error: 'No se pudo enviar la solicitud. Inténtalo de nuevo.' },
      { status: 502 },
    );
  }
}
