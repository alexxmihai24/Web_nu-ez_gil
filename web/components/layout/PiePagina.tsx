import Link from 'next/link';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { MarcaNG } from '@/components/ui/MarcaNG';

/**
 * Pie definitivo — Server Component. Columnas AYUDA / LEGAL / Contacto + marca.
 * Cierre azul tinta (contraste AAA). Franja institucional inferior CLARA con los
 * logos FEDER / Junta de Andalucía / "Andalucía se mueve con Europa" SIN recolorear
 * (condición de la subvención IDEA — OBLIGATORIO mantenerlos).
 */

// Enlaces a páginas que EXISTEN (se corrigieron slugs rotos: condiciones-envio,
// privacidad, cookies). Las páginas de pago/devolución llegarán en Fase 3.
const helpLinks = [
  { href: '/legal/como-comprar', label: 'Cómo comprar' },
  { href: '/legal/condiciones-envio', label: 'Envío y entregas' },
  { href: '/contacto', label: 'Contacto' },
];

const legalLinks = [
  { href: '/legal/aviso-legal', label: 'Aviso legal' },
  { href: '/legal/privacidad', label: 'Política de privacidad' },
  { href: '/legal/cookies', label: 'Política de cookies' },
];

const exploreLinks = [
  { href: '/marcas', label: 'Marcas' },
  { href: '/novedades', label: 'Novedades' },
  { href: '/ofertas', label: 'Ofertas' },
  { href: '/outlet', label: 'Outlet' },
  { href: '/noticias', label: 'Actualidad' },
  { href: '/quienes-somos', label: 'Quiénes somos' },
];

// Logos institucionales (se añaden a /public/logos-institucionales/ en la migración
// de assets). Se sirven en franja BLANCA, sin recolorear. alt descriptivo (a11y).
const INSTITUTIONAL_LOGOS = [
  { src: '/logos-institucionales/union-europea-feder.svg', alt: 'Unión Europea — Fondo Europeo de Desarrollo Regional (FEDER)' },
  { src: '/logos-institucionales/junta-de-andalucia.svg', alt: 'Junta de Andalucía' },
  { src: '/logos-institucionales/andalucia-se-mueve-con-europa.svg', alt: 'Andalucía se mueve con Europa' },
  { src: '/logos-institucionales/agencia-idea.svg', alt: 'Agencia de Innovación y Desarrollo de Andalucía IDEA' },
];

export function PiePagina() {
  return (
    <footer className="mt-20 bg-brand-900 text-ink-100">
      <div className="container-ng grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-12">
        {/* Marca + contacto */}
        <div className="lg:col-span-4">
          <Link href="/" className="flex items-center gap-2" aria-label="Núñez Gil · Inicio">
            <MarcaNG className="h-9 w-9 text-white" />
            <span className="text-xl font-extrabold tracking-tight text-white">
              núñez<span className="text-accent-400">gil</span>
            </span>
          </Link>
          <p className="mt-3 max-w-xs text-sm text-ink-300">
            Mayorista de hostelería e industrial en Córdoba desde 1994. +10.000 referencias en
            limpieza, celulosa, menaje y maquinaria.
          </p>
          <address className="mt-5 space-y-2 text-sm not-italic text-ink-200">
            <p className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent-400" aria-hidden="true" />
              C/ Pilas de Panchía, 2 · 14550 Montilla (Córdoba)
            </p>
            <p className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 shrink-0 text-accent-400" aria-hidden="true" />
              <a href="tel:957655388" className="hover:text-white hover:underline">957 65 53 88</a>
            </p>
            <p className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 shrink-0 text-accent-400" aria-hidden="true" />
              <a href="mailto:info@nunezgil.com" className="hover:text-white hover:underline">
                info@nunezgil.com
              </a>
            </p>
            <p className="flex items-center gap-2.5 text-ink-300">
              <Clock className="h-4 w-4 shrink-0 text-accent-400" aria-hidden="true" />
              L–V 9:00–14:00 y 17:00–20:00
            </p>
          </address>
        </div>

        <FooterColumn title="Explora" links={exploreLinks} className="lg:col-span-3 lg:col-start-6" />
        <FooterColumn title="Ayuda" links={helpLinks} className="lg:col-span-2" />
        <FooterColumn title="Legal" links={legalLinks} className="lg:col-span-2" />
      </div>

      {/* Franja institucional — fondo BLANCO, logos sin recolorear */}
      <div className="bg-white">
        <div className="container-ng flex flex-col items-center gap-4 py-6 text-center">
          <p className="max-w-3xl text-xs leading-relaxed text-ink-600">
            Núñez Gil ha sido beneficiaria del Fondo Europeo de Desarrollo Regional, cuyo objetivo es
            mejorar la competitividad de las pymes, y gracias al cual ha puesto en marcha un plan de
            modernización mediante la implantación tecnológica de la información y comunicación, para
            mejorar su competitividad y productividad. Proyecto cofinanciado por la Unión Europea
            (FEDER), la Junta de Andalucía y la Agencia IDEA.{' '}
            <span className="font-semibold text-ink-700">«Andalucía se mueve con Europa».</span>
          </p>
          <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            {INSTITUTIONAL_LOGOS.map((logo) => (
              <li key={logo.src}>
                {/* Logos oficiales: <img> nativo (sin optimización ni recoloreado).
                    Se sustituyen por los ficheros reales en la migración de assets. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logo.src}
                  alt={logo.alt}
                  height={44}
                  className="h-11 w-auto object-contain"
                  loading="lazy"
                />
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="bg-brand-900 py-4">
        <div className="container-ng flex flex-col items-center justify-between gap-2 text-2xs text-ink-400 sm:flex-row">
          <p>© {new Date().getFullYear()} Núñez Gil Mayorista de Hostelería e Industrial, S.L.</p>
          <p>Precios sin IVA · CIF B-14784235</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
  className,
}: {
  title: string;
  links: { href: string; label: string }[];
  className?: string;
}) {
  return (
    <div className={className}>
      <h2 className="text-2xs font-bold uppercase tracking-[0.12em] text-ink-400">{title}</h2>
      <ul className="mt-4 space-y-2.5 text-sm">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-ink-200 transition-colors hover:text-white hover:underline">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
