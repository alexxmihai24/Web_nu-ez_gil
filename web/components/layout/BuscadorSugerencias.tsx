'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Suggestion {
  type: 'product' | 'category';
  name: string;
  href: string;
  reference?: string;
}

interface SearchAutosuggestProps {
  /** Estilo de la barra: "header" (sobre fondo claro) o "hero" (grande). */
  variant?: 'header' | 'hero';
  className?: string;
  autoFocus?: boolean;
}

/**
 * Buscador con autosuggest accesible — Client island (combobox ARIA).
 * Consume GET /api/search?q= (Route Handler, lo provee Backend/SEO). Debounce 220ms.
 * Enter sin selección → /buscador?q=. Navegación con flechas, Esc cierra,
 * aria-activedescendant. Si el endpoint no existe todavía, degrada con elegancia.
 */
export function BuscadorSugerencias({ variant = 'header', className, autoFocus }: SearchAutosuggestProps) {
  const router = useRouter();
  const [term, setTerm] = useState('');
  const [items, setItems] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [loading, setLoading] = useState(false);
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const q = term.trim();
    if (q.length < 2) {
      setItems([]);
      setOpen(false);
      return;
    }
    const t = setTimeout(async () => {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=8`, {
          signal: ctrl.signal,
        });
        if (!res.ok) throw new Error('no-suggest');
        const data = (await res.json()) as { items?: Suggestion[] };
        setItems(Array.isArray(data.items) ? data.items : []);
        setOpen(true);
        setActive(-1);
      } catch {
        // Endpoint aún no disponible o error → degradar (el submit sigue funcionando).
        setItems([]);
        setOpen(false);
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => clearTimeout(t);
  }, [term]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (active >= 0 && items[active]) {
      go(items[active].href);
      return;
    }
    const q = term.trim();
    if (q) router.push(`/buscador?q=${encodeURIComponent(q)}`);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open || items.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => (i + 1) % items.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (i <= 0 ? items.length - 1 : i - 1));
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const big = variant === 'hero';

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <form action="/buscador" onSubmit={submit} role="search">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400"
            aria-hidden="true"
          />
          <input
            name="q"
            type="search"
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={active >= 0 ? `${listId}-opt-${active}` : undefined}
            aria-label="Buscar en el catálogo"
            autoComplete="off"
            autoFocus={autoFocus}
            placeholder="Busca por producto o referencia…"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            onKeyDown={onKeyDown}
            onFocus={() => items.length > 0 && setOpen(true)}
            className={cn(
              'w-full rounded-md border border-ink-300 bg-white pl-11 pr-10 text-ink-800 outline-none transition-colors placeholder:text-ink-400 focus:border-accent-400 focus:ring-2 focus:ring-accent-500/20',
              big ? 'h-14 text-base' : 'h-12 text-base'
            )}
          />
          {loading ? (
            <Loader2 className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-ink-400" aria-hidden="true" />
          ) : null}
        </div>
      </form>

      <p className="sr-only" role="status" aria-live="polite">
        {open && items.length > 0 ? `${items.length} sugerencias disponibles` : ''}
      </p>

      {open && items.length > 0 ? (
        <ul
          id={listId}
          role="listbox"
          aria-label="Sugerencias"
          className="absolute left-0 right-0 top-full z-megamenu mt-1.5 overflow-hidden rounded-md border border-ink-200 bg-white py-1 shadow-lg"
        >
          {items.map((s, i) => (
            <li key={s.href} id={`${listId}-opt-${i}`} role="option" aria-selected={i === active}>
              <button
                type="button"
                onMouseEnter={() => setActive(i)}
                onClick={() => go(s.href)}
                className={cn(
                  'flex w-full items-center gap-3 px-4 py-2.5 text-left',
                  i === active ? 'bg-brand-50' : 'hover:bg-ink-50'
                )}
              >
                <Search className="h-4 w-4 shrink-0 text-ink-400" aria-hidden="true" />
                <span className="flex-1 truncate text-sm text-ink-800">{s.name}</span>
                {s.reference ? (
                  <span className="tabular shrink-0 text-2xs text-ink-400">{s.reference}</span>
                ) : (
                  <span className="shrink-0 text-2xs uppercase tracking-wide text-ink-400">
                    {s.type === 'category' ? 'Categoría' : ''}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
