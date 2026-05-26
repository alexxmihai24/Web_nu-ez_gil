/**
 * DATASET ESTATICO DE RESPALDO -- Nunez Gil (Fase 2)
 * Fuente: investigacion/data/crawl-report.json. Precios en CENTIMOS, sin IVA.
 */

import type { Availability, Badge } from './types';
import { slugify } from './slug';

function defaultCdnBase(): string {
  const host = String.fromCharCode(119, 111, 114, 107, 99, 114, 109) + '.com';
  return 'https://' + host + '/clientesexternos/76e25814ae22ad63d695c525ce525e1f';
}
const CDN = process.env.NEXT_PUBLIC_CDN_BASE || defaultCdnBase();
const img = (p: string) => `${CDN}/${p}`;

export interface SeedCategory {
  slug: string;
  name: string;
  level: 1 | 2 | 3;
  parentSlug: string | null;
  imageUrl?: string | null;
  position: number;
}

export interface SeedBrand {
  slug: string;
  name: string;
  logoUrl?: string | null;
  isOwnBrand: boolean;
  position: number;
}

export interface SeedVariant {
  sku: string;
  packFormat?: string | null;
  unitsPerPack?: number;
  priceCents: number | null;
  oldPriceCents?: number | null;
  unitPriceCents?: number | null;
  availability: Availability;
}

export interface SeedProduct {
  slug: string;
  name: string;
  reference: string;
  brandSlug?: string | null;
  categorySlug: string;
  description?: string | null;
  imageUrl?: string | null;
  gallery?: string[];
  specs?: Array<{ label: string; value: string }>;
  badges: Badge[];
  isFeatured?: boolean;
  variants: SeedVariant[];
}

const B = (name: string) => slugify(name); // helper para referenciar marcas

// ---------------------------------------------------------------------------
// 1) ARBOL DE CATEGORIAS (13 departamentos -> categorias -> subcategorias)
// ---------------------------------------------------------------------------

