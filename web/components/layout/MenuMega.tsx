'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UNIVERSOS } from './universos';

/**
 * Mega-menú "Catálogo" — Client island accesible (ver diseno-ui.md §4.4 + ux §2.2).
 * Patrón disclosure: <button aria-expanded aria-controls> + panel en columnas.
 * Apertura por hover (con retardo de cierre) Y por click/teclado. Esc cierra y
 * devuelve el foco al disparador. Respeta prefers-reduced-motion (sin animación CSS
 * propia; la transición la limita globals.css).
 */
export function MenuMega() {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };
  const openNow = () => {
    clearTimer();
    setOpen(true);
  };
  const closeSoon = () => {
    clearTimer();
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  };

  // Cerrar al hacer click fuera o pulsar Esc.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open]);

  useEffect(() => () => clearTimer(), []);

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={openNow}
      onMouseLeave={closeSoon}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'inline-flex h-11 items-center gap-1.5 rounded-md px-3 text-sm font-semibold text-white outline-none transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/70',
          open && 'bg-white/10'
        )}
      >
        Catálogo
        <ChevronDown
          className={cn('h-4 w-4 transition-transform duration-200', open && 'rotate-180')}
          aria-hidden="true"
        />
      </button>

      {open ? (
        <div
          id={panelId}
          role="region"
          aria-label="Catálogo por universo"
          onMouseEnter={openNow}
          onMouseLeave={closeSoon}
          className="absolute left-0 top-full z-megamenu mt-0 w-screen max-w-[min(1100px,calc(100vw-2rem))] origin-top rounded-b-lg border border-ink-200 bg-white shadow-lg"
        >
          <div className="grid grid-cols-2 gap-x-8 gap-y-6 p-6 md:grid-cols-3 lg:grid-cols-4">
            {UNIVERSOS.map((u) => {
              const Icon = u.icon;
              return (
                <div key={u.id}>
                  <p className="flex items-center gap-2 text-2xs font-bold uppercase tracking-[0.12em] text-brand-700">
                    <Icon className="h-4 w-4 text-brand-500" aria-hidden="true" />
                    {u.name}
                  </p>
                  <ul className="mt-3 space-y-1.5">
                    {u.departments.map((d) => (
                      <li key={d.slug}>
                        <Link
                          href={`/${d.slug}`}
                          onClick={() => setOpen(false)}
                          className="block rounded-sm py-0.5 text-sm text-ink-600 transition-colors hover:text-accent-600"
                        >
                          {d.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}

            {/* Banner destacado de confianza */}
            <div className="col-span-2 flex flex-col justify-between rounded-md bg-brand-700 p-5 text-white md:col-span-1">
              <div>
                <p className="text-2xs font-semibold uppercase tracking-[0.14em] text-accent-300">
                  Desde 1994
                </p>
                <p className="mt-2 text-lg font-bold leading-snug">
                  +10.000 referencias listas para tu negocio
                </p>
              </div>
              <Link
                href="/novedades"
                onClick={() => setOpen(false)}
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-300 hover:text-white"
              >
                Ver novedades <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
