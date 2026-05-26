/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // No filtrar la versión del framework en cabeceras (defensa en profundidad — ver agentes/seguridad.md)
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    // Allowlist explícita de orígenes de imagen (anti-SSRF). El agente de Backend
    // añadirá aquí el host del CDN definitivo (Vercel Blob / R2) tras la migración de fotos.
    remotePatterns: [
      { protocol: 'https', hostname: 'workcrm.com' },
    ],
  },
  // Las cabeceras de seguridad y la CSP por nonce las gestiona middleware.ts (Security Engineer).
};

export default nextConfig;
