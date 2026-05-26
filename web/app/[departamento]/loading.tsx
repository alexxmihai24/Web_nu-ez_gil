import { Container } from '@/components/ui/Container';
import { Skeleton, ProductCardSkeleton } from '@/components/ui/Skeleton';

/** Skeleton de listado de catálogo → respuesta percibida inmediata (frontend.md §3.4). */
export default function Loading() {
  return (
    <Container className="py-6 lg:py-8">
      <Skeleton className="h-4 w-64" />
      <Skeleton className="mt-4 h-9 w-72" />
      <div className="mt-6 grid gap-8 lg:grid-cols-[260px_1fr]">
        <Skeleton className="hidden h-96 w-full rounded-lg lg:block" />
        <div>
          <Skeleton className="h-10 w-full" />
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </Container>
  );
}