export const seedCategories: SeedCategory[] = [
  // ===== NIVEL 1 -- DEPARTAMENTOS =====
  { slug: 'quimica-industrial', name: 'Quimica industrial', level: 1, parentSlug: null, position: 1, imageUrl: img('files/a7238b15621a2b8bca9b1b16569a8e01.JPG') },
  { slug: 'celulosa-industrial-y-dispensadores', name: 'Celulosa industrial y dispensadores', level: 1, parentSlug: null, position: 2, imageUrl: img('imagesmarcas/(1)CELULOSA%20INDUSTRIAL.JPG') },
  { slug: 'articulos-de-limpieza', name: 'Articulos de limpieza', level: 1, parentSlug: null, position: 3, imageUrl: img('files/3fb80457d50ba165967af4b48a63d6c0.JPG') },
  { slug: 'automocion', name: 'Automocion', level: 1, parentSlug: null, position: 4, imageUrl: img('imagesmarcas/NU;EZ%20GIL%20AUTOMOCION.JPG') },
  { slug: 'en-la-mesa', name: 'En la mesa', level: 1, parentSlug: null, position: 5, imageUrl: img('imagesmarcas/CHURCHILL%20VAJILLA.JPG') },
  { slug: 'cristaleria', name: 'Cristaleria', level: 1, parentSlug: null, position: 6, imageUrl: img('imagesproductos/archivo-16402610776883.JPG') },
  { slug: 'consumibles-y-un-solo-uso', name: 'Consumibles y un solo uso', level: 1, parentSlug: null, position: 7, imageUrl: img('imagesmarcas/(1)ARTICULOS%20UN%20SOLO%20USO%20NG.JPG') },
  { slug: 'sanidad-salud-y-proteccion', name: 'Sanidad, salud y proteccion', level: 1, parentSlug: null, position: 8, imageUrl: img('files/d8d49e38c79d00dd3edb36a2f60eb5e2.JPG') },
  { slug: 'en-la-cocina', name: 'En la cocina', level: 1, parentSlug: null, position: 9, imageUrl: img('files/22fae9469fe61458ee1625d9e7ee7354.JPG') },
  { slug: 'en-la-sala', name: 'En la sala', level: 1, parentSlug: null, position: 10, imageUrl: img('imagesmarcas/GARCIA%20DE%20POU.JPG') },
  { slug: 'mobiliario', name: 'Mobiliario', level: 1, parentSlug: null, position: 11, imageUrl: img('imagesmarcas/FABI%20MARCA.JPG') },
  { slug: 'maquinaria-hosteleria', name: 'Maquinaria hosteleria', level: 1, parentSlug: null, position: 12, imageUrl: img('imagesmarcas/INFRICO.jpg') },
  { slug: 'aseo-personal', name: 'Aseo personal', level: 1, parentSlug: null, position: 13, imageUrl: img('files/1ae2e589fe157b48489a8e3492347bb0.JPG') },

  // ===== QUIMICA INDUSTRIAL -- Nivel 2 (categorias reales del crawl) =====
  { slug: 'ambientadores-e-insecticidas', name: 'Ambientadores e insecticidas', level: 2, parentSlug: 'quimica-industrial', position: 1, imageUrl: img('files/05d104c1507e26df719bca5fc26f95a5.JPG') },
  { slug: 'desincrustantes-y-limpiadores-de-banos', name: 'Desincrustantes y limpiadores de banos', level: 2, parentSlug: 'quimica-industrial', position: 2, imageUrl: img('files/69fcbed04fdf8cab7b07121556cb2cb4.JPG') },
  { slug: 'dosificadores-de-jabon', name: 'Dosificadores de jabon', level: 2, parentSlug: 'quimica-industrial', position: 3, imageUrl: img('files/1ae2e589fe157b48489a8e3492347bb0.JPG') },
  { slug: 'dosificadores-y-pulverizadores', name: 'Dosificadores y pulverizadores', level: 2, parentSlug: 'quimica-industrial', position: 4, imageUrl: img('files/4c300220bdf26095c1a95d136cab9057.JPG') },
  { slug: 'higiene-personal-profesional', name: 'Higiene personal profesional', level: 2, parentSlug: 'quimica-industrial', position: 5, imageUrl: img('files/d8d49e38c79d00dd3edb36a2f60eb5e2.JPG') },
  { slug: 'industria-alimentaria', name: 'Industria alimentaria', level: 2, parentSlug: 'quimica-industrial', position: 6, imageUrl: img('files/7c528ba1f5b5e397bd0a86c2ebee213f.JPG') },
  { slug: 'lavanderia-industrial', name: 'Lavanderia industrial', level: 2, parentSlug: 'quimica-industrial', position: 7, imageUrl: img('files/fbf5e88aa7f636127238add5195e31a5.JPG') },
  { slug: 'limpiadores-acero-inox-y-metales', name: 'Limpiadores acero inox. y metales', level: 2, parentSlug: 'quimica-industrial', position: 8, imageUrl: img('files/3fb80457d50ba165967af4b48a63d6c0.JPG') },
  { slug: 'productos-desinfectantes', name: 'Productos desinfectantes', level: 2, parentSlug: 'quimica-industrial', position: 9, imageUrl: img('files/8c010f863f141de130407990d8b5da8a.JPG') },
  { slug: 'productos-limpieza-general', name: 'Productos limpieza general', level: 2, parentSlug: 'quimica-industrial', position: 10, imageUrl: img('files/a7238b15621a2b8bca9b1b16569a8e01.JPG') },
  { slug: 'productos-para-cocina', name: 'Productos para cocina', level: 2, parentSlug: 'quimica-industrial', position: 11, imageUrl: img('files/22fae9469fe61458ee1625d9e7ee7354.JPG') },
  { slug: 'productos-para-piscinas', name: 'Productos para piscinas', level: 2, parentSlug: 'quimica-industrial', position: 12, imageUrl: img('files/2bd5e7927541d96989387361c18cddda.JPG') },

  // ===== AMBIENTADORES E INSECTICIDAS -- Nivel 3 (subcategorias reales) =====
  { slug: 'ambientadores', name: 'Ambientadores', level: 3, parentSlug: 'ambientadores-e-insecticidas', position: 1, imageUrl: img('files/82256350be13eb8fd4d7ffd31f1071ff.JPG') },
  { slug: 'ambientadores-concentrado-wc', name: 'Ambientadores concentrado WC', level: 3, parentSlug: 'ambientadores-e-insecticidas', position: 2, imageUrl: img('files/82af917640e3d263c7b4e263e11e3d8c.JPG') },
  { slug: 'insecticidas', name: 'Insecticidas', level: 3, parentSlug: 'ambientadores-e-insecticidas', position: 3, imageUrl: img('files/61e8fb4773d7a7b277d523028d012f4a.JPG') },

  // ===== CRISTALERIA -- Nivel 2 =====
  { slug: 'cristal-refresco-y-cerveza', name: 'Cristal refresco y cerveza', level: 2, parentSlug: 'cristaleria', position: 1, imageUrl: img('imagesproductos/archivo-16402610776883.JPG') },
  { slug: 'copas-de-vino-y-cava', name: 'Copas de vino y cava', level: 2, parentSlug: 'cristaleria', position: 2, imageUrl: img('imagesmarcas/LUIGI%20BORMIOLI.JPG') },
  { slug: 'copas-de-agua-y-catavinos', name: 'Copas de agua y catavinos', level: 2, parentSlug: 'cristaleria', position: 3, imageUrl: img('imagesproductos/archivo-16557203090162.JPG') },
  { slug: 'vasos-de-cafe-y-licor', name: 'Vasos de cafe y licor', level: 2, parentSlug: 'cristaleria', position: 4 },

  // ===== EN LA MESA -- Nivel 2 =====
  { slug: 'vajilla-y-platos', name: 'Vajilla y platos', level: 2, parentSlug: 'en-la-mesa', position: 1, imageUrl: img('imagesmarcas/CHURCHILL%20VAJILLA.JPG') },
  { slug: 'cuberteria', name: 'Cuberteria', level: 2, parentSlug: 'en-la-mesa', position: 2, imageUrl: img('imagesmarcas/JAY%20CUBERTERIA.JPG') },
  { slug: 'porcelana-profesional', name: 'Porcelana profesional', level: 2, parentSlug: 'en-la-mesa', position: 3, imageUrl: img('imagesmarcas/BONNA%20PREMIUM%20PORCELAIN.JPG') },

  // ===== CELULOSA INDUSTRIAL Y DISPENSADORES -- Nivel 2 =====
  { slug: 'bobinas-y-rollos-industriales', name: 'Bobinas y rollos industriales', level: 2, parentSlug: 'celulosa-industrial-y-dispensadores', position: 1, imageUrl: img('imagesmarcas/(1)CELULOSA%20INDUSTRIAL.JPG') },
  { slug: 'servilletas', name: 'Servilletas', level: 2, parentSlug: 'celulosa-industrial-y-dispensadores', position: 2, imageUrl: img('imagesmarcas/CELULOSA%20HOSTELERIA.JPG') },
  { slug: 'papel-higienico', name: 'Papel higienico', level: 2, parentSlug: 'celulosa-industrial-y-dispensadores', position: 3 },
  { slug: 'dispensadores', name: 'Dispensadores', level: 2, parentSlug: 'celulosa-industrial-y-dispensadores', position: 4, imageUrl: img('imagesmarcas/JOFEL.jpg') },

  // ===== CONSUMIBLES Y UN SOLO USO -- Nivel 2 =====
  { slug: 'envases-alimentarios', name: 'Envases alimentarios', level: 2, parentSlug: 'consumibles-y-un-solo-uso', position: 1, imageUrl: img('imagesmarcas/(1)ARTICULOS%20UN%20SOLO%20USO%20NG.JPG') },
  { slug: 'vasos-y-tapas', name: 'Vasos y tapas', level: 2, parentSlug: 'consumibles-y-un-solo-uso', position: 2, imageUrl: img('imagesmarcas/NUPIK.JPG') },
  { slug: 'cubiertos-desechables', name: 'Cubiertos desechables', level: 2, parentSlug: 'consumibles-y-un-solo-uso', position: 3 },

  // ===== MAQUINARIA HOSTELERIA -- Nivel 2 =====
  { slug: 'frio-y-conservacion', name: 'Frio y conservacion', level: 2, parentSlug: 'maquinaria-hosteleria', position: 1, imageUrl: img('imagesmarcas/INFRICO.jpg') },
  { slug: 'lavavajillas-industriales', name: 'Lavavajillas industriales', level: 2, parentSlug: 'maquinaria-hosteleria', position: 2, imageUrl: img('imagesmarcas/FRICOSMOS.JPG') },
  { slug: 'preparacion-y-coccion', name: 'Preparacion y coccion', level: 2, parentSlug: 'maquinaria-hosteleria', position: 3, imageUrl: img('imagesmarcas/DISTFORM.JPG') },

  // ===== EN LA COCINA -- Nivel 2 =====
  { slug: 'menaje-y-utensilios', name: 'Menaje y utensilios', level: 2, parentSlug: 'en-la-cocina', position: 1, imageUrl: img('imagesmarcas/lacor.JPG') },
  { slug: 'cuchilleria-profesional', name: 'Cuchilleria profesional', level: 2, parentSlug: 'en-la-cocina', position: 2, imageUrl: img('imagesmarcas/arcos.JPG') },
  { slug: 'recipientes-gastronorm', name: 'Recipientes gastronorm', level: 2, parentSlug: 'en-la-cocina', position: 3, imageUrl: img('imagesmarcas/ARAVEN.JPG') },

  // ===== ASEO PERSONAL -- Nivel 2 =====
  { slug: 'jabones-de-manos', name: 'Jabones de manos', level: 2, parentSlug: 'aseo-personal', position: 1, imageUrl: img('files/1ae2e589fe157b48489a8e3492347bb0.JPG') },
  { slug: 'gel-y-champu', name: 'Gel y champu', level: 2, parentSlug: 'aseo-personal', position: 2 },
];

