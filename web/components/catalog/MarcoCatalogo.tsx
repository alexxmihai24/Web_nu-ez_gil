import type { ReactNode } from 'react';
import { Contenedor } from '@/components/ui/Contenedor';
import { MigasDePan, type Miga } from '@/components/ui/MigasDePan';
import { Titulo } from '@/components/ui/Titulo';
import { BarraDepartamentos } from './BarraDepartamentos';

interface CatalogShellProps {
  title: string;
  breadcrumbs: Miga[];
  /** Slug del departamento activo para el sidebar. */
  activeDepartment?: string;
  description?: string;
  /** Oculta el sidebar (p. ej. resultados de búsqueda). */
  withSidebar?: boolean;
  children: ReactNode;
}

/**
 * Marco de página de catálogo — Server Component. MigasDePan + H1 + (sidebar de
 * departamentos | contenido). Layout `260px 1fr` en lg+ (ux §5.2). Mucho blanco.
 */
export function MarcoCatalogo({
  title,
  breadcrumbs,
  activeDepartment,
  description,
  withSidebar = true,
  children,
}: CatalogShellProps) {
  return (
    <Contenedor className="py-6 lg:py-8">
      <MigasDePan items={breadcrumbs} />
      <Titulo level={1} size="3xl" className="mt-4">
        {title}
      </Titulo>
      {description ? <p className="mt-2 max-w-prose text-ink-600">{description}</p> : null}

      <div className={withSidebar ? 'mt-6 grid gap-8 lg:grid-cols-[260px_1fr]' : 'mt-6'}>
        {withSidebar ? (
          <BarraDepartamentos activeSlug={activeDepartment} className="hidden lg:block" />
        ) : null}
        <div className="min-w-0">{children}</div>
      </div>
    </Contenedor>
  );
}
