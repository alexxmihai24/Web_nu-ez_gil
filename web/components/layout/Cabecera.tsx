import Link from 'next/link';
import { Phone, Mail, User, ClipboardList, Tag, Truck } from 'lucide-react';
import { MarcaNG } from '@/components/ui/MarcaNG';
import { MenuMega } from './MenuMega';
import { NavegacionMovil } from './NavegacionMovil';
import { BuscadorSugerencias } from './BuscadorSugerencias';
import { ContadorSolicitud } from './ContadorSolicitud';

/**
 * Cabecera definitiva — Server Component que compone las islas Client (MenuMega,
 * NavegacionMovil, BuscadorSugerencias). 3 capas: topbar utility · barra principal con
 * BUSCADOR PROTAGONISTA · nav de departamentos con mega-menú accesible.
 * Sticky. Ver diseno-ui.md §4.4 y ux-arquitectura.md §2.
 */

// Atajos de primer nivel (universos más usados) junto al disparador "Catálogo".
const NAV_SHORTCUTS = [
  { name: 'Limpieza', slug: 'quimica-industrial' },
  { name: 'Mesa y sala', slug: 'en-la-mesa' },
  { name: 'Cocina', slug: 'en-la-cocina' },
  { name: 'Consumibles', slug: 'consumibles-y-un-solo-uso' },
  { name: 'Sanidad', slug: 'sanidad-salud-y-proteccion' },
];

export function Cabecera() {
  return (
    <header className="sticky top-0 z-sticky-header bg-white shadow-sm">
      {/* Topbar utility */}
      <div className="bg-brand-900 text-white">
        <div className="container-ng flex h-9 items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <a href="tel:957655388" className="flex items-center gap-1.5 hover:underline">
              <Phone className="h-3.5 w-3.5" aria-hidden="true" /> 957 65 53 88
            </a>
            <a
              href="mailto:info@nunezgil.com"
              className="hidden items-center gap-1.5 hover:underline sm:flex"
            >
              <Mail className="h-3.5 w-3.5" aria-hidden="true" /> info@nunezgil.com
            </a>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden items-center gap-1.5 text-brand-100 md:flex">
              <Truck className="h-3.5 w-3.5" aria-hidden="true" /> Envío gratis desde 100 €
            </span>
            <Link href="/quienes-somos" className="hidden hover:underline sm:inline">
              Quiénes somos
            </Link>
            <Link href="/contacto" className="hover:underline">
              Contacto
            </Link>
          </div>
        </div>
      </div>

      {/* Barra principal: logo + buscador protagonista + accesos */}
      <div className="border-b border-ink-100">
        <div className="container-ng flex h-[72px] items-center gap-3 md:gap-6">
          <NavegacionMovil />

          <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="Núñez Gil · Inicio">
            <MarcaNG className="h-9 w-9 text-brand-700" />
            <span className="text-xl font-extrabold leading-none tracking-tight text-brand-700">
              núñez<span className="text-accent-500">gil</span>
            </span>
          </Link>

          {/* Buscador protagonista (oculto en móvil; vive a fila propia abajo) */}
          <div className="hidden flex-1 md:block">
            <BuscadorSugerencias />
          </div>

          <nav aria-label="Accesos" className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/marcas"
              className="hidden flex-col items-center rounded-md px-2 py-1 text-2xs font-medium text-ink-600 hover:bg-ink-100 hover:text-brand-700 sm:flex"
            >
              <Tag className="h-5 w-5" aria-hidden="true" />
              Marcas
            </Link>
            <Link
              href="/acceso"
              className="flex flex-col items-center rounded-md px-2 py-1 text-2xs font-medium text-ink-600 hover:bg-ink-100 hover:text-brand-700"
            >
              <User className="h-5 w-5" aria-hidden="true" />
              <span className="hidden sm:inline">Acceder</span>
            </Link>
            <Link
              href="/solicitud"
              className="relative flex flex-col items-center rounded-md px-2 py-1 text-2xs font-medium text-ink-600 hover:bg-ink-100 hover:text-brand-700"
            >
              <span className="relative">
                <ClipboardList className="h-5 w-5" aria-hidden="true" />
                <ContadorSolicitud />
              </span>
              <span className="hidden sm:inline">Solicitud</span>
            </Link>
          </nav>
        </div>

        {/* Buscador a fila propia en móvil */}
        <div className="container-ng pb-3 md:hidden">
          <BuscadorSugerencias />
        </div>
      </div>

      {/* Nav de departamentos (desktop) */}
      <div className="hidden bg-brand-700 lg:block">
        <div className="container-ng">
          <nav aria-label="Principal" className="flex items-center gap-1">
            <MenuMega />
            <ul className="flex items-center">
              {NAV_SHORTCUTS.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/${s.slug}`}
                    className="inline-flex h-11 items-center rounded-md px-3 text-sm font-medium text-brand-100 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
            <span className="mx-1 h-5 w-px bg-white/20" aria-hidden="true" />
            <ul className="flex items-center">
              <li>
                <Link
                  href="/ofertas"
                  className="inline-flex h-11 items-center gap-1.5 rounded-md px-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
                >
                  <span className="h-2 w-2 rounded-full bg-badge-oferta" aria-hidden="true" />
                  Ofertas
                </Link>
              </li>
              <li>
                <Link
                  href="/outlet"
                  className="inline-flex h-11 items-center rounded-md px-3 text-sm font-medium text-brand-100 transition-colors hover:bg-white/10 hover:text-white"
                >
                  Outlet
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}
