// QA visual temporal — captura las 3 páginas con los bugs reportados.
// Uso: node scripts/qa-visual.mjs   (requiere `next start -p 3100` corriendo)
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const BASE = process.env.BASE || 'http://127.0.0.1:3100';
const OUT = 'screenshots';
mkdirSync(OUT, { recursive: true });

const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const targets = [
  { path: '/', name: 'home-ofertas-universos' },
  { path: '/quimica-industrial', name: 'categoria-quimica' },
  { path: '/automocion', name: 'producto-automocion' },
];
const viewports = [
  { id: 'desktop', width: 1280, height: 1400 },
  { id: 'mobile', width: 390, height: 1600 },
];

const browser = await chromium.launch();
let problemas = 0;
try {
  for (const vp of viewports) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    for (const t of targets) {
      const url = BASE + t.path;
      const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      if (!resp || !resp.ok()) { console.log(`❌ ${t.path} → HTTP ${resp ? resp.status() : 'sin respuesta'}`); problemas++; continue; }
      // Imágenes rotas
      const broken = await page.evaluate(() =>
        [...document.querySelectorAll('img')].filter((i) => i.complete && i.naturalWidth === 0).length,
      );
      // ¿Hay scroll horizontal de página (síntoma de desbordes)?
      const overflowX = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
      console.log(`${broken === 0 && !overflowX ? '✅' : '⚠️'} ${vp.id} ${t.path} — imgs rotas: ${broken}, overflowX página: ${overflowX}`);
      if (broken > 0 || overflowX) problemas++;
      const file = `${OUT}/${stamp}_${vp.id}_${t.name}.png`;
      await page.screenshot({ path: file, fullPage: true });
    }
    await ctx.close();
  }
} finally {
  await browser.close();
}
console.log(problemas === 0 ? '\n✅ QA visual sin incidencias automáticas.' : `\n⚠️ ${problemas} incidencia(s) automática(s) — revisar capturas.`);
