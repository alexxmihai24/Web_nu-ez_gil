import { NextResponse } from 'next/server';
import { getProductsBySlugs } from '@/lib/data';
import { limiters, clientIpFromHeaders } from '@/lib/security/rate-limit';

/**
 * GET /api/solicitudes/resolver?slugs=a,b,c — datos de producto (foto, referencia,
 * marca, precio) para pintar la cesta. La cesta vive en localStorage y solo guarda
 * id/slug/name/qty; aquí se enriquece. Rate-limit: reutiliza el del buscador (30/min).
 */
const MAX_SLUGS = 100;

export async function GET(request: Request): Promise<Response> {
  const rl = await limiters.search.limit(clientIpFromHeaders(request.headers));
  if (!rl.success) {
    return NextResponse.json({ items: [] }, { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } });
  }

  const { searchParams } = new URL(request.url);
  const slugs = (searchParams.get('slugs') ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, MAX_SLUGS);

  if (slugs.length === 0) return NextResponse.json({ items: [] });

  const items = await getProductsBySlugs(slugs).catch(() => []);
  return NextResponse.json({ items });
}
