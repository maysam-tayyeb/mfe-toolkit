import { describe, it, expect } from 'vitest';
import { UniversalStateManager } from '../core/universal-state-manager';

interface BenchmarkResult {
  name: string;
  operations: number;
  duration: number;
  opsPerSecond: number;
}

function runBenchmark(
  name: string,
  setup: () => any,
  operation: (context: any) => void,
  iterations: number = 1000
): BenchmarkResult {
  const context = setup();
  const start = performance.now();
  
  for (let i = 0; i < iterations; i++) {
    operation(context);
  }
  
  const duration = performance.now() - start;
  const opsPerSecond = (iterations / duration) * 1000;
  
  return {
    name,
    operations: iterations,
    duration,
    opsPerSecond,
  };
}

describe('UniversalStateManager Performance Benchmarks', () => {
  describe('Write Performance', () => {
    it('should benchmark set operation performance', () => {
      const result = runBenchmark(
        'UniversalStateManager - set',
        () => new UniversalStateManager({ devtools: false, persistent: false, crossTab: false }),
        (manager) => {
          manager.set('counter', Math.random());
        },
        10000
      );
      
      console.log('Set Operation Performance:', {
        ...result,
        opsPerSecond: result.opsPerSecond.toFixed(0),
      });
      
      // Expect reasonable performance (at least 10k ops/sec)
      expect(result.opsPerSecond).toBeGreaterThan(10000);
    });
  });

  describe('Read Performance', () => {
    it('should benchmark get operation performance', () => {
      const result = runBenchmark(
        'UniversalStateManager - get',
        () => {
          const manager = new UniversalStateManager({ devtools: false, persistent: false, crossTab: false });
          // Pre-populate with data
          for (let i = 0; i < 100; i++) {
            manager.set(`key${i}`, `value${i}`);
          }
          return manager;
        },
        (manager) => {
          manager.get(`key${Math.floor(Math.random() * 100)}`);
        },
        100000
      );
      
      console.log('Get Operation Performance:', {
        ...result,
        opsPerSecond: result.opsPerSecond.toFixed(0),
      });
      
      // Get operations should be very fast (at least 100k ops/sec)
      expect(result.opsPerSecond).toBeGreaterThan(100000);
    });
  });

  describe('Subscription Performance', () => {
    it('should benchmark subscription handling', () => {
      const manager = new UniversalStateManager({ devtools: false, persistent: false, crossTab: false });
      let updateCount = 0;
      
      // Add multiple subscribers
      for (let i = 0; i < 10; i++) {
        manager.subscribe('testKey', () => {
          updateCount++;
        });
      }
      
      const result = runBenchmark(
        'UniversalStateManager - subscription notifications',
        () => manager,
        (mgr) => {
          mgr.set('testKey', Math.random());
        },
        1000
      );
      
      console.log('Subscription Performance:', {
        ...result,
        opsPerSecond: result.opsPerSecond.toFixed(0),
        totalNotifications: updateCount,
        notificationsPerOp: updateCount / result.operations,
      });
      
      // Should handle multiple subscribers efficiently
      expect(result.opsPerSecond).toBeGreaterThan(1000);
      expect(updateCount).toBe(result.operations * 10); // 10 subscribers
    });
  });

  describe('Implementation-specific Features (Valtio)', () => {
    it('should benchmark proxy access performance', () => {
      const result = runBenchmark(
        'UniversalStateManager - proxy access',
        () => {
          const manager = new UniversalStateManager({ devtools: false, persistent: false, crossTab: false });
          const proxy = manager.getProxyStore();
          // Pre-populate
          for (let i = 0; i < 100; i++) {
            proxy[`key${i}`] = `value${i}`;
          }
          return { manager, proxy };
        },
        ({ proxy }) => {
          // Direct proxy access
          const value = proxy[`key${Math.floor(Math.random() * 100)}`];
        },
        100000
      );
      
      console.log('Proxy Access Performance:', {
        ...result,
        opsPerSecond: result.opsPerSecond.toFixed(0),
      });
      
      // Proxy access should be fast
      expect(result.opsPerSecond).toBeGreaterThan(50000);
    });
  });
});