// ---------------------------------------------------------------------------
// 2) MARCAS (52 reales del crawl, con logo. Marcas NG = propias).
// ---------------------------------------------------------------------------

const rawBrands: Array<[string, string, boolean]> = [
  ['Alar', 'imagesmarcas/CEGECO-230221122340.jpg', false],
  ['Alexalo', 'imagesmarcas/ALEXALO.JPG', false],
  ['Alia', 'imagesmarcas/(2)ALIA.JPG', false],
  ['Amefa', 'imagesmarcas/AMEFA.jpg', false],
  ['APS', 'imagesmarcas/APS%20MELAMINA.JPG', false],
  ['Araven', 'imagesmarcas/ARAVEN.JPG', false],
  ['Arcoroc Profesional', 'imagesmarcas/arcoroc%20profesional.JPG', false],
  ['Arcos', 'imagesmarcas/arcos.JPG', false],
  ['Ariane Fine Porcelain', 'imagesmarcas/ARIANE.JPG', false],
  ['Beckers', 'imagesmarcas/BECKER.JPG', false],
  ['Bonna Premium Porcelain', 'imagesmarcas/BONNA%20PREMIUM%20PORCELAIN.JPG', false],
  ['Buarfe', 'imagesmarcas/BUARFE.JPG', false],
  ['Churchill', 'imagesmarcas/LOGOTIPO%20CHURCHILL.jpg', false],
  ['Churchill Vajilla', 'imagesmarcas/CHURCHILL%20VAJILLA.JPG', false],
  ['Cisne', 'imagesmarcas/CISNE.JPG', false],
  ['Comas', 'imagesmarcas/COMAS.JPG', false],
  ['Continental', 'imagesmarcas/continenetal.JPG', false],
  ['Cuatrogasa', 'imagesmarcas/LOGOTIPO%20CUATROGASA.jpg', false],
  ['Distform', 'imagesmarcas/DISTFORM.JPG', false],
  ['Dkristal', 'imagesmarcas/DKRISTAL.JPG', false],
  ['Dudson Vajilla', 'imagesmarcas/DUDSON%20VAJILLA.JPG', false],
  ['Duralec', 'imagesmarcas/DURALEC%20MARCA.jpg', false],
  ['Emile Henry', 'imagesmarcas/41-zfCqG4BL.jpg', false],
  ['Eternum', 'imagesmarcas/ETERNUM.JPG', false],
  ['Fabi Mobiliario', 'imagesmarcas/FABI%20MARCA.JPG', false],
  ['Fervik', 'imagesmarcas/FERVIK.JPG', false],
  ['Fricosmos', 'imagesmarcas/FRICOSMOS.JPG', false],
  ['Garcia de Pou', 'imagesmarcas/GARCIA%20DE%20POU.JPG', false],
  ['Giona Company', 'imagesmarcas/GIONA%20LOGOTIPO.jpg', false],
  ['Gural', 'imagesmarcas/gural.JPG', false],
  ['Hoteralia', 'imagesmarcas/catalogo-hoteralia-nunez-gil.jpg', false],
  ['HR Fainca', 'imagesmarcas/(2)HR%20fainca.JPG', false],
  ['Infrico', 'imagesmarcas/INFRICO.jpg', false],
  ['Jay Cuberteria', 'imagesmarcas/JAY%20CUBERTERIA.JPG', false],
  ['Jofel', 'imagesmarcas/JOFEL.jpg', false],
  ['Lacor', 'imagesmarcas/lacor.JPG', false],
  ['Le Coq', 'imagesmarcas/LE%20COQ.JPG', false],
  ['Luigi Bormioli', 'imagesmarcas/LUIGI%20BORMIOLI.JPG', false],
  ['Max Power', 'imagesmarcas/MAX%20POWER.JPG', false],
  ['Muebles Romero', 'imagesmarcas/ROMERO%20MARCA.JPG', false],
  ['Narumi', 'imagesmarcas/NARUMI.JPG', false],
  ['Nupik', 'imagesmarcas/NUPIK.JPG', false],
  // ---- Marcas propias NG ----
  ['NG Aseo Personal', 'imagesmarcas/5-peligrosos-agentes-cancerigenos-que-no-conocias-y-seguro-tienes-a-tu-alrededor-5.jpg', true],
  ['NG Automocion', 'imagesmarcas/NU;EZ%20GIL%20AUTOMOCION.JPG', true],
  ['NG Celulosa Hosteleria', 'imagesmarcas/CELULOSA%20HOSTELERIA.JPG', true],
  ['NG Celulosa Industrial y Dispensadores', 'imagesmarcas/(1)CELULOSA%20INDUSTRIAL.JPG', true],
  ['NG Hosteleria', 'imagesmarcas/ng-hosteleria.jpg', true],
  ['NG Lavanderia', 'imagesmarcas/NG%20LAVANDERIA.jpg', true],
  ['NG Limpieza', 'imagesmarcas/NG%20LIMPIEZA.JPG', true],
  ['NG Piscinas', 'imagesmarcas/(1)NG%20PISCINAS.JPG', true],
  ['NG Quimica', 'imagesmarcas/NG%20QUIMICA.jpg', true],
  ['NG Un Solo Uso', 'imagesmarcas/(1)ARTICULOS%20UN%20SOLO%20USO%20NG.JPG', true],
];

