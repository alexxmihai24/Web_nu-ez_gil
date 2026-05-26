'use client';

import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
  label?: string;
}

/** Stepper de cantidad accesible — Client island. Botones +/- ≥44px (touch AA). */
export function SelectorCantidad({
  value,
  onChange,
  min = 1,
  max = 999,
  className,
  label = 'Cantidad',
}: QuantityStepperProps) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n));

  return (
    <div className={cn('inline-flex items-center rounded-md border border-ink-300 bg-white', className)}>
      <button
        type="button"
        onClick={() => onChange(clamp(value - 1))}
        disabled={value <= min}
        aria-label="Disminuir cantidad"
        className="inline-flex h-11 w-11 items-center justify-center rounded-l-md text-ink-700 transition-colors hover:bg-ink-100 disabled:opacity-40"
      >
        <Minus className="h-4 w-4" />
      </button>
      <input
        type="number"
        inputMode="numeric"
        aria-label={label}
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(clamp(Number(e.target.value) || min))}
        className="tabular h-11 w-12 border-x border-ink-200 text-center text-base font-semibold text-ink-900 outline-none focus:bg-brand-50 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button
        type="button"
        onClick={() => onChange(clamp(value + 1))}
        disabled={value >= max}
        aria-label="Aumentar cantidad"
        className="inline-flex h-11 w-11 items-center justify-center rounded-r-md text-ink-700 transition-colors hover:bg-ink-100 disabled:opacity-40"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
