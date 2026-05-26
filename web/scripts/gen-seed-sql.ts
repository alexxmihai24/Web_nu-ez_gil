/**
 * Generador del seed SQL para Supabase a partir del dataset estático.
 * Uso:  npx tsx scripts/gen-seed-sql.ts   →  escribe supabase/02-seed.sql
 * No necesita claves: solo transforma seeddata.ts en INSERTs idempotentes.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { seedCategories, seedBrands, seedProducts } from '../lib/data/seeddata';

/** Escapa un valor a literal SQL ('...'), o NULL. */
function sql(v: string | number | boolean | null | undefined): string {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'number') return String(v);
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  return `'${v.replace(/'/g, "''")}'`;
}

/** Literal jsonb escapado. */
function jsonb(value: unknown): string {
  return `'${JSON.stringify(value ?? []).replace(/'/g, "''")}'::jsonb`;
}

const out: string[] = [];
out.push('-- =============================================================================');
out.push('-- Núñez Gil — SEED del catálogo (GENERADO automáticamente, no editar a mano)');
out.push('-- Ejecutar DESPUÉS de 01-esquema.sql, en Supabase → SQL Editor → Run.');
out.push('-- Idempotente: borra y reinserta el catálogo completo.');
out.push('-- =============================================================================');
out.push('');
out.push('begin;');
out.push('-- Limpieza (orden inverso de FK)');
out.push('delete from imagenes_producto;');
out.push('delete from variantes_producto;');
out.push('delete from productos;');
out.push('delete from marcas;');
out.push('delete from categorias;');
out.push('');

// --- Marcas ---
out.push('-- Marcas');
for (const b of seedBrands) {
  out.push(
    `insert into marcas (slug, nombre, logo_url, es_marca_propia, posicion) values ` +
      `(${sql(b.slug)}, ${sql(b.name)}, ${sql(b.logoUrl ?? null)}, ${sql(b.isOwnBrand)}, ${sql(b.position)});`,
  );
}
out.push('');

// --- Categorías (orden por nivel para respetar la FK self-referenciada) ---
out.push('-- Categorías (nivel 1 → 2 → 3)');
for (const c of [...seedCategories].sort((a, b) => a.level - b.level || a.position - b.position)) {
  out.push(
    `insert into categorias (slug, nombre, nivel, parent_slug, imagen_url, posicion) values ` +
      `(${sql(c.slug)}, ${sql(c.name)}, ${c.level}, ${sql(c.parentSlug ?? null)}, ${sql(c.imageUrl ?? null)}, ${sql(c.position)});`,
  );
}
out.push('');

// --- Productos + variantes + imágenes ---
out.push('-- Productos, variantes e imágenes');
for (const p of seedProducts) {
  const esNuevo = p.badges?.includes('novedad') ?? false;
  const esOferta = p.badges?.includes('oferta') ?? false;
  const esOutlet = p.badges?.includes('outlet') ?? false;
  out.push(
    `insert into productos (slug, nombre, referencia, descripcion, marca_slug, categoria_slug, imagen_url, especificaciones, es_nuevo, es_oferta, es_outlet, destacado) values ` +
      `(${sql(p.slug)}, ${sql(p.name)}, ${sql(p.reference)}, ${sql(p.description ?? null)}, ${sql(p.brandSlug ?? null)}, ${sql(p.categorySlug)}, ${sql(p.imageUrl ?? null)}, ${jsonb(p.specs ?? [])}, ${sql(esNuevo)}, ${sql(esOferta)}, ${sql(esOutlet)}, ${sql(p.isFeatured ?? false)});`,
  );

  p.variants.forEach((v, i) => {
    out.push(
      `insert into variantes_producto (producto_slug, sku, formato_pack, precio_centimos, precio_anterior_centimos, precio_unidad_centimos, disponibilidad, posicion) values ` +
        `(${sql(p.slug)}, ${sql(v.sku)}, ${sql(v.packFormat ?? null)}, ${sql(v.priceCents ?? null)}, ${sql(v.oldPriceCents ?? null)}, ${sql(v.unitPriceCents ?? null)}, ${sql(v.availability)}, ${i});`,
    );
  });

  const galeria = p.gallery && p.gallery.length ? p.gallery : p.imageUrl ? [p.imageUrl] : [];
  galeria.forEach((url, i) => {
    out.push(
      `insert into imagenes_producto (producto_slug, url, posicion) values (${sql(p.slug)}, ${sql(url)}, ${i});`,
    );
  });
}
out.push('');
out.push('commit;');
out.push('');

const dir = path.join(process.cwd(), 'supabase');
mkdirSync(dir, { recursive: true });
const file = path.join(dir, '02-seed.sql');
writeFileSync(file, out.join('\n'), 'utf8');
console.log(`OK → ${file}`);
console.log(`Marcas: ${seedBrands.length} · Categorías: ${seedCategories.length} · Productos: ${seedProducts.length}`);