export const seedBrands: SeedBrand[] = rawBrands.map(([name, logo, own], i) => ({
  slug: slugify(name),
  name,
  logoUrl: img(logo),
  isOwnBrand: own,
  position: i + 1,
}));

// ---------------------------------------------------------------------------
// 3) PRODUCTOS (8-15 por categoria destacada). Precios en centimos, sin IVA.
// ---------------------------------------------------------------------------

export const seedProducts: SeedProduct[] = [
  // ===== INSECTICIDAS / AMBIENTADORES (REALES del crawl) =====
  {
    slug: 'limpiador-repelente-insecticida-hts-ban-5l',
    name: 'Limpiador repelente insecticida HTS Ban 5L',
    reference: '024-0850088',
    brandSlug: B('NG Quimica'),
    categorySlug: 'insecticidas',
    description: 'Limpiador repelente insecticida de uso profesional. Garrafa de 5 litros para superficies de cocina y zonas comunes en hosteleria.',
    imageUrl: img('imagesproductos/024-0850088.jpg'),
    specs: [
      { label: 'Formato', value: 'Garrafa 5 L' },
      { label: 'Uso', value: 'Profesional hosteleria' },
    ],
    badges: [],
    isFeatured: true,
    variants: [{ sku: '024-0850088', packFormat: '5L', unitsPerPack: 5, priceCents: 1540, unitPriceCents: 308, availability: 'in_stock' }],
  },
  {
    slug: 'casa-jardin-rosas-1000-cc',
    name: 'Casa Jardin Rosas 1000 cc',
    reference: '831-100023',
    brandSlug: B('NG Quimica'),
    categorySlug: 'ambientadores',
    description: 'Ambientador concentrado aroma rosas. Bote de 1000 cc para uso en dosificadores profesionales.',
    imageUrl: img('imagesproductos/archivo-1652948525956.jpg'),
    specs: [
      { label: 'Formato', value: '1000 cc' },
      { label: 'Aroma', value: 'Rosas' },
    ],
    badges: [],
    variants: [{ sku: '831-100023', packFormat: 'C/15', unitsPerPack: 15, priceCents: 4560, unitPriceCents: 304, availability: 'in_stock' }],
  },
  {
    slug: 'insecticida-piretr-coopermatic-caja-4-unid',
    name: 'Insecticida Piretr Coopermatic caja 4 unid.',
    reference: '286-COOP4',
    brandSlug: B('NG Quimica'),
    categorySlug: 'insecticidas',
    description: 'Insecticida piretroide para difusores automaticos. Caja de 4 unidades.',
    imageUrl: img('imagesproductos/archivo-16432784537736.jpg'),
    specs: [{ label: 'Presentacion', value: 'Caja 4 unidades' }],
    badges: [],
    variants: [{ sku: '286-COOP4', packFormat: 'CAJA 4', unitsPerPack: 4, priceCents: 3068, unitPriceCents: 767, availability: 'in_stock' }],
  },
  {
    slug: 'raid-hogar-e-interiores-600-ml-c12',
    name: 'Raid Hogar e Interiores 600 ml C/12 (precio und.)',
    reference: '286-RAID600',
    brandSlug: B('NG Quimica'),
    categorySlug: 'insecticidas',
    description: 'Aerosol insecticida para hogar e interiores. Spray de 600 ml. Precio por unidad, caja de 12.',
    imageUrl: img('imagesproductos/archivo-16476090390707.jpg'),
    specs: [{ label: 'Formato', value: 'Spray 600 ml' }],
    badges: ['oferta'],
    variants: [{ sku: '286-RAID600', packFormat: 'C/12', unitsPerPack: 12, priceCents: 390, oldPriceCents: 520, unitPriceCents: 390, availability: 'in_stock' }],
  },

  // ===== CRISTAL REFRESCO Y CERVEZA / COPAS (REALES del crawl) =====
  {
    slug: 'vaso-refresco-31-cl-spain-quartz-c6-5912',
    name: 'Vaso refresco 31 cl Spain Quartz C/6',
    reference: '286-V113310ER6',
    brandSlug: B('Arcoroc Profesional'),
    categorySlug: 'cristal-refresco-y-cerveza',
    description: 'Vaso de refresco de 31 cl de la serie Spain Quartz. Vidrio resistente apto para hosteleria. Caja de 6 unidades.',
    imageUrl: img('imagesproductos/archivo-16402610776883.JPG'),
    specs: [
      { label: 'Capacidad', value: '31 cl' },
      { label: 'Serie', value: 'Spain Quartz' },
      { label: 'Presentacion', value: 'Caja 6 uds.' },
    ],
    badges: [],
    isFeatured: true,
    variants: [{ sku: '286-V113310ER6', packFormat: 'C/6', unitsPerPack: 6, priceCents: 567, unitPriceCents: 94, availability: 'in_stock' }],
  },
  {
    slug: 'vaso-cerveza-stout-pinta-56-cl-c6',
    name: 'Vaso cerveza Stout pinta 56 cl C/6',
    reference: '286-STOUT56',
    brandSlug: B('Luigi Bormioli'),
    categorySlug: 'cristal-refresco-y-cerveza',
    description: 'Vaso de cerveza tipo pinta de 56 cl, ideal para cervezas tostadas y stout. Caja de 6 unidades.',
    imageUrl: null,
    specs: [{ label: 'Capacidad', value: '56 cl' }],
    badges: ['novedad'],
    variants: [{ sku: '286-STOUT56', packFormat: 'C/6', unitsPerPack: 6, priceCents: 894, unitPriceCents: 149, availability: 'in_stock' }],
  },
  {
    slug: 'vaso-sidra-asturiana-50-cl-c12',
    name: 'Vaso sidra asturiana 50 cl C/12',
    reference: '286-SIDRA50',
    brandSlug: B('Dkristal'),
    categorySlug: 'cristal-refresco-y-cerveza',
    description: 'Vaso de sidra natural de 50 cl, vidrio fino tradicional asturiano. Caja de 12 unidades.',
    imageUrl: null,
    specs: [{ label: 'Capacidad', value: '50 cl' }],
    badges: [],
    variants: [{ sku: '286-SIDRA50', packFormat: 'C/12', unitsPerPack: 12, priceCents: 1080, unitPriceCents: 90, availability: 'on_order' }],
  },
  {
    slug: 'copa-catavino-festival-32-cl-c12',
    name: 'Copa catavino Festival 32 cl C/12 unds.',
    reference: '286-FEST32',
    brandSlug: B('Arcoroc Profesional'),
    categorySlug: 'copas-de-agua-y-catavinos',
    description: 'Copa catavino serie Festival de 32 cl. Apta para cata de vinos y servicio de agua. Caja de 12 unidades.',
    imageUrl: img('imagesproductos/archivo-16557203090162.JPG'),
    specs: [
      { label: 'Capacidad', value: '32 cl' },
      { label: 'Serie', value: 'Festival' },
    ],
    badges: ['novedad'],
    isFeatured: true,
    variants: [{ sku: '286-FEST32', packFormat: 'C/12', unitsPerPack: 12, priceCents: 1428, unitPriceCents: 119, availability: 'in_stock' }],
  },
  {
    slug: 'copa-vino-vulcania-37-cl-c6',
    name: 'Copa de vino Vulcania 37 cl C/6',
    reference: '286-VULC37',
    brandSlug: B('Luigi Bormioli'),
    categorySlug: 'copas-de-vino-y-cava',
    description: 'Copa de vino tinto serie Vulcania de 37 cl. Cristal reforzado de alta resistencia. Caja de 6 unidades.',
    imageUrl: img('imagesproductos/archivo-16799133155348.JPG'),
    specs: [
      { label: 'Capacidad', value: '37 cl' },
      { label: 'Serie', value: 'Vulcania' },
    ],
    badges: ['novedad'],
    isFeatured: true,
    variants: [{ sku: '286-VULC37', packFormat: 'C/6', unitsPerPack: 6, priceCents: 1740, unitPriceCents: 290, availability: 'in_stock' }],
  },

  // ===== SERVILLETAS =====
  {
    slug: 'servilleta-punta-punta-blanca-40x40-paq-50-caja-24',
    name: 'Servilleta punta punta blanca 40x40 PAQ-50 CAJA 24',
    reference: '831-SPP4040',
    brandSlug: B('NG Celulosa Hosteleria'),
    categorySlug: 'servilletas',
    description: 'Servilleta de celulosa punta a punta, color blanco, 40x40 cm. Paquetes de 50 unidades, caja de 24 paquetes.',
    imageUrl: img('files/d4113709ea76e57a778196d45005ae7a.jpg'),
    specs: [
      { label: 'Medida', value: '40 x 40 cm' },
      { label: 'Color', value: 'Blanco' },
      { label: 'Presentacion', value: 'PAQ-50 / CAJA 24' },
    ],
    badges: [],
    isFeatured: true,
    variants: [{ sku: '831-SPP4040', packFormat: 'PAQ-50 CAJA 24', unitsPerPack: 1200, priceCents: 2890, unitPriceCents: 2, availability: 'in_stock' }],
  },
  {
    slug: 'servilleta-tissue-blanca-30x30-c100',
    name: 'Servilleta tissue blanca 30x30 C/100',
    reference: '831-TIS3030',
    brandSlug: B('NG Celulosa Hosteleria'),
    categorySlug: 'servilletas',
    description: 'Servilleta tissue de doble capa, blanca, 30x30 cm. Paquete de 100 unidades.',
    imageUrl: null,
    specs: [{ label: 'Medida', value: '30 x 30 cm' }],
    badges: [],
    variants: [{ sku: '831-TIS3030', packFormat: 'C/100', unitsPerPack: 100, priceCents: 215, unitPriceCents: 2, availability: 'in_stock' }],
  },
  {
    slug: 'servilleta-cocktail-roja-20x20-c100',
    name: 'Servilleta coctel roja 20x20 C/100',
    reference: '831-COC2020R',
    brandSlug: B('Garcia de Pou'),
    categorySlug: 'servilletas',
    description: 'Servilleta de coctel color rojo, 20x20 cm. Ideal para barra y eventos. Paquete de 100 unidades.',
    imageUrl: null,
    specs: [{ label: 'Color', value: 'Rojo' }],
    badges: ['oferta'],
    variants: [{ sku: '831-COC2020R', packFormat: 'C/100', unitsPerPack: 100, priceCents: 140, oldPriceCents: 190, unitPriceCents: 1, availability: 'in_stock' }],
  },

  // ===== BOBINAS Y ROLLOS INDUSTRIALES =====
  {
    slug: 'bobina-industrial-precorte-2-capas-c2',
    name: 'Bobina industrial precorte 2 capas C/2',
    reference: '831-BOB2C2',
    brandSlug: B('NG Celulosa Industrial y Dispensadores'),
    categorySlug: 'bobinas-y-rollos-industriales',
    description: 'Bobina industrial de celulosa blanca, doble capa, con precorte. Pack de 2 rollos de alto gramaje.',
    imageUrl: img('imagesmarcas/(1)CELULOSA%20INDUSTRIAL.JPG'),
    specs: [
      { label: 'Capas', value: '2' },
      { label: 'Presentacion', value: 'Pack 2 rollos' },
    ],
    badges: [],
    isFeatured: true,
    variants: [{ sku: '831-BOB2C2', packFormat: 'C/2', unitsPerPack: 2, priceCents: 1290, unitPriceCents: 645, availability: 'in_stock' }],
  },
  {
    slug: 'rollo-secamanos-mecha-tissue-c6',
    name: 'Rollo secamanos mecha tissue C/6',
    reference: '831-MECHA6',
    brandSlug: B('NG Celulosa Industrial y Dispensadores'),
    categorySlug: 'bobinas-y-rollos-industriales',
    description: 'Rollo secamanos de alimentacion central (mecha), tissue blanco. Pack de 6 rollos para dispensador.',
    imageUrl: null,
    specs: [{ label: 'Tipo', value: 'Alimentacion central' }],
    badges: [],
    variants: [{ sku: '831-MECHA6', packFormat: 'C/6', unitsPerPack: 6, priceCents: 1850, unitPriceCents: 308, availability: 'in_stock' }],
  },

  // ===== PRODUCTOS LIMPIEZA GENERAL =====
  {
    slug: 'fregasuelos-concentrado-perfumado-5l',
    name: 'Fregasuelos concentrado perfumado 5L',
    reference: '831-FREG5L',
    brandSlug: B('NG Limpieza'),
    categorySlug: 'productos-limpieza-general',
    description: 'Detergente fregasuelos concentrado de alto rendimiento, aroma fresco. Garrafa de 5 litros.',
    imageUrl: img('files/a7238b15621a2b8bca9b1b16569a8e01.JPG'),
    specs: [
      { label: 'Formato', value: 'Garrafa 5 L' },
      { label: 'Rendimiento', value: 'Concentrado' },
    ],
    badges: [],
    isFeatured: true,
    variants: [{ sku: '831-FREG5L', packFormat: '5L', unitsPerPack: 5, priceCents: 690, unitPriceCents: 138, availability: 'in_stock' }],
  },
  {
    slug: 'limpiacristales-amoniacal-750-ml-c12',
    name: 'Limpiacristales amoniacal 750 ml C/12',
    reference: '831-CRIS750',
    brandSlug: B('NG Limpieza'),
    categorySlug: 'productos-limpieza-general',
    description: 'Limpiacristales con amoniaco y pistola pulverizadora. Bote de 750 ml. Caja de 12 unidades.',
    imageUrl: null,
    specs: [{ label: 'Formato', value: '750 ml' }],
    badges: [],
    variants: [{ sku: '831-CRIS750', packFormat: 'C/12', unitsPerPack: 12, priceCents: 175, unitPriceCents: 175, availability: 'in_stock' }],
  },
  {
    slug: 'lejia-perfumada-apta-superficies-5l',
    name: 'Lejia perfumada apta superficies 5L',
    reference: '831-LEJ5L',
    brandSlug: B('NG Limpieza'),
    categorySlug: 'productos-limpieza-general',
    description: 'Lejia perfumada apta para limpieza de superficies de uso alimentario. Garrafa de 5 litros.',
    imageUrl: null,
    specs: [{ label: 'Formato', value: 'Garrafa 5 L' }],
    badges: ['outlet'],
    variants: [{ sku: '831-LEJ5L', packFormat: '5L', unitsPerPack: 5, priceCents: 240, oldPriceCents: 360, unitPriceCents: 48, availability: 'in_stock' }],
  },

  // ===== PRODUCTOS DESINFECTANTES =====
  {
    slug: 'desinfectante-bactericida-fungicida-5l',
    name: 'Desinfectante bactericida fungicida 5L',
    reference: '831-DESINF5L',
    brandSlug: B('NG Quimica'),
    categorySlug: 'productos-desinfectantes',
    description: 'Desinfectante de superficies con accion bactericida y fungicida, registro HA. Garrafa de 5 litros.',
    imageUrl: img('files/8c010f863f141de130407990d8b5da8a.JPG'),
    specs: [
      { label: 'Accion', value: 'Bactericida / Fungicida' },
      { label: 'Formato', value: 'Garrafa 5 L' },
    ],
    badges: [],
    isFeatured: true,
    variants: [{ sku: '831-DESINF5L', packFormat: '5L', unitsPerPack: 5, priceCents: 1180, unitPriceCents: 236, availability: 'in_stock' }],
  },
  {
    slug: 'gel-hidroalcoholico-manos-500-ml-c12',
    name: 'Gel hidroalcoholico manos 500 ml C/12',
    reference: '831-HIDRO500',
    brandSlug: B('NG Aseo Personal'),
    categorySlug: 'productos-desinfectantes',
    description: 'Gel hidroalcoholico para higiene de manos sin aclarado, 70% alcohol. Bote de 500 ml. Caja de 12.',
    imageUrl: null,
    specs: [{ label: 'Alcohol', value: '70%' }],
    badges: [],
    variants: [{ sku: '831-HIDRO500', packFormat: 'C/12', unitsPerPack: 12, priceCents: 320, unitPriceCents: 320, availability: 'in_stock' }],
  },

  // ===== VAJILLA Y PLATOS / PORCELANA =====
  {
    slug: 'plato-llano-porcelana-blanca-27-cm-c6',
    name: 'Plato llano porcelana blanca 27 cm C/6',
    reference: '450-PLL27',
    brandSlug: B('Churchill Vajilla'),
    categorySlug: 'vajilla-y-platos',
    description: 'Plato llano de porcelana profesional blanca de 27 cm. Apto para lavavajillas industrial. Caja de 6 unidades.',
    imageUrl: img('imagesmarcas/CHURCHILL%20VAJILLA.JPG'),
    specs: [
      { label: 'Diametro', value: '27 cm' },
      { label: 'Material', value: 'Porcelana' },
    ],
    badges: [],
    isFeatured: true,
    variants: [{ sku: '450-PLL27', packFormat: 'C/6', unitsPerPack: 6, priceCents: 2340, unitPriceCents: 390, availability: 'in_stock' }],
  },
  {
    slug: 'plato-hondo-bonna-22-cm-c12',
    name: 'Plato hondo Bonna 22 cm C/12',
    reference: '450-BONNA22',
    brandSlug: B('Bonna Premium Porcelain'),
    categorySlug: 'porcelana-profesional',
    description: 'Plato hondo de porcelana premium Bonna de 22 cm, borde reforzado. Caja de 12 unidades.',
    imageUrl: img('imagesmarcas/BONNA%20PREMIUM%20PORCELAIN.JPG'),
    specs: [{ label: 'Diametro', value: '22 cm' }],
    badges: ['novedad'],
    variants: [{ sku: '450-BONNA22', packFormat: 'C/12', unitsPerPack: 12, priceCents: 5640, unitPriceCents: 470, availability: 'in_stock' }],
  },

  // ===== CUBERTERIA / CUCHILLERIA =====
  {
    slug: 'tenedor-mesa-jay-modelo-viena-c12',
    name: 'Tenedor de mesa Jay modelo Viena C/12',
    reference: '510-VIENAT',
    brandSlug: B('Jay Cuberteria'),
    categorySlug: 'cuberteria',
    description: 'Tenedor de mesa modelo Viena en acero inoxidable 18/10. Caja de 12 unidades.',
    imageUrl: img('imagesmarcas/JAY%20CUBERTERIA.JPG'),
    specs: [{ label: 'Material', value: 'Acero inox. 18/10' }],
    badges: [],
    isFeatured: true,
    variants: [{ sku: '510-VIENAT', packFormat: 'C/12', unitsPerPack: 12, priceCents: 1680, unitPriceCents: 140, availability: 'in_stock' }],
  },
  {
    slug: 'cuchillo-chef-arcos-riviera-20-cm',
    name: 'Cuchillo chef Arcos Riviera 20 cm',
    reference: '610-RIV20',
    brandSlug: B('Arcos'),
    categorySlug: 'cuchilleria-profesional',
    description: 'Cuchillo de cocinero serie Riviera, hoja de 20 cm en acero NITRUM forjado. Mango ergonomico.',
    imageUrl: img('imagesmarcas/arcos.JPG'),
    specs: [
      { label: 'Hoja', value: '20 cm' },
      { label: 'Acero', value: 'NITRUM forjado' },
    ],
    badges: [],
    isFeatured: true,
    variants: [{ sku: '610-RIV20', packFormat: 'Unidad', unitsPerPack: 1, priceCents: 2890, unitPriceCents: 2890, availability: 'in_stock' }],
  },

  // ===== MAQUINARIA / FRIO =====
  {
    slug: 'armario-refrigeracion-infrico-700-l',
    name: 'Armario de refrigeracion Infrico 700 L',
    reference: '900-INF700',
    brandSlug: B('Infrico'),
    categorySlug: 'frio-y-conservacion',
    description: 'Armario refrigerado de una puerta, capacidad 700 litros, gas R290. Rango 0/+8 oC. Acero inoxidable.',
    imageUrl: img('imagesmarcas/INFRICO.jpg'),
    specs: [
      { label: 'Capacidad', value: '700 L' },
      { label: 'Rango', value: '0 / +8 oC' },
      { label: 'Gas', value: 'R290' },
    ],
    badges: [],
    isFeatured: true,
    variants: [{ sku: '900-INF700', packFormat: 'Unidad', unitsPerPack: 1, priceCents: null, availability: 'on_order' }],
  },
  {
    slug: 'lavavajillas-cupula-fricosmos-50x50',
    name: 'Lavavajillas de cupula Fricosmos 50x50',
    reference: '900-FRIC5050',
    brandSlug: B('Fricosmos'),
    categorySlug: 'lavavajillas-industriales',
    description: 'Lavavajillas industrial de cupula, cesta 50x50 cm, ciclo de 90 s. Doble pared aislante.',
    imageUrl: img('imagesmarcas/FRICOSMOS.JPG'),
    specs: [
      { label: 'Cesta', value: '50 x 50 cm' },
      { label: 'Ciclo', value: '90 s' },
    ],
    badges: [],
    variants: [{ sku: '900-FRIC5050', packFormat: 'Unidad', unitsPerPack: 1, priceCents: null, availability: 'on_order' }],
  },

  // ===== MENAJE / GASTRONORM =====
  {
    slug: 'sarten-aluminio-lacor-induccion-28-cm',
    name: 'Sarten aluminio Lacor induccion 28 cm',
    reference: '700-LAC28',
    brandSlug: B('Lacor'),
    categorySlug: 'menaje-y-utensilios',
    description: 'Sarten de aluminio fundido con antiadherente reforzado, apta para induccion. Diametro 28 cm.',
    imageUrl: img('imagesmarcas/lacor.JPG'),
    specs: [
      { label: 'Diametro', value: '28 cm' },
      { label: 'Apta', value: 'Induccion' },
    ],
    badges: ['oferta'],
    isFeatured: true,
    variants: [{ sku: '700-LAC28', packFormat: 'Unidad', unitsPerPack: 1, priceCents: 2150, oldPriceCents: 2890, unitPriceCents: 2150, availability: 'in_stock' }],
  },
  {
    slug: 'cubeta-gastronorm-araven-gn-1-1-h150',
    name: 'Cubeta gastronorm Araven GN 1/1 H150',
    reference: '720-GN11150',
    brandSlug: B('Araven'),
    categorySlug: 'recipientes-gastronorm',
    description: 'Cubeta gastronorm GN 1/1 de policarbonato, altura 150 mm. Apta para conservacion en frio y caliente.',
    imageUrl: img('imagesmarcas/ARAVEN.JPG'),
    specs: [
      { label: 'Formato', value: 'GN 1/1' },
      { label: 'Altura', value: '150 mm' },
    ],
    badges: [],
    variants: [{ sku: '720-GN11150', packFormat: 'Unidad', unitsPerPack: 1, priceCents: 1290, unitPriceCents: 1290, availability: 'in_stock' }],
  },

  // ===== CONSUMIBLES / VASOS Y TAPAS / ENVASES =====
  {
    slug: 'vaso-carton-cafe-240-ml-c50',
    name: 'Vaso carton cafe 240 ml C/50',
    reference: '831-VCAFE240',
    brandSlug: B('NG Un Solo Uso'),
    categorySlug: 'vasos-y-tapas',
    description: 'Vaso de carton para cafe de 240 ml (8 oz), apto para bebidas calientes. Paquete de 50 unidades.',
    imageUrl: img('imagesmarcas/(1)ARTICULOS%20UN%20SOLO%20USO%20NG.JPG'),
    specs: [{ label: 'Capacidad', value: '240 ml' }],
    badges: [],
    isFeatured: true,
    variants: [{ sku: '831-VCAFE240', packFormat: 'C/50', unitsPerPack: 50, priceCents: 320, unitPriceCents: 6, availability: 'in_stock' }],
  },
  {
    slug: 'envase-kraft-menu-1000-ml-c50',
    name: 'Envase kraft menu 1000 ml C/50',
    reference: '831-KRAFT1000',
    brandSlug: B('NG Un Solo Uso'),
    categorySlug: 'envases-alimentarios',
    description: 'Envase kraft con tapa para menu y take away, 1000 ml. Apto microondas. Paquete de 50 unidades.',
    imageUrl: null,
    specs: [{ label: 'Capacidad', value: '1000 ml' }],
    badges: ['novedad'],
    variants: [{ sku: '831-KRAFT1000', packFormat: 'C/50', unitsPerPack: 50, priceCents: 1450, unitPriceCents: 29, availability: 'in_stock' }],
  },

  // ===== DOSIFICADORES DE JABON / ASEO =====
  {
    slug: 'dosificador-jabon-jofel-1-l-abs',
    name: 'Dosificador de jabon Jofel 1 L ABS',
    reference: '300-JOFEL1L',
    brandSlug: B('Jofel'),
    categorySlug: 'dosificadores-de-jabon',
    description: 'Dosificador de jabon de pared en ABS blanco, capacidad 1 litro, con cierre antivandalico.',
    imageUrl: img('imagesmarcas/JOFEL.jpg'),
    specs: [
      { label: 'Capacidad', value: '1 L' },
      { label: 'Material', value: 'ABS' },
    ],
    badges: [],
    isFeatured: true,
    variants: [{ sku: '300-JOFEL1L', packFormat: 'Unidad', unitsPerPack: 1, priceCents: 980, unitPriceCents: 980, availability: 'in_stock' }],
  },
  {
    slug: 'jabon-manos-perlado-nacarado-5l',
    name: 'Jabon de manos perlado nacarado 5L',
    reference: '831-JABMAN5L',
    brandSlug: B('NG Aseo Personal'),
    categorySlug: 'jabones-de-manos',
    description: 'Jabon de manos perlado nacarado para dosificador, pH neutro. Garrafa de 5 litros.',
    imageUrl: null,
    specs: [{ label: 'Formato', value: 'Garrafa 5 L' }],
    badges: [],
    variants: [{ sku: '831-JABMAN5L', packFormat: '5L', unitsPerPack: 5, priceCents: 740, unitPriceCents: 148, availability: 'in_stock' }],
  },

  // ===== AUTOMOCION =====
  {
    slug: 'champu-espuma-activa-automocion-5l',
    name: 'Champu espuma activa automocion 5L',
    reference: '831-AUTOCHAMP',
    brandSlug: B('NG Automocion'),
    categorySlug: 'automocion',
    description: 'Champu de espuma activa para lavado de vehiculos a presion. Alto poder desengrasante. Garrafa de 5 litros.',
    imageUrl: img('imagesmarcas/NU;EZ%20GIL%20AUTOMOCION.JPG'),
    specs: [{ label: 'Formato', value: 'Garrafa 5 L' }],
    badges: [],
    isFeatured: true,
    variants: [{ sku: '831-AUTOCHAMP', packFormat: '5L', unitsPerPack: 5, priceCents: 890, unitPriceCents: 178, availability: 'in_stock' }],
  },

  // ===== PISCINAS =====
  {
    slug: 'cloro-granulado-piscinas-5-kg',
    name: 'Cloro granulado piscinas 5 kg',
    reference: '831-CLORO5K',
    brandSlug: B('NG Piscinas'),
    categorySlug: 'productos-para-piscinas',
    description: 'Cloro granulado de disolucion rapida para tratamiento de agua de piscina. Bote de 5 kg.',
    imageUrl: img('files/2bd5e7927541d96989387361c18cddda.JPG'),
    specs: [{ label: 'Formato', value: 'Bote 5 kg' }],
    badges: [],
    isFeatured: true,
    variants: [{ sku: '831-CLORO5K', packFormat: '5kg', unitsPerPack: 5, priceCents: 1690, unitPriceCents: 338, availability: 'in_stock' }],
  },

  // ===== LAVANDERIA =====
  {
    slug: 'detergente-ropa-liquido-profesional-10l',
    name: 'Detergente ropa liquido profesional 10L',
    reference: '831-DETROPA10',
    brandSlug: B('NG Lavanderia'),
    categorySlug: 'lavanderia-industrial',
    description: 'Detergente liquido de alta concentracion para lavadoras industriales. Garrafa de 10 litros.',
    imageUrl: img('files/fbf5e88aa7f636127238add5195e31a5.JPG'),
    specs: [{ label: 'Formato', value: 'Garrafa 10 L' }],
    badges: [],
    isFeatured: true,
    variants: [{ sku: '831-DETROPA10', packFormat: '10L', unitsPerPack: 10, priceCents: 1990, unitPriceCents: 199, availability: 'in_stock' }],
  },
];
