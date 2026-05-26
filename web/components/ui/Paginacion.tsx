import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  page: number;
  total: number;
  pageSize: number;
  /** Construye el href de cada página preservando filtros (recibe el nº de página). */
  buildHref: (page: number) => string;
}

/** Genera la secuencia de páginas con elipsis: 1 … 4 5 [6] 7 8 … 20 */
function pageRange(current: number, last: number): (number | 'gap')[] {
  if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1);
  const pages: (number | 'gap')[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(last - 1, current + 1);
  if (start > 2) pages.push('gap');
  for (let p = start; p <= end; p++) pages.push(p);
  if (end < last - 1) pages.push('gap');
  pages.push(last);
  return pages;
}

/** Paginación Server con <Link> a ?page= (filtros preservados por buildHref). */
export function Paginacion({ page, total, pageSize, buildHref }: PaginationProps) {
  const lastPage = Math.max(1, Math.ceil(total / pageSize));
  if (lastPage <= 1) return null;

  const pages = pageRange(page, lastPage);
  const itemBase =
    'inline-flex h-10 min-w-10 items-center justify-center rounded-md px-3 text-sm font-medium transition-colors';

  return (
    <nav aria-label="Paginación" className="mt-10 flex items-center justify-center gap-1">
      {page > 1 ? (
        <Link href={buildHref(page - 1)} rel="prev" className={cn(itemBase, 'text-ink-600 hover:bg-ink-100')} aria-label="Página anterior">
          <ChevronLeft className="h-4 w-4" />
        </Link>
      ) : (
        <span className={cn(itemBase, 'cursor-not-allowed text-ink-300')} aria-hidden="true">
          <ChevronLeft className="h-4 w-4" />
        </span>
      )}

      {pages.map((p, i) =>
        p === 'gap' ? (
          <span key={`gap-${i}`} className="px-1.5 text-ink-400" aria-hidden="true">
            …
          </span>
        ) : p === page ? (
          <span key={p} aria-current="page" className={cn(itemBase, 'bg-brand-700 text-white')}>
            {p}
          </span>
        ) : (
          <Link key={p} href={buildHref(p)} className={cn(itemBase, 'text-ink-600 hover:bg-ink-100')}>
            {p}
          </Link>
        )
      )}

      {page < lastPage ? (
        <Link href={buildHref(page + 1)} rel="next" className={cn(itemBase, 'text-ink-600 hover:bg-ink-100')} aria-label="Página siguiente">
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span className={cn(itemBase, 'cursor-not-allowed text-ink-300')} aria-hidden="true">
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
}
