import type { ElementType, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ContainerProps {
  as?: ElementType;
  children: ReactNode;
  className?: string;
}

/** Contenedor centrado (máx 1280px) con gutters responsivos. */
export function Container({ as: Tag = 'div', children, className }: ContainerProps) {
  return <Tag className={cn('container-ng', className)}>{children}</Tag>;
}
