import { NextResponse } from 'next/server';
import { getDepartments, searchProducts } from '@/lib/data';
import { limiters, clientIpFromHeaders } from '@/lib/security/rate-limit';
import type { Category } from '@/lib/data/types';

/**
 * GET /api/search?q=&limit= — autosuggest del buscador (SearchAutosuggest.tsx).
 * Devuelve { items: Suggestion[] } combinando categorías (nombre) y productos.
 * Rate-limit: 30/min por IP (limiters.search, threat model S6). Degrada a [].
 */

interface Suggestion {
  type: 'product' | 'category';
  name: string;
  href: string;
  reference?: string;
}

function categoryHref(node: Category): string {
  // Política de URLs: N3 → /{parentSlug}/{slug}; N1 y N2 → /{slug}.
  return node.level === 3 && node.parentSlug ? `/${node.parentSlug}/${node.slug}` : `/${node.slug}`;
}

function flatten(tree: Category[]): Category[] {
  const out: Category[] = [];
  const walk = (nodes: Category[]) => {
    for (const n of nodes) {
      out.push(n);
      if (n.children?.length) walk(n.children);
    }
  };
  walk(tree);
  return out;
}

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();
}

export async function GET(request: Request): Promise<Response> {
  const rl = await limiters.search.limit(clientIpFromHeaders(request.headers));
  if (!rl.success) {
    return NextResponse.json(
      { items: [] },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } },
    );
  }

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') ?? '').trim();
  const limit = Math.min(10, Math.max(1, Number(searchParams.get('limit')) || 8));
  if (q.length < 2) return NextResponse.json({ items: [] });

  const nq = norm(q);
  const [productsPage, tree] = await Promise.all([
    searchProducts(q, { pageSize: limit }).catch(() => null),
    getDepartments().catch(() => [] as Category[]),
  ]);

  const categoryMatches = flatten(tree)
    .filter((c) => norm(c.name).includes(nq))
    .slice(0, 3)
    .map<Suggestion>((c) => ({ type: 'category', name: c.name, href: categoryHref(c) }));

  const productMatches = (productsPage?.items ?? []).map<Suggestion>((p) => ({
    type: 'product',
    name: p.name,
    href: `/producto/${p.slug}`,
    reference: p.reference,
  }));

  const items = [...categoryMatches, ...productMatches].slice(0, limit);

  return NextResponse.json(
    { items },
    { headers: { 'Cache-Control': 'public, max-age=30, stale-while-revalidate=120' } },
  );
}
