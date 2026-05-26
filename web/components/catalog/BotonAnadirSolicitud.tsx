'use client';

import { useState } from 'react';
import { ShoppingCart, Check, MessageCircleQuestion } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Availability } from '@/lib/data/types';

interface AddToRequestButtonProps {
  productId: string;
  productSlug: string;
  name: string;
  availability: Availability;
  quantity?: number;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  /** Texto del CTA. En tarjetas estrechas usar uno corto (p. ej. "Añadir"). */
  label?: string;
  /** Texto cuando está agotado. En tarjetas usar uno corto (p. ej. "Consultar"). */
  unavailableLabel?: string;
  className?: string;
}

const LS_KEY = 'ng:solicitud';

/**
 * CTA "Añadir a la solicitud" — Client island. Persiste líneas en localStorage
 * (carrito de invitado) y emite un CustomEvent('ng:solicitud:update') para que el
 * contador del header reaccione. Toast accesible (role="status"). En Fase 3 el
 * agente de carrito puede sustituir la persistencia por su store zustand sin tocar
 * la API de este componente. Si "Agotado" → variante outline "Consultar disponibilidad".
 *
 * NOTA: sin dependencias nuevas — solo localStorage + CustomEvent + estado local.
 */
export function BotonAnadirSolicitud({
  productId,
  productSlug,
  name,
  availability,
  quantity = 1,
  size = 'md',
  fullWidth = true,
  label = 'Añadir a la solicitud',
  unavailableLabel = 'Consultar disponibilidad',
  className,
}: AddToRequestButtonProps) {
  const [state, setState] = useState<'idle' | 'added'>('idle');

  const sizes = {
    sm: 'h-9 px-4 text-sm',
    md: 'h-11 px-5 text-base',
    lg: 'h-[52px] px-6 text-lg',
  } as const;

  if (availability === 'out_of_stock') {
    return (
      <a
        href={`/contacto?ref=${encodeURIComponent(productSlug)}`}
        className={cn(
          'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border border-brand-700 font-semibold text-brand-700 transition-colors hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40',
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
      >
        <MessageCircleQuestion className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
        {unavailableLabel}
      </a>
    );
  }

  const handleAdd = () => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      const lines: Array<{ id: string; slug: string; name: string; qty: number }> = raw
        ? JSON.parse(raw)
        : [];
      const existing = lines.find((l) => l.id === productId);
      if (existing) existing.qty += quantity;
      else lines.push({ id: productId, slug: productSlug, name, qty: quantity });
      localStorage.setItem(LS_KEY, JSON.stringify(lines));
      window.dispatchEvent(new CustomEvent('ng:solicitud:update', { detail: { count: lines.length } }));
    } catch {
      /* localStorage no disponible (modo privado) → no bloquea la UI */
    }
    setState('added');
    window.setTimeout(() => setState('idle'), 2200);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleAdd}
        aria-label={`Añadir ${name} a la solicitud`}
        className={cn(
          'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-semibold text-white shadow-xs transition-[background-color,transform] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/50 focus-visible:ring-offset-2',
          state === 'added' ? 'bg-success' : 'bg-accent-500 hover:bg-accent-600 active:translate-y-px active:bg-accent-700',
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
      >
        {state === 'added' ? (
          <>
            <Check className="h-[18px] w-[18px] shrink-0" aria-hidden="true" /> Añadido
          </>
        ) : (
          <>
            <ShoppingCart className="h-[18px] w-[18px] shrink-0" aria-hidden="true" /> {label}
          </>
        )}
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {state === 'added' ? `${name} añadido a la solicitud` : ''}
      </span>
    </>
  );
}
