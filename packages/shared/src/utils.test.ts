import { describe, it, expect } from 'vitest';
import { cn, delay, generateId } from './utils';

describe('cn utility', () => {
  it('should combine class names', () => {
    const result = cn('btn', 'btn-primary');
    expect(result).toBe('btn btn-primary');
  });

  it('should filter out falsy values', () => {
    const result = cn('btn', null, undefined, false, '', 'btn-primary');
    expect(result).toBe('btn btn-primary');
  });
});

describe('delay utility', () => {
  it('should delay execution for specified milliseconds', async () => {
    const start = Date.now();
    await delay(100);
    const end = Date.now();
    expect(end - start).toBeGreaterThanOrEqual(90); // Allow small timing variance
    expect(end - start).toBeLessThan(150);
  });
});

describe('generateId utility', () => {
  it('should generate unique IDs', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
  });

  it('should generate IDs of consistent format', () => {
    const id = generateId();
    expect(id).toMatch(/^\d+-[a-z0-9]+$/);
  });

  it('should generate timestamp-based IDs', () => {
    const id = generateId();
    const timestamp = id.split('-')[0];
    expect(Number(timestamp)).toBeGreaterThan(0);
  });
});
