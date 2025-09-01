import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateId, delay, safeJsonParse, deepClone, debounce, throttle } from './index';

describe('Utils', () => {
  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      
      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
    });

    it('should generate ID with timestamp and random string', () => {
      const id = generateId();
      const parts = id.split('-');
      
      expect(parts).toHaveLength(2);
      expect(Number(parts[0])).toBeGreaterThan(0); // Timestamp
      expect(parts[1]).toMatch(/^[a-z0-9]{9}$/); // Random string
    });

    it('should generate different IDs even when called rapidly', () => {
      const ids = new Set();
      for (let i = 0; i < 100; i++) {
        ids.add(generateId());
      }
      
      expect(ids.size).toBe(100); // All should be unique
    });
  });

  describe('delay', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return a promise', () => {
      const result = delay(100);
      expect(result).toBeInstanceOf(Promise);
    });

    it('should resolve after specified time', async () => {
      const promise = delay(100);
      let resolved = false;
      
      promise.then(() => {
        resolved = true;
      });

      expect(resolved).toBe(false);
      
      await vi.advanceTimersByTimeAsync(50);
      expect(resolved).toBe(false);
      
      await vi.advanceTimersByTimeAsync(50);
      expect(resolved).toBe(true);
    });

    it('should handle zero delay', async () => {
      const promise = delay(0);
      await vi.runAllTimersAsync();
      await expect(promise).resolves.toBeUndefined();
    });

    it('should handle negative delay (treated as 0)', async () => {
      const promise = delay(-100);
      await vi.runAllTimersAsync();
      await expect(promise).resolves.toBeUndefined();
    });
  });

  describe('safeJsonParse', () => {
    it('should parse valid JSON', () => {
      const json = '{"name":"test","value":123}';
      const result = safeJsonParse(json, null);
      
      expect(result).toEqual({ name: 'test', value: 123 });
    });

    it('should return fallback for invalid JSON', () => {
      const invalidJson = '{invalid json}';
      const fallback = { default: true };
      const result = safeJsonParse(invalidJson, fallback);
      
      expect(result).toBe(fallback);
    });

    it('should parse arrays', () => {
      const json = '[1,2,3]';
      const result = safeJsonParse(json, []);
      
      expect(result).toEqual([1, 2, 3]);
    });

    it('should parse primitives', () => {
      expect(safeJsonParse('"string"', '')).toBe('string');
      expect(safeJsonParse('123', 0)).toBe(123);
      expect(safeJsonParse('true', false)).toBe(true);
      expect(safeJsonParse('null', 'fallback')).toBeNull();
    });

    it('should handle empty string', () => {
      const result = safeJsonParse('', 'fallback');
      expect(result).toBe('fallback');
    });

    it('should handle undefined input', () => {
      const result = safeJsonParse(undefined as any, 'fallback');
      expect(result).toBe('fallback');
    });

    it('should preserve type with generic', () => {
      interface TestType {
        id: number;
        name: string;
      }
      
      const json = '{"id":1,"name":"test"}';
      const fallback: TestType = { id: 0, name: '' };
      const result = safeJsonParse<TestType>(json, fallback);
      
      expect(result.id).toBe(1);
      expect(result.name).toBe('test');
    });
  });

  describe('deepClone', () => {
    it('should clone simple objects', () => {
      const original = { a: 1, b: 'test', c: true };
      const cloned = deepClone(original);
      
      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
    });

    it('should clone nested objects', () => {
      const original = {
        level1: {
          level2: {
            level3: {
              value: 'deep',
            },
          },
        },
      };
      const cloned = deepClone(original);
      
      expect(cloned).toEqual(original);
      expect(cloned.level1).not.toBe(original.level1);
      expect(cloned.level1.level2).not.toBe(original.level1.level2);
      expect(cloned.level1.level2.level3).not.toBe(original.level1.level2.level3);
    });

    it('should clone arrays', () => {
      const original = [1, 2, { a: 3 }];
      const cloned = deepClone(original);
      
      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned[2]).not.toBe(original[2]);
    });

    it('should clone complex structures', () => {
      const original = {
        array: [1, 2, 3],
        object: { nested: true },
        string: 'test',
        number: 123,
        boolean: false,
        null: null,
      };
      const cloned = deepClone(original);
      
      expect(cloned).toEqual(original);
      expect(cloned.array).not.toBe(original.array);
      expect(cloned.object).not.toBe(original.object);
    });

    it('should not preserve functions', () => {
      const original = {
        fn: () => 'test',
        value: 123,
      };
      const cloned = deepClone(original);
      
      expect(cloned.value).toBe(123);
      expect(cloned.fn).toBeUndefined();
    });

    it('should not preserve undefined values', () => {
      const original = {
        defined: 'test',
        undefined: undefined,
      };
      const cloned = deepClone(original);
      
      expect(cloned.defined).toBe('test');
      expect('undefined' in cloned).toBe(false);
    });

    it('should convert dates to strings', () => {
      const original = {
        date: new Date('2024-01-01'),
      };
      const cloned = deepClone(original);
      
      expect(typeof cloned.date).toBe('string');
      expect(cloned.date).toBe('2024-01-01T00:00:00.000Z');
    });

    it('should handle circular references by throwing', () => {
      const original: any = { a: 1 };
      original.circular = original;
      
      expect(() => deepClone(original)).toThrow();
    });
  });

  describe('debounce', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should debounce function calls', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);

      debounced();
      debounced();
      debounced();

      expect(fn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should pass arguments to debounced function', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);

      debounced('arg1', 'arg2', 123);

      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledWith('arg1', 'arg2', 123);
    });

    it('should use latest arguments when called multiple times', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);

      debounced('first');
      debounced('second');
      debounced('third');

      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith('third');
    });

    it('should reset timer on each call', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);

      debounced();
      vi.advanceTimersByTime(50);
      
      debounced();
      vi.advanceTimersByTime(50);
      
      debounced();
      vi.advanceTimersByTime(50);
      
      expect(fn).not.toHaveBeenCalled();
      
      vi.advanceTimersByTime(50);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should allow multiple executions after delay', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);

      debounced('first');
      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenLastCalledWith('first');

      debounced('second');
      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(2);
      expect(fn).toHaveBeenLastCalledWith('second');
    });

    it('should work with zero delay', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 0);

      debounced('test');
      vi.runAllTimers();
      expect(fn).toHaveBeenCalledWith('test');
    });
  });

  describe('throttle', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should throttle function calls', () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 100);

      throttled();
      throttled();
      throttled();

      expect(fn).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(100);
      throttled();
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should pass arguments to throttled function', () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 100);

      throttled('arg1', 'arg2', 123);
      expect(fn).toHaveBeenCalledWith('arg1', 'arg2', 123);
    });

    it('should use first call arguments during throttle period', () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 100);

      throttled('first');
      throttled('second');
      throttled('third');

      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith('first');
    });

    it('should allow next call after throttle period', () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 100);

      throttled('first');
      expect(fn).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(50);
      throttled('during');
      expect(fn).toHaveBeenCalledTimes(1); // Still throttled

      vi.advanceTimersByTime(50);
      throttled('after');
      expect(fn).toHaveBeenCalledTimes(2); // Throttle period ended
      expect(fn).toHaveBeenLastCalledWith('after');
    });

    it('should handle rapid successive calls', () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 100);

      for (let i = 0; i < 10; i++) {
        throttled(i);
      }
      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith(0);

      vi.advanceTimersByTime(100);

      for (let i = 10; i < 20; i++) {
        throttled(i);
      }
      expect(fn).toHaveBeenCalledTimes(2);
      expect(fn).toHaveBeenLastCalledWith(10);
    });

    it('should work with zero limit', () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 0);

      throttled('first');
      vi.runAllTimers();
      throttled('second');
      
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should maintain separate throttle state for different instances', () => {
      const fn1 = vi.fn();
      const fn2 = vi.fn();
      const throttled1 = throttle(fn1, 100);
      const throttled2 = throttle(fn2, 100);

      throttled1();
      throttled2();
      expect(fn1).toHaveBeenCalledTimes(1);
      expect(fn2).toHaveBeenCalledTimes(1);

      throttled1();
      throttled2();
      expect(fn1).toHaveBeenCalledTimes(1); // Both throttled
      expect(fn2).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(100);
      throttled1();
      throttled2();
      expect(fn1).toHaveBeenCalledTimes(2);
      expect(fn2).toHaveBeenCalledTimes(2);
    });
  });
});