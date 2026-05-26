/**
 * Codemod: renombra a español los componentes y sus imports (app/ + components/).
 * Excepción: el componente UI `Badge` se mantiene (choca con el TIPO de datos `Badge`).
 * Red de seguridad: todo está commiteado → `git checkout .` revierte si algo falla.
 */
import { readdirSync, readFileSync, writeFileSync, renameSync, existsSync, rmSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();

// Pares ordenados (los más largos / con prefijos compartidos van primero).
const symbolMap = [
  ['UniverseDepartment', 'DepartamentoUniverso'],
  ['AvailabilityBadge', 'InsigniaDisponibilidad'],
  ['ImageFallback', 'ImagenRespaldo'],
  ['ProductCarousel', 'Carrusel'],
  ['ProductImage', 'ImagenProducto'],
  ['ProductGallery', 'GaleriaProducto'],
  ['ProductBuyBox', 'CajaCompra'],
  ['ProductGrid', 'RejillaProductos'],
  ['ProductCard', 'TarjetaProducto'],
  ['AddToRequestButton', 'BotonAnadirSolicitud'],
  ['QuantityStepper', 'SelectorCantidad'],
  ['CategoryCard', 'TarjetaCategoria'],
  ['CatalogShell', 'MarcoCatalogo'],
  ['DepartmentSidebar', 'BarraDepartamentos'],
  ['SearchAutosuggest', 'BuscadorSugerencias'],
  ['SiteHeader', 'Cabecera'],
  ['SiteFooter', 'PiePagina'],
  ['MegaMenu', 'MenuMega'],
  ['MobileNav', 'NavegacionMovil'],
  ['Breadcrumbs', 'MigasDePan'],
  ['EmptyState', 'EstadoVacio'],
  ['Pagination', 'Paginacion'],
  ['Container', 'Contenedor'],
  ['Heading', 'Titulo'],
  ['Toolbar', 'BarraHerramientas'],
  ['Skeleton', 'Esqueleto'],
  ['BrandMark', 'MarcaNG'],
  ['Button', 'Boton'],
  ['Price', 'Precio'],
  ['Crumb', 'Miga'],
  ['UNIVERSES', 'UNIVERSOS'],
  ['Universe', 'Universo'],
];

const fileRenames = [
  ['components/ui/Button.tsx', 'components/ui/Boton.tsx'],
  ['components/ui/Container.tsx', 'components/ui/Contenedor.tsx'],
  ['components/ui/Heading.tsx', 'components/ui/Titulo.tsx'],
  ['components/ui/Price.tsx', 'components/ui/Precio.tsx'],
  ['components/ui/Breadcrumbs.tsx', 'components/ui/MigasDePan.tsx'],
  ['components/ui/EmptyState.tsx', 'components/ui/EstadoVacio.tsx'],
  ['components/ui/Pagination.tsx', 'components/ui/Paginacion.tsx'],
  ['components/ui/Skeleton.tsx', 'components/ui/Esqueleto.tsx'],
  ['components/ui/ProductImage.tsx', 'components/ui/ImagenProducto.tsx'],
  ['components/ui/BrandMark.tsx', 'components/ui/MarcaNG.tsx'],
  ['components/catalog/ProductCard.tsx', 'components/catalog/TarjetaProducto.tsx'],
  ['components/catalog/ProductGrid.tsx', 'components/catalog/RejillaProductos.tsx'],
  ['components/catalog/CategoryCard.tsx', 'components/catalog/TarjetaCategoria.tsx'],
  ['components/catalog/CatalogShell.tsx', 'components/catalog/MarcoCatalogo.tsx'],
  ['components/catalog/DepartmentSidebar.tsx', 'components/catalog/BarraDepartamentos.tsx'],
  ['components/catalog/Toolbar.tsx', 'components/catalog/BarraHerramientas.tsx'],
  ['components/catalog/ProductGallery.tsx', 'components/catalog/GaleriaProducto.tsx'],
  ['components/catalog/ProductBuyBox.tsx', 'components/catalog/CajaCompra.tsx'],
  ['components/catalog/AddToRequestButton.tsx', 'components/catalog/BotonAnadirSolicitud.tsx'],
  ['components/catalog/QuantityStepper.tsx', 'components/catalog/SelectorCantidad.tsx'],
  ['components/layout/SiteHeader.tsx', 'components/layout/Cabecera.tsx'],
  ['components/layout/SiteFooter.tsx', 'components/layout/PiePagina.tsx'],
  ['components/layout/MegaMenu.tsx', 'components/layout/MenuMega.tsx'],
  ['components/layout/MobileNav.tsx', 'components/layout/NavegacionMovil.tsx'],
  ['components/layout/SearchAutosuggest.tsx', 'components/layout/BuscadorSugerencias.tsx'],
  ['components/layout/universes.ts', 'components/layout/universos.ts'],
  ['components/home/ProductCarousel.tsx', 'components/home/Carrusel.tsx'],
];

const orphans = ['components/home/Hero.tsx', 'components/home/Section.tsx', 'components/home/ValueProps.tsx'];

function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (/\.(ts|tsx)$/.test(e.name)) out.push(p);
  }
  return out;
}

const files = ['app', 'components'].flatMap((d) => walk(path.join(root, d)));
let editados = 0;
for (const f of files) {
  let c = readFileSync(f, 'utf8');
  const orig = c;
  for (const [o, n] of symbolMap) c = c.replace(new RegExp(`\\b${o}\\b`, 'g'), n);
  c = c.replaceAll("/universes'", "/universos'").replaceAll('/universes"', '/universos"');
  if (c !== orig) {
    writeFileSync(f, c);
    editados++;
  }
}

let renombrados = 0;
for (const [o, n] of fileRenames) {
  const op = path.join(root, o);
  if (existsSync(op)) {
    renameSync(op, path.join(root, n));
    renombrados++;
  }
}

let borrados = 0;
for (const orph of orphans) {
  const p = path.join(root, orph);
  if (existsSync(p)) {
    rmSync(p);
    borrados++;
  }
}

console.log(`editados:${editados} renombrados:${renombrados} huérfanos_borrados:${borrados}`);
