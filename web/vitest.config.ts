import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

// Tests unitarios de lógica pura (validación, helpers). Entorno node (sin DOM):
// no probamos componentes React aquí — eso lo cubre el e2e de Playwright.
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    include: ['lib/**/*.test.ts'],
  },
});
