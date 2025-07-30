import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createTypedEventBus,
  createCustomEventBus,
  type TypedEventBus,
  type EventInterceptor,
} from './typed-event-bus';

// Custom event map for testing
type TestEventMap = {
  'test:string': string;
  'test:number': number;
  'test:object': { id: number; name: string };
  'test:array': string[];
  'test:complex': {
    user: { id: string; name: string };
    action: 'create' | 'update' | 'delete';
    timestamp: number;
  };
};

describe('TypedEventBus', () => {
  let eventBus: TypedEventBus<TestEventMap>;

  beforeEach(() => {
    eventBus = createCustomEventBus<TestEventMap>();
  });

  describe('Type Safety', () => {
    it('should enforce correct data types at compile time', () => {
      const handler = vi.fn();
      eventBus.on('test:string', handler);

      // This should pass TypeScript checks
      eventBus.emit('test:string', 'hello');

      // These would fail TypeScript compilation:
      // eventBus.emit('test:string', 123); // Error: number is not string
      // eventBus.emit('test:string', { invalid: true }); // Error: object is not string

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'test:string',
          data: 'hello',
        })
      );
    });

    it('should provide typed event data in handlers', () => {
      eventBus.on('test:object', (event) => {
        // TypeScript knows event.data has { id: number; name: string }
        expect(event.data.id).toBe(1);
        expect(event.data.name).toBe('test');
      });

      eventBus.emit('test:object', { id: 1, name: 'test' });
    });

    it('should handle complex nested types', () => {
      const handler = vi.fn();
      eventBus.on('test:complex', handler);

      const complexData = {
        user: { id: '123', name: 'John' },
        action: 'create' as const,
        timestamp: Date.now(),
      };

      eventBus.emit('test:complex', complexData);

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'test:complex',
          data: complexData,
        })
      );
    });
  });

  describe('Event Emission and Subscription', () => {
    it('should emit and receive typed events', () => {
      const handler = vi.fn();
      const unsubscribe = eventBus.on('test:string', handler);

      eventBus.emit('test:string', 'test data');

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'test:string',
          data: 'test data',
          timestamp: expect.any(Number),
          source: 'unknown',
        })
      );

      unsubscribe();
      eventBus.emit('test:string', 'second emit');
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should support multiple handlers for same event', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      eventBus.on('test:number', handler1);
      eventBus.on('test:number', handler2);

      eventBus.emit('test:number', 42);

      expect(handler1).toHaveBeenCalledWith(expect.objectContaining({ data: 42 }));
      expect(handler2).toHaveBeenCalledWith(expect.objectContaining({ data: 42 }));
    });

    it('should support wildcard subscription', () => {
      const wildcardHandler = vi.fn();
      eventBus.on('*', wildcardHandler);

      eventBus.emit('test:string', 'hello');
      eventBus.emit('test:number', 123);

      expect(wildcardHandler).toHaveBeenCalledTimes(2);
      expect(wildcardHandler).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({ type: 'test:string', data: 'hello' })
      );
      expect(wildcardHandler).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({ type: 'test:number', data: 123 })
      );
    });

    it('should handle once subscription', () => {
      const handler = vi.fn();
      eventBus.once('test:string', handler);

      eventBus.emit('test:string', 'first');
      eventBus.emit('test:string', 'second');

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(expect.objectContaining({ data: 'first' }));
    });
  });

  describe('Event Options', () => {
    it('should include correlation ID when provided', () => {
      const handler = vi.fn();
      const correlationId = 'corr-123';

      // Track events through interceptor to verify correlation ID
      let capturedEvent: any;
      const busWithInterceptor = createTypedEventBus({
        interceptors: [
          {
            beforeEmit: (event) => {
              capturedEvent = event;
              return event;
            },
          },
        ],
      });

      busWithInterceptor.on('test:string', handler);
      busWithInterceptor.emit('test:string', 'data', { correlationId });

      expect(capturedEvent).toMatchObject({
        correlationId,
        type: 'test:string',
        data: 'data',
      });
    });

    it('should include version when provided', () => {
      const handler = vi.fn();
      const version = '1.0.0';

      // Track events through interceptor to verify version
      let capturedEvent: any;
      const busWithInterceptor = createTypedEventBus({
        interceptors: [
          {
            beforeEmit: (event) => {
              capturedEvent = event;
              return event;
            },
          },
        ],
      });

      busWithInterceptor.on('test:string', handler);
      busWithInterceptor.emit('test:string', 'data', { version });

      expect(capturedEvent).toMatchObject({
        version,
        type: 'test:string',
        data: 'data',
      });
    });

    it('should use custom source when configured', () => {
      const customBus = createCustomEventBus<TestEventMap>({
        source: 'my-mfe',
      });

      const handler = vi.fn();
      customBus.on('test:string', handler);
      customBus.emit('test:string', 'data');

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          source: 'my-mfe',
        })
      );
    });
  });

  describe('waitFor', () => {
    it('should resolve when event is emitted', async () => {
      const promise = eventBus.waitFor('test:string');

      setTimeout(() => {
        eventBus.emit('test:string', 'awaited data');
      }, 10);

      const event = await promise;
      expect(event.data).toBe('awaited data');
    });

    it('should timeout if event is not emitted', async () => {
      await expect(eventBus.waitFor('test:string', { timeout: 50 })).rejects.toThrow(
        'Timeout waiting for event: test:string'
      );
    });

    it('should filter events based on condition', async () => {
      const promise = eventBus.waitFor('test:object', {
        filter: (event) => event.data.id > 5,
      });

      setTimeout(() => {
        eventBus.emit('test:object', { id: 1, name: 'first' });
        eventBus.emit('test:object', { id: 10, name: 'second' });
      }, 10);

      const event = await promise;
      expect(event.data.id).toBe(10);
    });
  });

  describe('Error Handling', () => {
    it('should catch and report handler errors', () => {
      const errorHandler = vi.fn();
      const bus = createCustomEventBus<TestEventMap>({
        onError: errorHandler,
      });

      const faultyHandler = vi.fn().mockImplementation(() => {
        throw new Error('Handler error');
      });

      bus.on('test:string', faultyHandler);
      bus.emit('test:string', 'data');

      expect(errorHandler).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({ type: 'test:string' })
      );
    });

    it('should continue emitting to other handlers after error', () => {
      const handler1 = vi.fn().mockImplementation(() => {
        throw new Error('Handler 1 error');
      });
      const handler2 = vi.fn();

      eventBus.on('test:string', handler1);
      eventBus.on('test:string', handler2);

      eventBus.emit('test:string', 'data');

      expect(handler2).toHaveBeenCalled();
    });
  });

  describe('Event Interceptors', () => {
    it('should apply beforeEmit interceptor', () => {
      const interceptor: EventInterceptor<TestEventMap> = {
        beforeEmit: (event) => ({
          ...event,
          data: 'intercepted' as any,
        }),
      };

      const bus = createCustomEventBus<TestEventMap>({
        interceptors: [interceptor],
      });

      const handler = vi.fn();
      bus.on('test:string', handler);
      bus.emit('test:string', 'original');

      expect(handler).toHaveBeenCalledWith(expect.objectContaining({ data: 'intercepted' }));
    });

    it('should cancel event if interceptor returns null', () => {
      const interceptor: EventInterceptor<TestEventMap> = {
        beforeEmit: () => null,
      };

      const bus = createCustomEventBus<TestEventMap>({
        interceptors: [interceptor],
      });

      const handler = vi.fn();
      bus.on('test:string', handler);
      bus.emit('test:string', 'data');

      expect(handler).not.toHaveBeenCalled();
    });

    it('should apply afterEmit interceptor', () => {
      const afterEmit = vi.fn();
      const interceptor: EventInterceptor<TestEventMap> = {
        afterEmit,
      };

      const bus = createCustomEventBus<TestEventMap>({
        interceptors: [interceptor],
      });

      bus.emit('test:string', 'data');

      expect(afterEmit).toHaveBeenCalledWith(expect.objectContaining({ type: 'test:string' }));
    });

    it('should apply handler interceptors', () => {
      const beforeHandle = vi.fn().mockReturnValue(true);
      const afterHandle = vi.fn();

      const interceptor: EventInterceptor<TestEventMap> = {
        beforeHandle,
        afterHandle,
      };

      const bus = createCustomEventBus<TestEventMap>({
        interceptors: [interceptor],
      });

      const handler = vi.fn();
      bus.on('test:string', handler);
      bus.emit('test:string', 'data');

      expect(beforeHandle).toHaveBeenCalled();
      expect(handler).toHaveBeenCalled();
      expect(afterHandle).toHaveBeenCalled();
    });
  });

  describe('Statistics', () => {
    it('should track event statistics', () => {
      eventBus.on('test:string', vi.fn());
      eventBus.on('test:string', vi.fn());
      eventBus.on('test:number', vi.fn());
      eventBus.on('*', vi.fn());

      eventBus.emit('test:string', 'data1');
      eventBus.emit('test:string', 'data2');
      eventBus.emit('test:number', 42);

      const stats = eventBus.getStats();

      expect(stats.totalEvents).toBe(3);
      expect(stats.eventCounts['test:string']).toBe(2);
      expect(stats.eventCounts['test:number']).toBe(1);
      expect(stats.handlerCounts['test:string']).toBe(2);
      expect(stats.handlerCounts['test:number']).toBe(1);
      expect(stats.wildcardHandlers).toBe(1);
    });

    it('should track errors in statistics', () => {
      const bus = createCustomEventBus<TestEventMap>();

      bus.on('test:string', () => {
        throw new Error('Test error');
      });

      bus.emit('test:string', 'data');

      const stats = bus.getStats();
      expect(stats.errors).toBe(1);
    });
  });

  describe('Clear', () => {
    it('should clear all handlers and stats', () => {
      const handler = vi.fn();
      eventBus.on('test:string', handler);
      eventBus.on('*', handler);
      eventBus.emit('test:string', 'data');

      eventBus.clear();

      const stats = eventBus.getStats();
      expect(stats.totalEvents).toBe(0);
      expect(stats.handlerCounts).toEqual({});
      expect(stats.wildcardHandlers).toBe(0);

      // Handlers should not be called after clear
      eventBus.emit('test:string', 'after clear');
      expect(handler).toHaveBeenCalledTimes(2); // Only from before clear
    });
  });

  describe('MFE Events', () => {
    it('should work with standard MFE events', () => {
      const mfeBus = createTypedEventBus();
      const handler = vi.fn();

      mfeBus.on('mfe:loaded', handler);

      mfeBus.emit('mfe:loaded', {
        name: 'test-mfe',
        version: '1.0.0',
        metadata: { author: 'test' },
      });

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'mfe:loaded',
          data: {
            name: 'test-mfe',
            version: '1.0.0',
            metadata: { author: 'test' },
          },
        })
      );
    });

    it('should handle user events', () => {
      const mfeBus = createTypedEventBus();
      const handler = vi.fn();

      mfeBus.on('user:login', handler);

      mfeBus.emit('user:login', {
        userId: '123',
        username: 'john',
        roles: ['admin', 'user'],
      });

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'user:login',
          data: {
            userId: '123',
            username: 'john',
            roles: ['admin', 'user'],
          },
        })
      );
    });
  });

  describe('Debug Mode', () => {
    it('should log events when debug is enabled', () => {
      const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});

      const bus = createCustomEventBus<TestEventMap>({
        debug: true,
      });

      bus.emit('test:string', 'debug data');

      expect(consoleSpy).toHaveBeenCalledWith(
        '[EventBus] Emitting event: test:string',
        expect.any(Object)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Backward Compatibility', () => {
    it('should work with legacy event patterns', () => {
      const handler = vi.fn();

      // Using 'any' type for legacy compatibility
      (eventBus as any).on('legacy:event', handler);
      (eventBus as any).emit('legacy:event', { legacy: true });

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'legacy:event',
          data: { legacy: true },
        })
      );
    });

    it('should handle mixed typed and untyped usage', () => {
      const typedHandler = vi.fn();
      const untypedHandler = vi.fn();

      // Typed usage
      eventBus.on('test:string', typedHandler);

      // Untyped usage
      (eventBus as any).on('untyped:event', untypedHandler);

      eventBus.emit('test:string', 'typed data');
      (eventBus as any).emit('untyped:event', { any: 'data' });

      expect(typedHandler).toHaveBeenCalled();
      expect(untypedHandler).toHaveBeenCalled();
    });
  });
});
