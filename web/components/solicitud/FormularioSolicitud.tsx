'use client';

import { useState } from 'react';
import type { ContactoSolicitud, LineaCesta } from '@/lib/solicitud/tipos';

interface Props {
  lineas: LineaCesta[];
  onEnviado: () => void; // limpia la cesta en el padre
}

const VACIO: ContactoSolicitud = {
  nombre: '', empresa: '', email: '', telefono: '', cif: '', mensaje: '', consentimiento: false,
};

const INPUT =
  'h-11 w-full rounded-md border border-ink-300 px-3 text-base outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30';

/** Formulario B2B de la solicitud. Envía a POST /api/solicitudes. */
export function FormularioSolicitud({ lineas, onEnviado }: Props) {
  const [c, setC] = useState<ContactoSolicitud>(VACIO);
  const [estado, setEstado] = useState<'idle' | 'enviando' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const set =
    (k: keyof ContactoSolicitud) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setC((prev) => ({
        ...prev,
        [k]: k === 'consentimiento' ? (e.target as HTMLInputElement).checked : e.target.value,
      }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (lineas.length === 0) {
      setError('Tu solicitud está vacía.');
      return;
    }
    setEstado('enviando');
    try {
      const res = await fetch('/api/solicitudes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lineas, contacto: c }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error ?? 'Error al enviar.');
      onEnviado(); // el padre (Cesta) muestra la confirmación y vacía la cesta
    } catch (err) {
      setEstado('error');
      setError((err as Error).message);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <h2 className="text-xl font-bold text-brand-900">Tus datos</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Nombre*</span>
          <input className={INPUT} value={c.nombre} onChange={set('nombre')} required />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Empresa</span>
          <input className={INPUT} value={c.empresa} onChange={set('empresa')} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Email*</span>
          <input type="email" className={INPUT} value={c.email} onChange={set('email')} required />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Teléfono*</span>
          <input type="tel" className={INPUT} value={c.telefono} onChange={set('telefono')} required />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">CIF/NIF</span>
          <input className={INPUT} value={c.cif} onChange={set('cif')} />
        </label>
      </div>
      <label className="block">
        <span className="mb-1 block text-sm font-medium">Mensaje</span>
        <textarea
          className="min-h-[96px] w-full rounded-md border border-ink-300 p-3 text-base outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
          value={c.mensaje}
          onChange={set('mensaje')}
        />
      </label>
      <label className="flex items-start gap-2 text-sm text-ink-600">
        <input
          type="checkbox"
          checked={c.consentimiento}
          onChange={set('consentimiento')}
          required
          className="mt-1"
        />
        <span>
          Acepto que Núñez Gil trate mis datos para responder a esta solicitud (ver{' '}
          <a href="/legal/privacidad" className="underline">
            privacidad
          </a>
          ).
        </span>
      </label>
      {error ? (
        <p role="alert" className="text-sm font-medium text-red-600">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={estado === 'enviando' || lineas.length === 0}
        className="h-12 w-full rounded-md bg-accent-500 font-semibold text-white transition-colors hover:bg-accent-600 disabled:opacity-50 sm:w-auto sm:px-8"
      >
        {estado === 'enviando' ? 'Enviando…' : 'Enviar solicitud'}
      </button>
    </form>
  );
}
