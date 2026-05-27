'use client';

import { useEffect, useState } from 'react';
import { LS_CESTA, EVENTO_CESTA, type LineaCesta } from '@/lib/solicitud/tipos';

/** Badge con el nº de líneas en la cesta. Se hidrata desde localStorage y reacciona
 *  al evento ng:solicitud:update y a cambios en otras pestañas (evento storage). */
export function ContadorSolicitud() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const leer = () => {
      try {
        const raw = localStorage.getItem(LS_CESTA);
        const lineas: LineaCesta[] = raw ? JSON.parse(raw) : [];
        setCount(Array.isArray(lineas) ? lineas.length : 0);
      } catch {
        setCount(0);
      }
    };
    leer();
    const onUpdate = () => leer();
    const onStorage = (e: StorageEvent) => {
      if (e.key === LS_CESTA) leer();
    };
    window.addEventListener(EVENTO_CESTA, onUpdate);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(EVENTO_CESTA, onUpdate);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  if (count === 0) return null;
  return (
    <span
      aria-label={`${count} ${count === 1 ? 'producto' : 'productos'} en la solicitud`}
      className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-500 px-1 text-[10px] font-bold leading-none text-white"
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}
