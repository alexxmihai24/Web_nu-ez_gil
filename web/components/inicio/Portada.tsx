import { ArrowRight, ShieldCheck } from 'lucide-react';
import type { ProductListItem } from '@/lib/data/types';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { ProductImage } from '@/components/ui/ProductImage';
import { Price } from '@/components/ui/Price';
import { SearchAutosuggest } from '@/components/layout/SearchAutosuggest';

interface PropsPortada {
  /** Productos reales para el mosaico de la derecha (se usan hasta 3 con foto). */
  productosVitrina: ProductListItem[];
}

/**
 * Portada (hero) de alto impacto — Server Component. Columna izquierda: titular en
 * Archivo, propuesta de valor, BUSCADOR protagonista y CTAs. Columna derecha:
 * "vitrina" con fotos de producto reales en composición escalonada (profundidad,
 * sin depender de una foto de almacén que no tenemos). Atmósfera azul tinta + grano.
 */
export function Portada({ productosVitrina }: PropsPortada) {
  const vitrina = productosVitrina.filter((p) => p.imageUrl).slice(0, 3);

  return (
    <section className="atmosfera-tinta grano relative overflow-hidden text-white">
      <Container className="relative grid items-center gap-12 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:py-24">
        {/* Columna de mensaje */}
        <div className="animate-aparecer-arriba">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-2xs font-semibold uppercase tracking-[0.16em] text-accent-200 ring-1 ring-white/15">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            Mayorista profesional · Córdoba · desde 1994
          </p>

          <h1 className="mt-5 text-balance text-4xl font-extrabold leading-[1.04] tracking-tight sm:text-5xl">
            Todo para tu negocio,
            <span className="block text-accent-300">en un solo proveedor</span>
          </h1>

          <p className="mt-5 max-w-xl text-lg leading-relaxed text-brand-100">
            Más de 10.000 referencias en limpieza, celulosa, menaje, cristalería y maquinaria.
            Stock real, trato directo y envío gratis desde 100 € en Córdoba.
          </p>

          {/* Buscador protagonista */}
          <div className="mt-8 max-w-xl">
            <SearchAutosuggest variant="hero" />
            <p className="mt-2 pl-1 text-xs text-brand-200">
              Busca por producto o referencia entre todo el catálogo.
            </p>
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
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

        {/* Vitrina de producto (decorativa, con datos reales) */}
        {vitrina.length > 0 ? (
          <div className="relative hidden lg:block" aria-hidden="true">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4 pt-10">
                {vitrina.slice(0, 1).map((p) => (
                  <FichaVitrina key={p.id} producto={p} />
                ))}
                {vitrina.slice(2, 3).map((p) => (
                  <FichaVitrina key={p.id} producto={p} />
                ))}
              </div>
              <div className="space-y-4">
                {vitrina.slice(1, 2).map((p) => (
                  <FichaVitrina key={p.id} producto={p} destacada />
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </Container>
    </section>
  );
}

/** Mini-ficha flotante para el mosaico de la portada. */
function FichaVitrina({ producto, destacada = false }: { producto: ProductListItem; destacada?: boolean }) {
  return (
    <div className="overflow-hidden rounded-lg bg-white text-ink-800 shadow-lg ring-1 ring-black/5">
      <ProductImage
        src={producto.imageUrl}
        alt=""
        sizes="240px"
        className={destacada ? 'aspect-[4/5]' : 'aspect-square'}
      />
      <div className="p-3.5">
        {producto.brandName ? (
          <p className="truncate text-2xs font-semibold uppercase tracking-wide text-ink-400">
            {producto.brandName}
          </p>
        ) : null}
        <p className="mt-0.5 line-clamp-1 text-sm font-semibold text-ink-900">{producto.name}</p>
        <div className="mt-1.5">
          <Price cents={producto.priceCents} size="md" />
        </div>
      </div>
    </div>
  );
}
