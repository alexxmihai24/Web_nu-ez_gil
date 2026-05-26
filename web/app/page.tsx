import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Headset, Repeat } from 'lucide-react';
import { getFeatured, getDepartments } from '@/lib/data';
import type { Badge, Category, ProductListItem } from '@/lib/data/types';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { ProductCarousel } from '@/components/home/ProductCarousel';
import { Portada } from '@/components/inicio/Portada';
import { FranjaConfianza } from '@/components/inicio/FranjaConfianza';
import { BloqueSeccion } from '@/components/inicio/BloqueSeccion';
import { TarjetaUniverso } from '@/components/inicio/TarjetaUniverso';
import { UNIVERSES } from '@/components/layout/universes';

export const revalidate = 3600; // ISR 1 h

export const metadata: Metadata = {
  title: 'Mayorista de hostelería e industrial en Córdoba',
  description:
    '+10.000 referencias en limpieza, celulosa, menaje, cristalería y maquinaria. Servicio profesional desde 1994 y envío gratis desde 100 € en Córdoba.',
  alternates: { canonical: '/' },
};

async function obtenerDestacadosSeguro(tipo: Badge): Promise<ProductListItem[]> {
  try {
    return await getFeatured(tipo);
  } catch {
    return [];
  }
}

export default async function PaginaInicio() {
  const [novedades, ofertas, outlet, departamentos] = await Promise.all([
    obtenerDestacadosSeguro('novedad'),
    obtenerDestacadosSeguro('oferta'),
    obtenerDestacadosSeguro('outlet'),
    getDepartments().catch(() => [] as Category[]),
  ]);

  // Mapa slug de departamento → foto real (para que los universos NO salgan vacíos).
  const imagenPorSlug = new Map<string, string | null | undefined>(
    departamentos.map((d) => [d.slug, d.imageUrl]),
  );

  // Mosaico de la portada: productos reales con foto.
  const vitrina = [...novedades, ...ofertas, ...outlet].filter((p) => p.imageUrl).slice(0, 3);

  const universos = UNIVERSES.map((u) => {
    const principal = u.departments[0];
    return {
      id: u.id,
      nombre: u.name,
      slug: principal.slug,
      imagenUrl: imagenPorSlug.get(principal.slug) ?? null,
      totalDepartamentos: u.departments.length,
    };
  });

  return (
    <>
      <Portada productosVitrina={vitrina} />
      <FranjaConfianza />

      {/* Universos con foto real */}
      <BloqueSeccion titulo="Explora por universo" antetitulo="Catálogo">
        <ul className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3">
          {universos.map((u, i) => (
            <li key={u.id}>
              <TarjetaUniverso
                nombre={u.nombre}
                slug={u.slug}
                imagenUrl={u.imagenUrl}
                totalDepartamentos={u.totalDepartamentos}
                prioridad={i < 3}
                className="h-full"
              />
            </li>
          ))}
        </ul>
      </BloqueSeccion>

      {novedades.length > 0 ? (
        <BloqueSeccion titulo="Novedades" antetitulo="Recién llegados" tono="tenue" verTodo={{ href: '/novedades' }}>
          <ProductCarousel products={novedades} />
        </BloqueSeccion>
      ) : null}

      {ofertas.length > 0 ? (
        <BloqueSeccion titulo="Ofertas" antetitulo="Precio rebajado" verTodo={{ href: '/ofertas' }}>
          <ProductCarousel products={ofertas} />
        </BloqueSeccion>
      ) : null}

      {outlet.length > 0 ? (
        <BloqueSeccion titulo="Outlet" antetitulo="Últimas unidades" tono="tenue" verTodo={{ href: '/outlet' }}>
          <ProductCarousel products={outlet} />
        </BloqueSeccion>
      ) : null}

      {/* Bloque de confianza "quiénes somos" */}
      <section className="atmosfera-tinta grano relative overflow-hidden text-white">
        <Container className="relative grid items-center gap-10 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <p className="text-2xs font-bold uppercase tracking-[0.16em] text-accent-300">Desde 1994</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-white lg:text-4xl">
              Tu proveedor de confianza en Córdoba
            </h2>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-brand-100">
              Más de 30 años distribuyendo limpieza profesional y hostelería. Una exposición de
              1.500 m², stock real y un equipo cercano que conoce tu negocio.
            </p>
            <ul className="mt-7 grid gap-4 sm:grid-cols-3">
              {[
                { icono: ShieldCheck, texto: 'Stock real y garantía' },
                { icono: Headset, texto: 'Trato directo y cercano' },
                { icono: Repeat, texto: 'Repite pedidos fácilmente' },
              ].map(({ icono: Icono, texto }) => (
                <li key={texto} className="flex items-start gap-2.5 text-sm text-brand-100">
                  <Icono className="mt-0.5 h-5 w-5 shrink-0 text-accent-300" aria-hidden="true" />
                  {texto}
                </li>
              ))}
            </ul>
            <Button href="/quienes-somos" variant="primary" className="mt-8">
              Conócenos
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Button>
          </div>
          <div className="hidden lg:block" aria-hidden="true">
            <div className="grid grid-cols-3 overflow-hidden rounded-xl ring-1 ring-white/10">
              {[
                { cifra: '+30', pie: 'años de experiencia' },
                { cifra: '10k', pie: 'referencias en stock' },
                { cifra: '1.500', pie: 'm² de exposición' },
              ].map((d) => (
                <div key={d.pie} className="bg-white/5 p-6 text-center backdrop-blur-sm">
                  <p className="text-4xl font-extrabold tracking-tight text-white">{d.cifra}</p>
                  <p className="mt-2 text-2xs font-medium uppercase tracking-[0.12em] text-accent-300">
                    {d.pie}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Actualidad (placeholder hasta que entre el blog real) */}
      <BloqueSeccion titulo="Actualidad" antetitulo="Blog" tono="tenue" verTodo={{ href: '/noticias' }}>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <Link
              key={n}
              href="/noticias"
              className="group flex flex-col overflow-hidden rounded-lg border border-ink-200 bg-white transition-shadow hover:shadow-md"
            >
              <div className="aspect-[16/10] bg-gradient-to-br from-brand-100 to-ink-100" aria-hidden="true" />
              <div className="flex flex-1 flex-col p-5">
                <p className="text-2xs font-semibold uppercase tracking-wide text-accent-600">Actualidad</p>
                <h3 className="mt-1.5 text-lg font-semibold text-ink-900 group-hover:text-brand-700">
                  Próximamente: novedades y consejos para tu negocio
                </h3>
                <p className="mt-2 line-clamp-2 text-sm text-ink-500">
                  Estamos preparando contenido útil sobre limpieza profesional, hostelería y ahorro
                  para tu establecimiento.
                </p>
              </div>
            </Link>
          ))}
        </div>
      </BloqueSeccion>
    </>
  );
}
