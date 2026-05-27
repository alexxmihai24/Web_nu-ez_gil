/**
 * Contrato compartido de la "cesta de solicitud" (B2B, sin cuentas ni pago).
 * La cesta vive en localStorage del navegador; estas constantes y tipos los usan
 * el botón de añadir, el contador de la cabecera y la página /solicitud.
 */

/** Clave de localStorage donde se persiste la cesta del invitado. */
export const LS_CESTA = 'ng:solicitud';
/** Evento que se emite al cambiar la cesta (lo escucha el contador de la cabecera). */
export const EVENTO_CESTA = 'ng:solicitud:update';

/** Línea tal como se guarda en localStorage (mínima: el resto se resuelve por slug). */
export interface LineaCesta {
  id: string;
  slug: string;
  name: string;
  qty: number;
}

/** Datos de contacto del formulario B2B. */
export interface ContactoSolicitud {
  nombre: string;
  empresa?: string;
  email: string;
  telefono: string;
  cif?: string;
  mensaje?: string;
  consentimiento: boolean;
}

/** Cuerpo que la página envía a POST /api/solicitudes. */
export interface SolicitudPayload {
  lineas: LineaCesta[];
  contacto: ContactoSolicitud;
}
