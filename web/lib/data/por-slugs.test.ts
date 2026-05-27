import { describe, it, expect } from 'vitest';
import { getProductsBySlugs } from './index';

describe('getProductsBySlugs', () => {
  it('devuelve [] con lista vacía', async () => {
    expect(await getProductsBySlugs([])).toEqual([]);
  });

  it('devuelve [] para slugs inexistentes', async () => {
    const r = await getProductsBySlugs(['no-existe-xyz-123']);
    expect(Array.isArray(r)).toBe(true);
    expect(r.length).toBe(0);
  });
});
