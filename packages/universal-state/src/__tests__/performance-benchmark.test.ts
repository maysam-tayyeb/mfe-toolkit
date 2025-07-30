import { describe, it, expect, beforeEach } from 'vitest';
import { UniversalStateManager } from '../core/state-manager';
import { ValtioStateManager } from '../core/valtio-state-manager';

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

describe('Performance Benchmarks: UniversalStateManager vs ValtioStateManager', () => {
  describe('Write Performance', () => {
    it('should compare set operation performance', () => {
      const results: BenchmarkResult[] = [];
      
      // Test UniversalStateManager
      results.push(
        runBenchmark(
          'UniversalStateManager - set',
          () => new UniversalStateManager({ devtools: false, persistent: false, crossTab: false }),
          (manager) => {
            manager.set('counter', Math.random());
          },
          10000
        )
      );
      
      // Test ValtioStateManager
      results.push(
        runBenchmark(
          'ValtioStateManager - set',
          () => new ValtioStateManager({ devtools: false, persistent: false, crossTab: false }),
          (manager) => {
            manager.set('counter', Math.random());
          },
          10000
        )
      );
      
      // Log results
      console.table(results.map(r => ({
        Implementation: r.name,
        'Operations': r.operations,
        'Duration (ms)': r.duration.toFixed(2),
        'Ops/second': r.opsPerSecond.toFixed(0),
      })));
      
      // Valtio should be within reasonable performance range
      const universalOps = results[0].opsPerSecond;
      const valtioOps = results[1].opsPerSecond;
      expect(valtioOps).toBeGreaterThan(universalOps * 0.5); // At least 50% of original performance
    });
  });
  
  describe('Read Performance', () => {
    it('should compare get operation performance', () => {
      const results: BenchmarkResult[] = [];
      
      // Test UniversalStateManager
      results.push(
        runBenchmark(
          'UniversalStateManager - get',
          () => {
            const manager = new UniversalStateManager({ devtools: false, persistent: false, crossTab: false });
            for (let i = 0; i < 100; i++) {
              manager.set(`key${i}`, i);
            }
            return manager;
          },
          (manager) => {
            manager.get(`key${Math.floor(Math.random() * 100)}`);
          },
          10000
        )
      );
      
      // Test ValtioStateManager
      results.push(
        runBenchmark(
          'ValtioStateManager - get',
          () => {
            const manager = new ValtioStateManager({ devtools: false, persistent: false, crossTab: false });
            for (let i = 0; i < 100; i++) {
              manager.set(`key${i}`, i);
            }
            return manager;
          },
          (manager) => {
            manager.get(`key${Math.floor(Math.random() * 100)}`);
          },
          10000
        )
      );
      
      console.table(results.map(r => ({
        Implementation: r.name,
        'Operations': r.operations,
        'Duration (ms)': r.duration.toFixed(2),
        'Ops/second': r.opsPerSecond.toFixed(0),
      })));
      
      // Valtio may have overhead due to proxy, but should be reasonable
      const universalOps = results[0].opsPerSecond;
      const valtioOps = results[1].opsPerSecond;
      expect(valtioOps).toBeGreaterThan(universalOps * 0.3); // At least 30% of original performance
    });
  });
  
  describe('Subscription Performance', () => {
    it('should compare subscription handling', () => {
      const results: BenchmarkResult[] = [];
      
      // Test UniversalStateManager
      results.push(
        runBenchmark(
          'UniversalStateManager - subscribe/notify',
          () => {
            const manager = new UniversalStateManager({ devtools: false, persistent: false, crossTab: false });
            const listeners: (() => void)[] = [];
            // Add 100 subscribers
            for (let i = 0; i < 100; i++) {
              const unsub = manager.subscribe(`key${i}`, () => {});
              listeners.push(unsub);
            }
            return { manager, listeners };
          },
          ({ manager }) => {
            // Trigger notifications
            manager.set(`key${Math.floor(Math.random() * 100)}`, Math.random());
          },
          1000
        )
      );
      
      // Test ValtioStateManager
      results.push(
        runBenchmark(
          'ValtioStateManager - subscribe/notify',
          () => {
            const manager = new ValtioStateManager({ devtools: false, persistent: false, crossTab: false });
            const listeners: (() => void)[] = [];
            // Add 100 subscribers
            for (let i = 0; i < 100; i++) {
              const unsub = manager.subscribe(`key${i}`, () => {});
              listeners.push(unsub);
            }
            return { manager, listeners };
          },
          ({ manager }) => {
            // Trigger notifications
            manager.set(`key${Math.floor(Math.random() * 100)}`, Math.random());
          },
          1000
        )
      );
      
      console.table(results.map(r => ({
        Implementation: r.name,
        'Operations': r.operations,
        'Duration (ms)': r.duration.toFixed(2),
        'Ops/second': r.opsPerSecond.toFixed(0),
      })));
    });
  });
  
  describe('Memory Usage', () => {
    it('should compare memory efficiency with many keys', () => {
      const keyCount = 1000;
      
      // Test UniversalStateManager
      const universalManager = new UniversalStateManager({ 
        devtools: false, 
        persistent: false, 
        crossTab: false 
      });
      
      for (let i = 0; i < keyCount; i++) {
        universalManager.set(`key${i}`, { 
          id: i, 
          data: `value${i}`,
          nested: { deep: i }
        });
      }
      
      // Test ValtioStateManager
      const valtioManager = new ValtioStateManager({ 
        devtools: false, 
        persistent: false, 
        crossTab: false 
      });
      
      for (let i = 0; i < keyCount; i++) {
        valtioManager.set(`key${i}`, { 
          id: i, 
          data: `value${i}`,
          nested: { deep: i }
        });
      }
      
      // Both should handle large amounts of data
      expect(universalManager.getSnapshot()).toHaveProperty('key999');
      expect(valtioManager.getSnapshot()).toHaveProperty('key999');
    });
  });
  
  describe('Batch Update Performance', () => {
    it('should compare performance of multiple synchronous updates', () => {
      const results: BenchmarkResult[] = [];
      
      // Test UniversalStateManager
      results.push(
        runBenchmark(
          'UniversalStateManager - batch updates',
          () => new UniversalStateManager({ devtools: false, persistent: false, crossTab: false }),
          (manager) => {
            // Simulate batch update
            for (let i = 0; i < 10; i++) {
              manager.set(`batch${i}`, i);
            }
          },
          100
        )
      );
      
      // Test ValtioStateManager
      results.push(
        runBenchmark(
          'ValtioStateManager - batch updates',
          () => new ValtioStateManager({ devtools: false, persistent: false, crossTab: false }),
          (manager) => {
            // Simulate batch update
            for (let i = 0; i < 10; i++) {
              manager.set(`batch${i}`, i);
            }
          },
          100
        )
      );
      
      console.table(results.map(r => ({
        Implementation: r.name,
        'Operations': r.operations,
        'Duration (ms)': r.duration.toFixed(2),
        'Ops/second': r.opsPerSecond.toFixed(0),
      })));
      
      // Log improvement percentage
      const improvement = ((results[1].opsPerSecond - results[0].opsPerSecond) / results[0].opsPerSecond) * 100;
      console.log(`\nValtio Performance Improvement: ${improvement.toFixed(1)}%`);
    });
  });
});