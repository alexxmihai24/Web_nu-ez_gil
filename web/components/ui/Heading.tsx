import { createElement, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Level = 1 | 2 | 3 | 4 | 5 | 6;

interface HeadingProps {
  /** Nivel semántico (un único H1 por página — ver agentes/ux-arquitectura.md §6.2). */
  level: Level;
  children: ReactNode;
  /** Eyebrow opcional (micro-label en mayúsculas sobre el título). */
  eyebrow?: string;
  className?: string;
  /** Si se quiere romper la correspondencia tamaño↔nivel (p. ej. H1 visualmente pequeño). */
  size?: keyof typeof sizeStyles;
  id?: string;
}

const sizeStyles = {
  '4xl': 'text-3xl font-extrabold tracking-tight sm:text-4xl',
  '3xl': 'text-2xl font-bold tracking-tight sm:text-3xl',
  '2xl': 'text-xl font-bold tracking-tight sm:text-2xl',
  xl: 'text-lg font-semibold sm:text-xl',
  lg: 'text-base font-semibold sm:text-lg',
} as const;

const levelDefaultSize: Record<Level, keyof typeof sizeStyles> = {
  1: '4xl',
  2: '3xl',
  3: '2xl',
  4: 'xl',
  5: 'lg',
  6: 'lg',
};

/**
 * Encabezado con jerarquía forzada. El `level` controla la etiqueta semántica
 * (h1–h6) y, por defecto, el tamaño visual; `size` permite desacoplarlos sin
 * romper la accesibilidad. Títulos en `brand-900`.
 */
export function Heading({ level, children, eyebrow, className, size, id }: HeadingProps) {
  const resolvedSize = size ?? levelDefaultSize[level];

  return (
    <div className={cn(eyebrow && 'space-y-2')}>
      {eyebrow ? (
        <p className="text-2xs font-semibold uppercase tracking-[0.14em] text-accent-600">
          {eyebrow}
        </p>
      ) : null}
      {createElement(
        `h${level}`,
        {
          id,
          className: cn('text-balance text-brand-900', sizeStyles[resolvedSize], className),
        },
        children
      )}
    </div>
  );
}
