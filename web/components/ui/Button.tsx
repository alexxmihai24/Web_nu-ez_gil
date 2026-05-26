import Link from 'next/link';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-[background-color,box-shadow,transform] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60';

const variants: Record<Variant, string> = {
  // CTA de conversión — teal. "Añadir a la solicitud", "Solicitar presupuesto".
  primary:
    'bg-accent-500 text-white shadow-xs hover:bg-accent-600 active:translate-y-px active:bg-accent-700 focus-visible:ring-accent-500/50',
  // Navegación / acción azul de marca.
  secondary:
    'bg-brand-700 text-white shadow-xs hover:bg-brand-800 active:bg-brand-900 focus-visible:ring-brand-500/50',
  outline:
    'border border-brand-700 bg-transparent text-brand-700 hover:bg-brand-50 hover:border-brand-800 active:bg-brand-100 focus-visible:ring-brand-500/40',
  ghost:
    'bg-transparent text-ink-700 hover:bg-ink-100 active:bg-ink-200 focus-visible:ring-brand-500/40',
  danger:
    'bg-error text-white shadow-xs hover:brightness-110 focus-visible:ring-error/50',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-5 text-base', // 44px → touch target AA por defecto
  lg: 'h-13 px-6 text-lg',
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  className?: string;
  children: ReactNode;
}

type ButtonAsButton = CommonProps &
  Omit<ComponentPropsWithoutRef<'button'>, keyof CommonProps> & { href?: undefined };

type ButtonAsLink = CommonProps &
  Omit<ComponentPropsWithoutRef<typeof Link>, keyof CommonProps | 'href'> & { href: string };

type ButtonProps = ButtonAsButton | ButtonAsLink;

/**
 * Botón polimórfico. Si recibe `href` renderiza un <Link> (navegación); si no,
 * un <button>. Variantes y estados según agentes/diseno-ui.md §4.1 / §6.
 * `h-13` (52px) se aporta vía clase arbitraria de Tailwind.
 */
export function Button(props: ButtonProps) {
  const { variant = 'primary', size = 'md', fullWidth, className, children } = props;
  const classes = cn(
    base,
    variants[variant],
    sizes[size],
    size === 'lg' && 'h-[52px]',
    fullWidth && 'w-full',
    className
  );

  if ('href' in props && props.href !== undefined) {
    const { href, variant: _v, size: _s, fullWidth: _f, className: _c, children: _ch, ...rest } =
      props;
    return (
      <Link href={href} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  const { variant: _v, size: _s, fullWidth: _f, className: _c, children: _ch, href: _h, ...rest } =
    props as ButtonAsButton;
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
