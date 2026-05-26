'use client';

import { useState } from 'react';
import { SelectorCantidad } from './SelectorCantidad';
import { BotonAnadirSolicitud } from './BotonAnadirSolicitud';
import type { Availability } from '@/lib/data/types';

interface ProductBuyBoxProps {
  productId: string;
  productSlug: string;
  name: string;
  availability: Availability;
}

/**
 * Bloque de acción de la ficha (PDP) — Client island. Stepper de cantidad + CTA
 * "Añadir a la solicitud" (la cantidad elegida se pasa al CTA). Ver wireframe ux §7.3.
 */
export function CajaCompra({ productId, productSlug, name, availability }: ProductBuyBoxProps) {
  const [qty, setQty] = useState(1);
  const isAvailable = availability !== 'out_of_stock';

  return (
    <div className="flex flex-wrap items-stretch gap-3">
      {isAvailable ? (
        <SelectorCantidad value={qty} onChange={setQty} />
      ) : null}
      <div className="min-w-[220px] flex-1">
        <BotonAnadirSolicitud
          productId={productId}
          productSlug={productSlug}
          name={name}
          availability={availability}
          quantity={qty}
          size="lg"
        />
      </div>
    </div>
  );
}
