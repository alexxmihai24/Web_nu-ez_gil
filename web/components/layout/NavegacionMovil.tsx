'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Menu, X, ChevronRight, Phone, Mail, User, Tag, Sparkles, Newspaper } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UNIVERSOS } from './universos';

/**
 * Navegación móvil (drill-down off-canvas) — Client island accesible (ux §2.3).
 * Hamburguesa → drawer con foco atrapado, cierre por Esc/overlay/✕. Nivel 0 = 6
 * universos; tap despliega sus departamentos (acordeón). Buscador fijo arriba.
 */
export function NavegacionMovil() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    closeBtnRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
      if (e.key === 'Tab' && panelRef.current) {
        const focusables = panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label="Abrir menú"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="inline-flex h-11 w-11 items-center justify-center rounded-md text-ink-700 hover:bg-ink-100 lg:hidden"
      >
        <Menu className="h-6 w-6" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-drawer-overlay lg:hidden">
          <div
            className="absolute inset-0 bg-brand-900/50"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menú principal"
            className="absolute inset-y-0 left-0 z-drawer flex w-[88%] max-w-sm flex-col bg-white shadow-lg"
          >
            <div className="flex items-center justify-between bg-brand-700 px-4 py-3 text-white">
              <span className="text-base font-bold">Catálogo</span>
              <button
                ref={closeBtnRef}
                type="button"
                aria-label="Cerrar menú"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-md hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Buscador fijo arriba (buscar primero) */}
            <form action="/buscador" className="border-b border-ink-200 p-3">
              <input
                name="q"
                type="search"
                aria-label="Buscar en el catálogo"
                placeholder="Buscar producto o referencia…"
                className="h-11 w-full rounded-md border border-ink-300 px-3 text-base outline-none focus:border-accent-400"
              />
            </form>

            <nav aria-label="Departamentos" className="flex-1 overflow-y-auto p-2">
              <ul>
                {UNIVERSOS.map((u) => {
                  const isOpen = expanded === u.id;
                  const Icon = u.icon;
                  return (
                    <li key={u.id} className="border-b border-ink-100 last:border-0">
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        onClick={() => setExpanded(isOpen ? null : u.id)}
                        className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-left text-base font-semibold text-ink-800 hover:bg-ink-50"
                      >
                        <Icon className="h-5 w-5 shrink-0 text-brand-500" aria-hidden="true" />
                        <span className="flex-1">{u.name}</span>
                        <ChevronRight
                          className={cn('h-4 w-4 text-ink-400 transition-transform', isOpen && 'rotate-90')}
                          aria-hidden="true"
                        />
                      </button>
                      {isOpen ? (
                        <ul className="pb-2 pl-11 pr-3">
                          {u.departments.map((d) => (
                            <li key={d.slug}>
                              <Link
                                href={`/${d.slug}`}
                                onClick={() => setOpen(false)}
                                className="block rounded-sm py-2 text-sm text-ink-600 hover:text-accent-600"
                              >
                                {d.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </li>
                  );
                })}
              </ul>

              {/* Accesos transversales */}
              <ul className="mt-2 border-t border-ink-200 pt-2">
                {[
                  { href: '/marcas', label: 'Marcas', icon: Tag },
                  { href: '/novedades', label: 'Destacados', icon: Sparkles },
                  { href: '/noticias', label: 'Actualidad', icon: Newspaper },
                  { href: '/acceso', label: 'Área clientes', icon: User },
                ].map(({ href, label, icon: Icon }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-md px-3 py-3 text-base font-medium text-ink-700 hover:bg-ink-50"
                    >
                      <Icon className="h-5 w-5 text-ink-400" aria-hidden="true" />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="border-t border-ink-200 bg-ink-50 px-4 py-3 text-sm text-ink-600">
              <a href="tel:957655388" className="flex items-center gap-2 py-1 hover:text-brand-700">
                <Phone className="h-4 w-4" /> 957 65 53 88
              </a>
              <a href="mailto:info@nunezgil.com" className="flex items-center gap-2 py-1 hover:text-brand-700">
                <Mail className="h-4 w-4" /> info@nunezgil.com
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
