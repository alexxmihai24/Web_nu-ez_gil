import Link from 'next/link';
import { cn } from '@/lib/utils';
import { UNIVERSES } from '@/components/layout/universes';

interface DepartmentSidebarProps {
  /** Slug del departamento activo (nivel 1) para resaltarlo. */
  activeSlug?: string;
  className?: string;
}

/**
 * Sidebar de departamentos — Server Component. Lista agrupada por universo; el
 * departamento activo se resalta (borde izquierdo teal + fondo brand-50). Sticky en
 * lg+. Usa la capa de universos (sin fetch). Ver diseno-ui.md §5.2.
 */
export function DepartmentSidebar({ activeSlug, className }: DepartmentSidebarProps) {
  return (
    <aside aria-label="Departamentos" className={cn('lg:sticky lg:top-[180px]', className)}>
      <nav className="rounded-lg border border-ink-200 bg-white p-2">
        <p className="px-3 py-2 text-2xs font-bold uppercase tracking-[0.12em] text-ink-400">
          Departamentos
        </p>
        <ul className="space-y-4 px-1 pb-1">
          {UNIVERSES.map((universe) => (
            <li key={universe.id}>
              <p className="px-2 text-2xs font-semibold uppercase tracking-wide text-brand-600">
                {universe.name}
              </p>
              <ul className="mt-1">
                {universe.departments.map((department) => {
                  const isActive = department.slug === activeSlug;
                  return (
                    <li key={department.slug}>
                      <Link
                        href={`/${department.slug}`}
                        aria-current={isActive ? 'page' : undefined}
                        className={cn(
                          'block rounded-md border-l-2 px-3 py-1.5 text-sm transition-colors',
                          isActive
                            ? 'border-accent-500 bg-brand-50 font-semibold text-brand-700'
                            : 'border-transparent text-ink-600 hover:bg-ink-100 hover:text-brand-700'
                        )}
                      >
                        {department.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
