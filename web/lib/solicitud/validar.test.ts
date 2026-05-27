import { describe, it, expect } from 'vitest';
import { validarSolicitud } from './validar';

const lineaOk = { id: 'p1', slug: 'prod-1', name: 'Producto 1', qty: 2 };
const contactoOk = {
  nombre: 'Ana López',
  email: 'ana@bar.com',
  telefono: '600123123',
  consentimiento: true,
};

describe('validarSolicitud', () => {
  it('acepta un payload válido', () => {
    const r = validarSolicitud({ lineas: [lineaOk], contacto: contactoOk });
    expect(r.ok).toBe(true);
  });

  it('rechaza la cesta vacía', () => {
    const r = validarSolicitud({ lineas: [], contacto: contactoOk });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errores).toContain('La solicitud no tiene productos.');
  });

  it('rechaza email inválido', () => {
    const r = validarSolicitud({ lineas: [lineaOk], contacto: { ...contactoOk, email: 'no-es-email' } });
    expect(r.ok).toBe(false);
  });

  it('rechaza sin consentimiento', () => {
    const r = validarSolicitud({ lineas: [lineaOk], contacto: { ...contactoOk, consentimiento: false } });
    expect(r.ok).toBe(false);
  });

  it('rechaza cantidad fuera de rango', () => {
    const r = validarSolicitud({ lineas: [{ ...lineaOk, qty: 0 }], contacto: contactoOk });
    expect(r.ok).toBe(false);
  });

  it('rechaza nombre o teléfono vacíos', () => {
    expect(validarSolicitud({ lineas: [lineaOk], contacto: { ...contactoOk, nombre: '' } }).ok).toBe(false);
    expect(validarSolicitud({ lineas: [lineaOk], contacto: { ...contactoOk, telefono: '' } }).ok).toBe(false);
  });
});
