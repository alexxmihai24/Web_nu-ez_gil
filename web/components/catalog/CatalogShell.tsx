import type { ReactNode } from 'react';
import { Container } from '@/components/ui/Container';
import { Breadcrumbs, type Crumb } from '@/components/ui/Breadcrumbs';
import { Heading } from '@/components/ui/Heading';
import { DepartmentSidebar } from './DepartmentSidebar';

interface CatalogShellProps {
  title: string;
  breadcrumbs: Crumb[];
  /** Slug del departamento activo para el sidebar. */
  activeDepartment?: string;
  description?: string;
  /** Oculta el sidebar (p. ej. resultados de búsqueda). */
  withSidebar?: boolean;
  children: ReactNode;
}

/**
 * Marco de página de catálogo — Server Component. Breadcrumbs + H1 + (sidebar de
 * departamentos | contenido). Layout `260px 1fr` en lg+ (ux §5.2). Mucho blanco.
 */
export function CatalogShell({
  title,
  breadcrumbs,
  activeDepartment,
  description,
  withSidebar = true,
  children,
}: CatalogShellProps) {
  return (
    <Container className="py-6 lg:py-8">
      <Breadcrumbs items={breadcrumbs} />
      <Heading level={1} size="3xl" className="mt-4">
        {title}
      </Heading>
      {description ? <p className="mt-2 max-w-prose text-ink-600">{description}</p> : null}

      <div className={withSidebar ? 'mt-6 grid gap-8 lg:grid-cols-[260px_1fr]' : 'mt-6'}>
        {withSidebar ? (
          <DepartmentSidebar activeSlug={activeDepartment} className="hidden lg:block" />
        ) : null}
        <div className="min-w-0">{children}</div>
      </div>
    </Container>
  );
}
