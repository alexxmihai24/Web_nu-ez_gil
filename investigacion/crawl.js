// Crawl de investigación de nunezgil.com — captura contenido, metadatos, imágenes y screenshots.
// Reutiliza el playwright instalado en Proyecto_Marketing.
const PW = 'C:/Users/Alex/Documents/Trabajos_clientes/Proyecto_Marketing/node_modules/playwright';
const { chromium } = require(PW);
const fs = require('fs');
const path = require('path');

const OUT = __dirname;
const SHOTS = path.join(OUT, 'screenshots');
const DATA = path.join(OUT, 'data');
for (const d of [SHOTS, DATA]) fs.mkdirSync(d, { recursive: true });

const ts = () => new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');

const TARGETS = [
  ['home', 'https://nunezgil.com/'],
  ['quienes-somos', 'https://nunezgil.com/quienes-somos'],
  ['contacto', 'https://nunezgil.com/contacto'],
  ['categoria-quimica-industrial', 'https://nunezgil.com/quimica-industrial'],
  ['categoria-ambientadores', 'https://nunezgil.com/ambientadores-e-insecticidas'],
  ['subcategoria-insecticidas', 'https://nunezgil.com/ambientadores-e-insecticidas/insecticidas'],
  ['marcas', 'https://nunezgil.com/marcas'],
  ['noticias', 'https://nunezgil.com/noticias'],
  ['acceso-login', 'https://nunezgil.com/acceso'],
  ['carrito', 'https://nunezgil.com/carrito'],
  ['producto-vaso', 'https://nunezgil.com/vaso-refresco-31-cl-spain-quartz-c6-5912'],
];

async function analyze(page, url) {
  return await page.evaluate(() => {
    const q = (s) => document.querySelector(s);
    const qa = (s) => Array.from(document.querySelectorAll(s));
    const meta = (n) => { const e = document.querySelector(`meta[name="${n}"]`); return e ? e.content : null; };
    const og = (p) => { const e = document.querySelector(`meta[property="${p}"]`); return e ? e.content : null; };
    const imgs = qa('img').map(i => ({ src: i.currentSrc || i.src, alt: i.alt || '', w: i.naturalWidth, h: i.naturalHeight, loading: i.loading || '' }));
    return {
      title: document.title,
      lang: document.documentElement.lang || null,
      charset: document.characterSet,
      metaDescription: meta('description'),
      metaKeywords: meta('keywords'),
      metaViewport: meta('viewport'),
      metaRobots: meta('robots'),
      canonical: (q('link[rel="canonical"]') || {}).href || null,
      ogTitle: og('og:title'), ogDescription: og('og:description'), ogImage: og('og:image'),
      h1: qa('h1').map(e => e.textContent.trim()).filter(Boolean),
      h2: qa('h2').map(e => e.textContent.trim()).filter(Boolean).slice(0, 25),
      h3: qa('h3').map(e => e.textContent.trim()).filter(Boolean).slice(0, 25),
      headingCounts: { h1: qa('h1').length, h2: qa('h2').length, h3: qa('h3').length },
      imgCount: imgs.length,
      imgWithoutAlt: imgs.filter(i => !i.alt).length,
      images: imgs.slice(0, 60),
      links: qa('a[href]').length,
      scripts: qa('script[src]').map(s => s.src),
      scriptsInline: qa('script:not([src])').length,
      stylesheets: qa('link[rel="stylesheet"]').map(l => l.href),
      forms: qa('form').map(f => ({ action: f.action, method: f.method, inputs: Array.from(f.querySelectorAll('input,textarea,select')).map(i => ({ type: i.type || i.tagName.toLowerCase(), name: i.name, autocomplete: i.autocomplete })) })),
      hasPasswordField: !!q('input[type="password"]'),
      jquery: typeof window.jQuery !== 'undefined' ? (window.jQuery.fn ? window.jQuery.fn.jquery : 'present') : null,
      bodyTextSnippet: (document.body.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 1500),
      footerText: (q('footer') ? q('footer').innerText : '').replace(/\s+/g, ' ').trim().slice(0, 800),
      generator: meta('generator'),
    };
  });
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const report = { crawledAt: new Date().toISOString(), site: 'https://nunezgil.com', pages: [] };
  try {
    for (const [name, url] of TARGETS) {
      const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 }, userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36' });
      const page = await ctx.newPage();
      const reqs = []; const consoleErrors = []; let mixedContent = 0;
      page.on('response', r => { reqs.push({ url: r.url(), status: r.status(), type: r.request().resourceType() }); if (r.url().startsWith('http://')) mixedContent++; });
      page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 200)); });
      page.on('pageerror', e => consoleErrors.push('PAGEERROR: ' + String(e).slice(0, 200)));
      const entry = { name, url };
      const t0 = Date.now();
      try {
        const resp = await page.goto(url, { waitUntil: 'load', timeout: 45000 });
        entry.httpStatus = resp ? resp.status() : null;
        entry.finalUrl = page.url();
        entry.securityHeaders = resp ? resp.headers() : {};
        await page.waitForTimeout(1500);
        entry.loadMs = Date.now() - t0;
        entry.analysis = await analyze(page, url);
        entry.requestCount = reqs.length;
        entry.requestsByType = reqs.reduce((a, r) => { a[r.type] = (a[r.type] || 0) + 1; return a; }, {});
        entry.failedRequests = reqs.filter(r => r.status >= 400).map(r => ({ url: r.url, status: r.status })).slice(0, 20);
        entry.mixedContentRequests = mixedContent;
        entry.consoleErrors = consoleErrors.slice(0, 15);
        await page.screenshot({ path: path.join(SHOTS, `${ts()}_${name}_desktop.png`), fullPage: true });
        if (name === 'home') {
          await page.setViewportSize({ width: 390, height: 844 });
          await page.waitForTimeout(800);
          await page.screenshot({ path: path.join(SHOTS, `${ts()}_${name}_mobile.png`), fullPage: true });
        }
        console.log(`OK  ${name}  status=${entry.httpStatus}  ${entry.loadMs}ms  imgs=${entry.analysis.imgCount}  reqs=${entry.requestCount}`);
      } catch (e) {
        entry.error = String(e).slice(0, 300);
        console.log(`ERR ${name}: ${entry.error}`);
      } finally {
        report.pages.push(entry);
        await ctx.close();
      }
    }
  } finally {
    await browser.close();
  }
  fs.writeFileSync(path.join(DATA, 'crawl-report.json'), JSON.stringify(report, null, 2));
  console.log('\\nReporte guardado en data/crawl-report.json');
})();
