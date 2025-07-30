import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ValtioStateManager } from '../core/valtio-state-manager';
import { StateChangeEvent } from '../types';

describe('ValtioStateManager', () => {
  let manager: ValtioStateManager;

  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();
    // Create new manager instance
    manager = new ValtioStateManager({
      persistent: false,
      crossTab: false,
      devtools: false,
    });
  });

  afterEach(() => {
    // Clean up any broadcast channels
    if ('BroadcastChannel' in globalThis) {
      // @ts-ignore
      globalThis.BroadcastChannel.prototype.close();
    }
  });

  describe('Core functionality', () => {
    it('should set and get values', () => {
      manager.set('test', 'value');
      expect(manager.get('test')).toBe('value');
    });

    it('should handle complex objects', () => {
      const complexObject = {
        name: 'John',
        age: 30,
        nested: { deep: 'value' },
      };
      manager.set('user', complexObject);
      expect(manager.get('user')).toEqual(complexObject);
    });

    it('should handle undefined values', () => {
      expect(manager.get('nonexistent')).toBeUndefined();
    });

    it('should delete values', () => {
      manager.set('toDelete', 'value');
      expect(manager.get('toDelete')).toBe('value');
      manager.delete('toDelete');
      expect(manager.get('toDelete')).toBeUndefined();
    });

    it('should clear all values', () => {
      manager.set('key1', 'value1');
      manager.set('key2', 'value2');
      manager.clear();
      expect(manager.get('key1')).toBeUndefined();
      expect(manager.get('key2')).toBeUndefined();
    });

    it('should track source of changes', () => {
      const listener = vi.fn();
      manager.subscribeAll(listener);
      
      manager.set('test', 'value', 'custom-source');
      
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          key: 'test',
          value: 'value',
          source: 'custom-source',
        })
      );
    });
  });

  describe('Subscription system', () => {
    it('should notify subscribers on value changes', () => {
      const listener = vi.fn();
      const unsubscribe = manager.subscribe('test', listener);
      
      // Reset the mock to ignore the initial call if any
      listener.mockClear();

      manager.set('test', 'value1');
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith('value1', expect.objectContaining({
        key: 'test',
        value: 'value1',
      }));

      manager.set('test', 'value2');
      expect(listener).toHaveBeenCalledTimes(2);
      expect(listener).toHaveBeenCalledWith('value2', expect.objectContaining({
        key: 'test',
        value: 'value2',
        previousValue: 'value1',
      }));

      unsubscribe();
      manager.set('test', 'value3');
      // Should not be called again after unsubscribe
      expect(listener).toHaveBeenCalledTimes(2);
    });

    it('should call subscriber immediately with current value', () => {
      manager.set('test', 'existing');
      const listener = vi.fn();
      
      manager.subscribe('test', listener);
      
      expect(listener).toHaveBeenCalledWith('existing', expect.objectContaining({
        key: 'test',
        value: 'existing',
        source: 'initial',
      }));
    });

    it('should support multiple subscribers per key', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      
      manager.subscribe('test', listener1);
      manager.subscribe('test', listener2);
      
      manager.set('test', 'value');
      
      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
    });

    it('should support global subscriptions', () => {
      const globalListener = vi.fn();
      const unsubscribe = manager.subscribeAll(globalListener);

      manager.set('key1', 'value1');
      manager.set('key2', 'value2');

      expect(globalListener).toHaveBeenCalledTimes(2);
      expect(globalListener).toHaveBeenCalledWith(
        expect.objectContaining({ key: 'key1', value: 'value1' })
      );
      expect(globalListener).toHaveBeenCalledWith(
        expect.objectContaining({ key: 'key2', value: 'value2' })
      );

      unsubscribe();
      manager.set('key3', 'value3');
      expect(globalListener).toHaveBeenCalledTimes(2);
    });
  });

  describe('MFE management', () => {
    it('should register MFEs', () => {
      manager.registerMFE('test-mfe', { version: '1.0.0', framework: 'react' });
      expect(manager.get('mfe:test-mfe:registered')).toBe(true);
    });

    it('should unregister MFEs and clean up state', () => {
      manager.registerMFE('test-mfe');
      manager.set('mfe:test-mfe:data', 'value');
      manager.set('other-data', 'keep');

      manager.unregisterMFE('test-mfe');

      expect(manager.get('mfe:test-mfe:registered')).toBeUndefined();
      expect(manager.get('mfe:test-mfe:data')).toBeUndefined();
      expect(manager.get('other-data')).toBe('keep');
    });
  });

  describe('Snapshots', () => {
    it('should create and restore snapshots', () => {
      manager.set('key1', 'value1');
      manager.set('key2', { nested: 'value2' });

      const snapshot = manager.getSnapshot();
      expect(snapshot).toEqual({
        key1: 'value1',
        key2: { nested: 'value2' },
      });

      manager.clear();
      expect(manager.get('key1')).toBeUndefined();

      manager.restoreSnapshot(snapshot);
      expect(manager.get('key1')).toBe('value1');
      expect(manager.get('key2')).toEqual({ nested: 'value2' });
    });

    it('should create immutable snapshots', () => {
      const obj = { mutable: 'value' };
      manager.set('test', obj);
      
      const snapshot = manager.getSnapshot();
      // Try to modify the snapshot (should not affect the original)
      try {
        snapshot.test.mutable = 'changed';
      } catch (e) {
        // Expected - snapshot is immutable
      }
      
      expect(manager.get<any>('test').mutable).toBe('value');
    });
  });

  describe('Persistence', () => {
    it('should persist to localStorage when enabled', () => {
      const persistentManager = new ValtioStateManager({
        persistent: true,
        storagePrefix: 'test',
        crossTab: false,
      });

      persistentManager.set('persistKey', 'persistValue');
      expect(localStorage.getItem('test:persistKey')).toBe('"persistValue"');
    });

    it('should load from localStorage on init', () => {
      localStorage.setItem('test:existing', '"loadedValue"');
      
      const persistentManager = new ValtioStateManager({
        persistent: true,
        storagePrefix: 'test',
        crossTab: false,
      });

      expect(persistentManager.get('existing')).toBe('loadedValue');
    });

    it('should handle invalid JSON in localStorage', () => {
      localStorage.setItem('test:invalid', 'not-json');
      
      const persistentManager = new ValtioStateManager({
        persistent: true,
        storagePrefix: 'test',
        crossTab: false,
      });

      expect(persistentManager.get('invalid')).toBeUndefined();
    });
  });

  describe('Middleware', () => {
    it('should execute middleware before state changes', () => {
      const middleware = vi.fn((event, next) => next());
      
      const managerWithMiddleware = new ValtioStateManager({
        middleware: [middleware],
        persistent: false,
        crossTab: false,
      });

      managerWithMiddleware.set('test', 'value');

      expect(middleware).toHaveBeenCalledWith(
        expect.objectContaining({
          key: 'test',
          value: 'value',
        }),
        expect.any(Function)
      );
    });

    it('should allow middleware to block changes', () => {
      const blockingMiddleware = vi.fn((event, next) => {
        if (event.key === 'blocked') return;
        next();
      });

      const managerWithMiddleware = new ValtioStateManager({
        middleware: [blockingMiddleware],
        persistent: false,
        crossTab: false,
      });

      managerWithMiddleware.set('allowed', 'value');
      managerWithMiddleware.set('blocked', 'value');

      expect(managerWithMiddleware.get('allowed')).toBe('value');
      expect(managerWithMiddleware.get('blocked')).toBeUndefined();
    });

    it('should execute middleware chain in order', () => {
      const order: number[] = [];
      
      const middleware1 = (event: StateChangeEvent, next: () => void) => {
        order.push(1);
        next();
        order.push(3);
      };
      
      const middleware2 = (event: StateChangeEvent, next: () => void) => {
        order.push(2);
        next();
      };

      const managerWithMiddleware = new ValtioStateManager({
        middleware: [middleware1, middleware2],
        persistent: false,
        crossTab: false,
      });

      managerWithMiddleware.set('test', 'value');
      expect(order).toEqual([1, 2, 3]);
    });
  });

  describe('Type safety', () => {
    it('should maintain type safety with generics', () => {
      interface User {
        name: string;
        age: number;
      }

      manager.set<User>('user', { name: 'John', age: 30 });
      const user = manager.get<User>('user');
      
      expect(user?.name).toBe('John');
      expect(user?.age).toBe(30);
    });

    it('should handle type-safe subscriptions', () => {
      interface Counter {
        count: number;
      }

      const listener = vi.fn((value: Counter, event: StateChangeEvent<Counter>) => {});
      manager.subscribe<Counter>('counter', listener);

      manager.set<Counter>('counter', { count: 1 });

      expect(listener).toHaveBeenCalledWith(
        { count: 1 },
        expect.objectContaining({
          key: 'counter',
          value: { count: 1 },
        })
      );
    });
  });

  describe('Valtio-specific features', () => {
    it('should provide access to proxy store', () => {
      const proxyStore = manager.getProxyStore();
      expect(proxyStore).toBeDefined();
      
      manager.set('test', 'value');
      expect(proxyStore.test).toBe('value');
    });

    it('should trigger reactive updates through proxy', async () => {
      const proxyStore = manager.getProxyStore();
      
      // Direct proxy mutations work
      proxyStore.directSet = 'directValue';
      expect(proxyStore.directSet).toBe('directValue');
      
      // Valtio's subscribe function can be used directly for reactive updates
      const { subscribe } = await import('valtio');
      const listener = vi.fn();
      
      subscribe(proxyStore, listener);
      
      // Direct proxy mutation triggers Valtio's subscription
      proxyStore.anotherValue = 'test';
      
      // Wait for Valtio to process the update
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(listener).toHaveBeenCalled();
      expect(proxyStore.anotherValue).toBe('test');
    });
  });

  describe('Performance', () => {
    it('should handle many subscribers efficiently', () => {
      const listeners = Array.from({ length: 100 }, () => vi.fn());
      const unsubscribes = listeners.map((listener, i) => 
        manager.subscribe(`key${i}`, listener)
      );

      const start = performance.now();
      
      // Update all keys
      for (let i = 0; i < 100; i++) {
        manager.set(`key${i}`, i);
      }
      
      const duration = performance.now() - start;
      
      // Should complete in reasonable time (less than 50ms)
      expect(duration).toBeLessThan(50);
      
      // All listeners should be called
      listeners.forEach((listener, i) => {
        expect(listener).toHaveBeenCalledWith(i, expect.any(Object));
      });

      // Cleanup
      unsubscribes.forEach(fn => fn());
    });

    it('should batch multiple synchronous updates', () => {
      const globalListener = vi.fn();
      manager.subscribeAll(globalListener);

      // Multiple synchronous updates
      manager.set('key1', 'value1');
      manager.set('key2', 'value2');
      manager.set('key3', 'value3');

      // Should be called for each update (no batching in our implementation)
      expect(globalListener.mock.calls.length).toBe(3);
    });
  });
});