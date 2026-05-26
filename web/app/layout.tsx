import type { Metadata } from 'next';
import { Archivo, Inter } from 'next/font/google';
import './globals.css';
import { Cabecera } from '@/components/layout/Cabecera';
import { PiePagina } from '@/components/layout/PiePagina';

/**
 * Render dinámico por petición en toda la app. Necesario porque la CSP usa un
 * nonce nuevo por petición (ver middleware.ts): Next solo puede inyectar ese
 * nonce en sus <script> al renderizar en cada petición. Con páginas estáticas el
 * nonce horneado en build no coincide con el de la cabecera → 'strict-dynamic'
 * bloquea TODO el JS y la web no hidrata. La Cabecera (menús + buscador) es
 * interactiva en todas las rutas, así que todas necesitan este nonce.
 */
export const dynamic = 'force-dynamic';

// Titulares: Archivo (carácter industrial). Aplicada a h1–h4 vía globals.css.
const archivo = Archivo({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-archivo',
  weight: ['500', '600', '700', '800'],
});

// Cuerpo: Inter (legibilidad de datos B2B). Es la fuente por defecto (font-sans).
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

// Metadata base — el SEO Specialist amplía por plantilla con generateMetadata()
// (titles, canonical, OG). Ver agentes/seo.md.
export const metadata: Metadata = {
  metadataBase: new URL('https://nunezgil.com'),
  title: {
    default: 'Núñez Gil · Mayorista de hostelería e industrial en Córdoba',
    template: '%s · Núñez Gil',
  },
  description:
    'Mayorista de hostelería e industrial en Córdoba desde 1994. +10.000 referencias en limpieza, celulosa, menaje, maquinaria y consumibles. Envío gratis desde 100 €.',
  applicationName: 'Núñez Gil',
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-ES" className={`${archivo.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-ink-50 font-sans text-ink-800 antialiased">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-brand-700 focus:px-4 focus:py-2 focus:text-white"
        >
          Saltar al contenido
        </a>
        <Cabecera />
        <main id="contenido">{children}</main>
        <PiePagina />
      </body>
    </html>
  );
}
