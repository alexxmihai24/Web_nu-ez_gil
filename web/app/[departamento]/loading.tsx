import { Contenedor } from '@/components/ui/Contenedor';
import { Esqueleto, ProductCardSkeleton } from '@/components/ui/Esqueleto';

/** Esqueleto de listado de catálogo → respuesta percibida inmediata (frontend.md §3.4). */
export default function Loading() {
  return (
    <Contenedor className="py-6 lg:py-8">
      <Esqueleto className="h-4 w-64" />
      <Esqueleto className="mt-4 h-9 w-72" />
      <div className="mt-6 grid gap-8 lg:grid-cols-[260px_1fr]">
        <Esqueleto className="hidden h-96 w-full rounded-lg lg:block" />
        <div>
          <Esqueleto className="h-10 w-full" />
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </Contenedor>
  );
}
