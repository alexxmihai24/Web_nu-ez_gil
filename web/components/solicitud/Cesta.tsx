'use client';

import { useCallback, useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { LS_CESTA, EVENTO_CESTA, type LineaCesta } from '@/lib/solicitud/tipos';
import type { ProductListItem } from '@/lib/data/types';
import { ImagenProducto } from '@/components/ui/ImagenProducto';
import { Precio } from '@/components/ui/Precio';
import { SelectorCantidad } from '@/components/catalog/SelectorCantidad';
import { EstadoVacio } from '@/components/ui/EstadoVacio';
import { FormularioSolicitud } from './FormularioSolicitud';

/** Lee la cesta de localStorage. */
function leerCesta(): LineaCesta[] {
  try {
    const raw = localStorage.getItem(LS_CESTA);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}
/** Persiste cambios y re-emite el evento para el contador de la cabecera. */
function guardarCesta(lineas: LineaCesta[]) {
  try {
    localStorage.setItem(LS_CESTA, JSON.stringify(lineas));
    window.dispatchEvent(new CustomEvent(EVENTO_CESTA, { detail: { count: lineas.length } }));
  } catch {
    /* modo privado */
  }
}

export function Cesta() {
  const [lineas, setLineas] = useState<LineaCesta[]>([]);
  const [productos, setProductos] = useState<Map<string, ProductListItem>>(new Map());
  const [montado, setMontado] = useState(false);
  const [enviado, setEnviado] = useState(false);

  useEffect(() => {
    setLineas(leerCesta());
    setMontado(true);
  }, []);

  // Enriquecer con datos de producto cuando cambian los slugs.
  useEffect(() => {
    if (lineas.length === 0) {
      setProductos(new Map());
      return;
    }
    const slugs = lineas.map((l) => l.slug).join(',');
    let cancelado = false;
    fetch(`/api/solicitudes/resolver?slugs=${encodeURIComponent(slugs)}`)
      .then((r) => r.json())
      .then((d: { items: ProductListItem[] }) => {
        if (cancelado) return;
        setProductos(new Map((d.items ?? []).map((p) => [p.slug, p])));
      })
      .catch(() => {
        /* deja los nombres guardados como respaldo */
      });
    return () => {
      cancelado = true;
    };
  }, [lineas]);

  const cambiarQty = useCallback((slug: string, qty: number) => {
    setLineas((prev) => {
      const next = prev.map((l) => (l.slug === slug ? { ...l, qty } : l));
      guardarCesta(next);
      return next;
    });
  }, []);

  const quitar = useCallback((slug: string) => {
    setLineas((prev) => {
      const next = prev.filter((l) => l.slug !== slug);
      guardarCesta(next);
      return next;
    });
  }, []);

  const vaciar = useCallback(() => {
    setLineas([]);
    guardarCesta([]);
  }, []);

  // Envío con éxito: muestra confirmación (distinto del vaciado manual) y limpia la cesta.
  const alEnviar = useCallback(() => {
    setEnviado(true);
    setLineas([]);
    guardarCesta([]);
  }, []);

  if (!montado) return null; // evita parpadeo SSR (la cesta es per-navegador)

  if (enviado) {
    return (
      <div role="status" className="rounded-lg border border-success/30 bg-success/5 p-8 text-center">
        <p className="text-xl font-semibold text-ink-900">¡Solicitud enviada!</p>
        <p className="mx-auto mt-2 max-w-md text-ink-600">
          Gracias. Núñez Gil revisará tu solicitud y te contactará con el presupuesto lo antes posible.
        </p>
        <a href="/" className="mt-6 inline-block font-semibold text-brand-700 hover:underline">
          Volver al inicio
        </a>
      </div>
    );
  }

  if (lineas.length === 0) {
    return (
      <EstadoVacio
        title="Tu solicitud está vacía"
        description="Añade productos desde el catálogo y pídenos presupuesto sin compromiso."
        action={{ label: 'Ver catálogo', href: '/' }}
      />
    );
  }

  const subtotal = lineas.reduce((acc, l) => acc + (productos.get(l.slug)?.priceCents ?? 0) * l.qty, 0);

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
      <ul className="divide-y divide-ink-200 rounded-lg border border-ink-200 bg-white">
        {lineas.map((l) => {
          const p = productos.get(l.slug);
          return (
            <li key={l.slug} className="flex gap-4 p-4">
              <div className="h-20 w-20 shrink-0">
                <ImagenProducto src={p?.imageUrl ?? null} alt={l.name} sizes="80px" />
              </div>
              <div className="flex flex-1 flex-col">
                <p className="text-sm font-semibold text-ink-900">{p?.name ?? l.name}</p>
                {p?.reference ? <p className="tabular text-xs text-ink-400">Ref. {p.reference}</p> : null}
                <div className="mt-2">
                  <Precio cents={p?.priceCents} oldCents={p?.oldPriceCents} size="md" />
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <SelectorCantidad value={l.qty} onChange={(q) => cambiarQty(l.slug, q)} />
                  <button
                    type="button"
                    onClick={() => quitar(l.slug)}
                    aria-label={`Quitar ${l.name}`}
                    className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" /> Quitar
                  </button>
                </div>
              </div>
            </li>
          );
        })}
        <li className="flex flex-wrap items-center justify-between gap-2 p-4 text-sm">
          <button type="button" onClick={vaciar} className="text-ink-500 hover:text-red-600">
            Vaciar solicitud
          </button>
          <span className="text-ink-600">
            Subtotal orientativo (IVA no incl.):{' '}
            <b className="text-ink-900">
              {(subtotal / 100).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
            </b>
          </span>
        </li>
      </ul>

      <div className="rounded-lg border border-ink-200 bg-white p-6">
        <FormularioSolicitud lineas={lineas} onEnviado={alEnviar} />
      </div>
    </div>
  );
}
