import type { ProductListItem } from '@/lib/data/types';
import type { SolicitudPayload } from './tipos';

/**
 * Envía la solicitud por email con Resend. Si no hay RESEND_API_KEY, modo SIMULADO:
 * registra el contenido y devuelve { simulado: true } (permite desarrollar sin clave).
 * `productos` son los datos resueltos (para mostrar referencia/precio en el email).
 */
const TO = process.env.SOLICITUDES_EMAIL_TO ?? 'info@nunezgil.com';
const FROM = process.env.SOLICITUDES_EMAIL_FROM ?? 'Núñez Gil <onboarding@resend.dev>';

function eur(cents?: number | null): string {
  return cents == null ? 'Consultar' : (cents / 100).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
}

function construirHtml(p: SolicitudPayload, productos: ProductListItem[]): string {
  const porSlug = new Map(productos.map((x) => [x.slug, x]));
  const filas = p.lineas
    .map((l) => {
      const prod = porSlug.get(l.slug);
      const ref = prod?.reference ?? '—';
      const precio = eur(prod?.priceCents);
      return `<tr><td>${l.qty}×</td><td>${l.name}</td><td>Ref. ${ref}</td><td>${precio}</td></tr>`;
    })
    .join('');
  const { contacto: c } = p;
  return `
    <h2>Nueva solicitud de presupuesto</h2>
    <h3>Productos</h3>
    <table border="1" cellpadding="6" cellspacing="0">${filas}</table>
    <h3>Datos del cliente</h3>
    <ul>
      <li><b>Nombre:</b> ${c.nombre}</li>
      ${c.empresa ? `<li><b>Empresa:</b> ${c.empresa}</li>` : ''}
      <li><b>Email:</b> ${c.email}</li>
      <li><b>Teléfono:</b> ${c.telefono}</li>
      ${c.cif ? `<li><b>CIF/NIF:</b> ${c.cif}</li>` : ''}
      ${c.mensaje ? `<li><b>Mensaje:</b> ${c.mensaje}</li>` : ''}
    </ul>`;
}

export async function enviarSolicitud(
  p: SolicitudPayload,
  productos: ProductListItem[],
): Promise<{ enviado: boolean; simulado: boolean }> {
  const html = construirHtml(p, productos);
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn('[solicitud] RESEND_API_KEY ausente → modo simulado. Email que se enviaría:\n', html);
    return { enviado: false, simulado: true };
  }

  // Import dinámico para no cargar Resend en el bundle si no se usa.
  const { Resend } = await import('resend');
  const resend = new Resend(apiKey);
  await resend.emails.send({
    from: FROM,
    to: TO,
    replyTo: p.contacto.email,
    subject: `Solicitud de presupuesto — ${p.contacto.nombre}`,
    html,
  });
  return { enviado: true, simulado: false };
}
