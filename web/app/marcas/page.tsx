import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getBrands } from '@/lib/data';
import type { Brand } from '@/lib/data/types';
import { Container } from '@/components/ui/Container';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Heading } from '@/components/ui/Heading';
import { EmptyState } from '@/components/ui/EmptyState';
import { BrandMark } from '@/components/ui/BrandMark';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Marcas',
  description:
    'Trabajamos con las principales marcas de limpieza profesional, hostelería e industrial. Encuentra tus marcas de confianza en Núñez Gil.',
  alternates: { canonical: '/marcas' },
};

export default async function BrandsPage() {
  const brands: Brand[] = await getBrands().catch((): Brand[] => []);

  // Agrupación alfabética para facilitar el escaneo de un índice largo.
  const groups = new Map<string, Brand[]>();
  for (const brand of brands) {
    const letter = (brand.name[0] ?? '#').toUpperCase();
    const key = /[A-ZÑ]/.test(letter) ? letter : '#';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(brand);
  }
  const sortedKeys = Array.from(groups.keys()).sort((a, b) => a.localeCompare(b, 'es'));

  return (
    <Container className="py-6 lg:py-8">
      <Breadcrumbs items={[{ name: 'Marcas' }]} />
      <Heading level={1} size="3xl" className="mt-4">
        Marcas
      </Heading>
      <p className="mt-2 max-w-prose text-ink-600">
        Distribuimos las principales marcas del sector de la limpieza profesional, la hostelería y
        la industria. Explora por marca y solicita lo que necesites.
      </p>

      {brands.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="Pronto añadiremos el listado de marcas"
            description="Estamos preparando el índice completo de marcas con las que trabajamos."
            action={{ label: 'Ver catálogo', href: '/quimica-industrial' }}
          />
        </div>
      ) : (
        <div className="mt-8 space-y-10">
          {sortedKeys.map((key) => (
            <section key={key} aria-labelledby={`marca-${key}`}>
              <Heading level={2} size="lg" id={`marca-${key}`} className="border-b border-ink-200 pb-2">
                {key}
              </Heading>
              <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {groups.get(key)!.map((brand) => (
                  <li key={brand.id}>
                    <Link
                      href={`/marcas/${brand.slug}`}
                      className="group flex aspect-[3/2] flex-col items-center justify-center gap-2 rounded-md border border-ink-200 bg-white p-3 transition-colors hover:border-brand-200 hover:shadow-sm"
                    >
                      {brand.logoUrl ? (
                        <span className="relative h-10 w-full">
                          <Image
                            src={brand.logoUrl}
                            alt={brand.name}
                            fill
                            sizes="(max-width:640px) 50vw, (max-width:1024px) 25vw, 160px"
                            className="object-contain"
                          />
                        </span>
                      ) : (
                        <BrandMark className="h-8 w-8 text-ink-300" title={brand.name} />
                      )}
                      <span className="line-clamp-1 text-center text-xs font-medium text-ink-600 group-hover:text-brand-700">
                        {brand.name}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </Container>
  );
}
