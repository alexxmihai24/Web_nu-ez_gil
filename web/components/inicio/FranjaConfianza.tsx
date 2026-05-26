import { CalendarClock, PackageCheck, Truck, Headset } from 'lucide-react';
import { Contenedor } from '@/components/ui/Contenedor';

/**
 * Franja de confianza bajo la portada — 4 argumentos de venta B2B con icono.
 * Fondo blanco elevado sobre la atmósfera del hero (sensación de "tarjeta de datos").
 */
const ARGUMENTOS = [
  { icono: CalendarClock, titulo: '+30 años', detalle: 'Sirviendo a la hostelería de Córdoba desde 1994' },
  { icono: PackageCheck, titulo: '+10.000 referencias', detalle: 'Stock real en exposición de 1.500 m²' },
  { icono: Truck, titulo: 'Envío gratis', detalle: 'En pedidos desde 100 € en nuestra zona' },
  { icono: Headset, titulo: 'Trato directo', detalle: 'Un equipo que conoce tu negocio' },
] as const;

export function FranjaConfianza() {
  return (
    <div className="relative z-10 -mt-8 lg:-mt-10">
      <Contenedor>
        <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-ink-200 shadow-md ring-1 ring-ink-200 lg:grid-cols-4">
          {ARGUMENTOS.map(({ icono: Icono, titulo, detalle }) => (
            <li key={titulo} className="flex items-start gap-3 bg-white p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                <Icono className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-bold text-ink-900">{titulo}</p>
                <p className="mt-0.5 text-xs leading-snug text-ink-500">{detalle}</p>
              </div>
            </li>
          ))}
        </ul>
      </Contenedor>
    </div>
  );
}
