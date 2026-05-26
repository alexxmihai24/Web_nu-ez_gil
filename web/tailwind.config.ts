import type { Config } from 'tailwindcss';

/**
 * Tokens de marca Núñez Gil — fuente de verdad en agentes/diseno-ui.md.
 * Los valores viven como CSS vars en app/globals.css (permite theming futuro);
 * aquí se referencian con var() para que Tailwind genere las utilidades.
 *  - brand  = azul Núñez Gil (navegación, identidad)
 *  - accent = teal (CTA "Añadir a la solicitud")
 *  - ink    = neutros gris azulado (texto, bordes, superficies)
 */
const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: 'var(--ng-blue-50)',
          100: 'var(--ng-blue-100)',
          200: 'var(--ng-blue-200)',
          300: 'var(--ng-blue-300)',
          400: 'var(--ng-blue-400)',
          500: 'var(--ng-blue-500)',
          600: 'var(--ng-blue-600)',
          700: 'var(--ng-blue-700)',
          800: 'var(--ng-blue-800)',
          900: 'var(--ng-blue-900)',
        },
        accent: {
          50: 'var(--ng-teal-50)',
          100: 'var(--ng-teal-100)',
          200: 'var(--ng-teal-200)',
          300: 'var(--ng-teal-300)',
          400: 'var(--ng-teal-400)',
          500: 'var(--ng-teal-500)',
          600: 'var(--ng-teal-600)',
          700: 'var(--ng-teal-700)',
        },
        ink: {
          0: 'var(--ng-gray-0)',
          50: 'var(--ng-gray-50)',
          100: 'var(--ng-gray-100)',
          200: 'var(--ng-gray-200)',
          300: 'var(--ng-gray-300)',
          400: 'var(--ng-gray-400)',
          500: 'var(--ng-gray-500)',
          600: 'var(--ng-gray-600)',
          700: 'var(--ng-gray-700)',
          800: 'var(--ng-gray-800)',
          900: 'var(--ng-gray-900)',
        },
        success: { DEFAULT: 'var(--ng-success)', bg: 'var(--ng-success-bg)' },
        warning: { DEFAULT: 'var(--ng-warning)', bg: 'var(--ng-warning-bg)' },
        error: { DEFAULT: 'var(--ng-error)', bg: 'var(--ng-error-bg)' },
        badge: {
          novedad: 'var(--ng-badge-novedad)',
          oferta: 'var(--ng-badge-oferta)',
          outlet: 'var(--ng-badge-outlet)',
        },
      },
      fontFamily: {
        // Cuerpo: Inter (legibilidad de datos B2B). Titulares: Archivo (carácter
        // "almacén profesional", industrial). Los h1–h4 usan `display` vía globals.css.
        sans: ['var(--font-inter)', 'system-ui', 'Segoe UI', 'sans-serif'],
        display: ['var(--font-archivo)', 'system-ui', 'Segoe UI', 'sans-serif'],
      },
      // Capas de apilamiento (antes se usaban clases inexistentes z-sticky-header /
      // z-megamenu / z-drawer → Tailwind las descartaba y el menú/buscador se
      // montaban sobre las tarjetas. Definidas aquí como tokens reales).
      zIndex: {
        'sticky-header': '40',
        megamenu: '50',
        autosuggest: '55',
        'drawer-overlay': '60',
        drawer: '70',
        modal: '80',
      },
      keyframes: {
        'aparecer-arriba': {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        aparecer: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'aparecer-arriba': 'aparecer-arriba 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
        aparecer: 'aparecer 0.5s ease both',
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1.3' }],
        xs: ['0.75rem', { lineHeight: '1.4' }],
        sm: ['0.875rem', { lineHeight: '1.5' }],
        base: ['1rem', { lineHeight: '1.55' }],
        lg: ['1.125rem', { lineHeight: '1.45' }],
        xl: ['1.375rem', { lineHeight: '1.35' }],
        '2xl': ['1.625rem', { lineHeight: '1.3' }],
        '3xl': ['1.9375rem', { lineHeight: '1.2' }],
        '4xl': ['2.3125rem', { lineHeight: '1.1' }],
        '5xl': ['2.875rem', { lineHeight: '1.05' }],
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '16px',
      },
      boxShadow: {
        xs: '0 1px 2px rgb(15 26 56 / 0.06)',
        sm: '0 1px 3px rgb(15 26 56 / 0.08), 0 1px 2px rgb(15 26 56 / 0.04)',
        md: '0 4px 12px rgb(15 26 56 / 0.10)',
        lg: '0 12px 28px rgb(15 26 56 / 0.14)',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      maxWidth: {
        container: '1280px',
      },
    },
  },
  plugins: [],
};

export default config;
