'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ArrowUpDown } from 'lucide-react';
import type { ProductQuery } from '@/lib/data/types';

type SortValue = NonNullable<ProductQuery['sort']>;

const SORT_OPTIONS: ReadonlyArray<{ value: SortValue; label: string }> = [
  { value: 'relevance', label: 'Relevancia' },
  { value: 'price_asc', label: 'Precio: menor a mayor' },
  { value: 'price_desc', label: 'Precio: mayor a menor' },
  { value: 'newest', label: 'Novedades' },
];

/**
 * Toolbar de listado (orden + recuento) — Client island.
 * Cambiar el orden reescribe el searchParam `sort`, resetea `page` y conserva el
 * resto de filtros; el Server Component vuelve a renderizar el grid ordenado.
 */
export function Toolbar({ total }: { total: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = (searchParams.get('sort') as SortValue) ?? 'relevance';

  function handleSortChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'relevance') {
      params.delete('sort');
    } else {
      params.set('sort', value);
    }
    params.delete('page');
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-200 pb-4">
      <p className="text-sm text-ink-600">
        <span className="font-semibold text-ink-900">{total.toLocaleString('es-ES')}</span>{' '}
        {total === 1 ? 'producto' : 'productos'}
      </p>

      <label className="flex items-center gap-2 text-sm text-ink-600">
        <ArrowUpDown className="h-4 w-4 text-ink-400" aria-hidden="true" />
        <span className="sr-only sm:not-sr-only">Ordenar por</span>
        <select
          value={current}
          onChange={(event) => handleSortChange(event.target.value)}
          className="h-10 rounded-md border border-ink-300 bg-white px-3 text-sm text-ink-800 outline-none focus:border-accent-400 focus:ring-2 focus:ring-accent-500/20"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
