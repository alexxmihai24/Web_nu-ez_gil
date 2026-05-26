/**
 * slugify compartido por lib/data y prisma/seed.
 * Quita diacriticos (rango Unicode de marcas combinantes) y normaliza a kebab-case.
 */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // marcas diacriticas combinantes
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
