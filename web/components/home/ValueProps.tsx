import { Clock, PackageCheck, Truck, Building2 } from 'lucide-react';
import { Container } from '@/components/ui/Container';

/**
 * Tira de garantías de confianza — Server Component. 4 ítems con icono lineal.
 * Refuerza confianza inmediata bajo el hero. Ver diseno-ui.md §4.5.
 */
const PROPS = [
  { icon: Clock, label: '+30 años de experiencia', sub: 'Distribuidores desde 1994' },
  { icon: PackageCheck, label: '+10.000 referencias', sub: 'En constante actualización' },
  { icon: Truck, label: 'Envío gratis desde 100 €', sub: 'En la provincia de Córdoba' },
  { icon: Building2, label: 'Exposición de 1.500 m²', sub: 'Visítanos en Montilla' },
];

export function ValueProps() {
  return (
    <section aria-label="Por qué elegirnos" className="border-b border-ink-200 bg-white">
      <Container className="grid gap-x-6 gap-y-5 py-8 sm:grid-cols-2 lg:grid-cols-4">
        {PROPS.map(({ icon: Icon, label, sub }) => (
          <div key={label} className="flex items-center gap-3.5">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-600">
              <Icon className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <p className="font-bold leading-tight text-ink-900">{label}</p>
              <p className="text-sm text-ink-500">{sub}</p>
            </div>
          </div>
        ))}
      </Container>
    </section>
  );
}
