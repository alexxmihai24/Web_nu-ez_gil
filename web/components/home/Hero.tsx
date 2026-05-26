import { ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { SearchAutosuggest } from '@/components/layout/SearchAutosuggest';

/**
 * Hero de confianza (no slider mudo) — Server Component. Mensaje + propuesta de valor
 * + BUSCADOR protagonista + CTA. Fondo azul tinta a la izquierda; composición de marca
 * a la derecha (sin imagen remota → cero dependencia/CLS). Ver diseno-ui.md §4.5.
 * El H1 de la home vive aquí.
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden bg-brand-700 text-white">
      {/* Textura tinta muy sutil */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-700 via-brand-800 to-brand-900"
        aria-hidden="true"
      />
      <Container className="relative grid items-center gap-10 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
        <div>
          <p className="text-2xs font-semibold uppercase tracking-[0.16em] text-accent-300">
            Mayorista de hostelería e industrial · Córdoba
          </p>
          <h1 className="mt-3 text-balance text-3xl font-extrabold leading-[1.08] tracking-tight sm:text-4xl lg:text-5xl">
            Todo para tu negocio,
            <br />
            en un solo proveedor desde 1994
          </h1>
          <p className="mt-5 max-w-xl text-lg text-brand-100">
            +10.000 referencias en limpieza, celulosa, menaje, cristalería y maquinaria.
            Servicio profesional y envío gratis desde 100 € en Córdoba.
          </p>

          <div className="mt-7 max-w-xl">
            <SearchAutosuggest variant="hero" />
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Button href="/quimica-industrial" variant="primary" size="lg">
              Ver catálogo
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Button>
            <Button
              href="/contacto"
              size="lg"
              variant="ghost"
              className="border border-white/30 text-white hover:bg-white/10"
            >
              Solicitar presupuesto
            </Button>
          </div>
        </div>

        {/* Composición de marca (decorativa, sin red) */}
        <div className="hidden lg:block" aria-hidden="true">
          <div className="relative aspect-[4/3] rounded-lg bg-white/5 ring-1 ring-white/10 backdrop-blur-sm">
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-3 p-6">
              {[...Array(9)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-md bg-gradient-to-br from-white/10 to-white/0 ring-1 ring-white/5"
                />
              ))}
            </div>
            <div className="absolute bottom-5 left-5 rounded-md bg-white px-4 py-3 text-brand-900 shadow-lg">
              <p className="text-2xl font-extrabold tracking-tight">
                núñez<span className="text-accent-500">gil</span>
              </p>
              <p className="text-xs font-medium text-ink-500">Almacén profesional · 1.500 m²</p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
