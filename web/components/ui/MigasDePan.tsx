import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { env } from '@/lib/env';

export interface Miga {
  name: string;
  /** Ruta absoluta del sitio (p. ej. "/quimica-industrial"). El último puede omitirse. */
  href?: string;
}

/**
 * Migas de pan accesibles + JSON-LD BreadcrumbList. Refleja SIEMPRE el path real
 * de catálogo (Departamento › Categoría › Subcategoría › Producto).
 */
export function MigasDePan({ items }: { items: Miga[] }) {
  const all: Miga[] = [{ name: 'Inicio', href: '/' }, ...items];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: all.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      ...(c.href ? { item: `${env.NEXT_PUBLIC_SITE_URL}${c.href}` } : {}),
    })),
  };

  return (
    <nav aria-label="Migas de pan" className="text-sm">
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-ink-500">
        {all.map((c, i) => {
          const last = i === all.length - 1;
          return (
            <li key={`${c.name}-${i}`} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-ink-400" aria-hidden="true" />}
              {last || !c.href ? (
                <span className={last ? 'font-medium text-ink-800' : undefined} aria-current={last ? 'page' : undefined}>
                  {c.name}
                </span>
              ) : (
                <Link href={c.href} className="rounded-sm transition-colors hover:text-brand-600">
                  {c.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </nav>
  );
}
