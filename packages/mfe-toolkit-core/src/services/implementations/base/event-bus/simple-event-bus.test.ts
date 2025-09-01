/**
 * Tests for Simple Event Bus Implementation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SimpleEventBus, createSimpleEventBus, EventFlowDebugger } from './simple-event-bus';
import { Events, MFEEvents } from '../../../../domain/events';
import type { EventPayload } from '../../../../domain/events';
import type { EventBus } from '../../../../services/types/event-bus';

describe('SimpleEventBus', () => {
  let eventBus: EventBus;
  
  beforeEach(() => {
    eventBus = new SimpleEventBus('test');
  });

  describe('emit', () => {
    it('should emit with type and data (legacy)', () => {
      const handler = vi.fn();
      eventBus.on('test-event', handler);
      
      eventBus.emit('test-event', { value: 42 });
      
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'test-event',
          data: { value: 42 },
          source: 'test',
        })
      );
    });

    it('should emit with typed event constant', () => {
      const handler = vi.fn();
      eventBus.on(MFEEvents.LOADED, handler);
      
      eventBus.emit(MFEEvents.LOADED, {
        name: 'test-mfe',
        version: '1.0.0',
      });
      
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'mfe:loaded',
          data: { name: 'test-mfe', version: '1.0.0' },
        })
      );
    });

    it('should emit with event factory', () => {
      const handler = vi.fn();
      eventBus.on('mfe:ready', handler);
      
      const event = Events.mfeReady('test-mfe', ['feature1', 'feature2']);
      eventBus.emit(event);
      
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'mfe:ready',
          data: {
            name: 'test-mfe',
            capabilities: ['feature1', 'feature2'],
          },
        })
      );
    });

    it('should handle events with undefined payload', () => {
      const handler = vi.fn();
      eventBus.on('test-event', handler);

      eventBus.emit('test-event', undefined);

      expect(handler).toHaveBeenCalledWith({
        type: 'test-event',
        data: undefined,
        timestamp: expect.any(Number),
        source: 'test',
      });
    });

    it('should handle events with no subscribers', () => {
      expect(() => {
        eventBus.emit('no-subscribers', { data: 'test' });
      }).not.toThrow();
    });
  });

  describe('on/off', () => {
    it('should subscribe and unsubscribe', () => {
      const handler = vi.fn();
      const unsubscribe = eventBus.on('test-event', handler);
      
      eventBus.emit('test-event', {});
      expect(handler).toHaveBeenCalledTimes(1);
      
      unsubscribe();
      eventBus.emit('test-event', {});
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple handlers', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      
      eventBus.on('test-event', handler1);
      eventBus.on('test-event', handler2);
      
      eventBus.emit('test-event', {});
      
      expect(handler1).toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
    });

    it('should only unsubscribe the specific handler', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      const unsubscribe1 = eventBus.on('test-event', handler1);
      eventBus.on('test-event', handler2);

      unsubscribe1();
      eventBus.emit('test-event', { data: 'test' });

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).toHaveBeenCalledTimes(1);
    });

    it('should not call handlers for different events', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      eventBus.on('event1', handler1);
      eventBus.on('event2', handler2);

      eventBus.emit('event1', { data: 'test' });

      expect(handler1).toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
    });
  });

  describe('once', () => {
    it('should only trigger once', () => {
      const handler = vi.fn();
      eventBus.once('test-event', handler);
      
      eventBus.emit('test-event', { data: 'first' });
      eventBus.emit('test-event', { data: 'second' });
      
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe('wildcard listener', () => {
    it('should listen to all events with wildcard', () => {
      const handler = vi.fn();
      const unsubscribe = eventBus.on('*', handler);

      eventBus.emit('event.one', { data: 1 });
      eventBus.emit('event.two', { data: 2 });
      eventBus.emit('event.three', { data: 3 });

      expect(handler).toHaveBeenCalledTimes(3);
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'event.one',
          data: { data: 1 },
        })
      );
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'event.two',
          data: { data: 2 },
        })
      );
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'event.three',
          data: { data: 3 },
        })
      );

      // Test unsubscribe
      unsubscribe();
      eventBus.emit('event.four', { data: 4 });
      expect(handler).toHaveBeenCalledTimes(3);
    });

    it('should work alongside specific event listeners', () => {
      const wildcardHandler = vi.fn();
      const specificHandler = vi.fn();

      eventBus.on('*', wildcardHandler);
      eventBus.on('specific.event', specificHandler);

      eventBus.emit('specific.event', { data: 'test' });
      eventBus.emit('other.event', { data: 'other' });

      expect(wildcardHandler).toHaveBeenCalledTimes(2);
      expect(specificHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe('removeAllListeners', () => {
    it('should remove all listeners for a type', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      
      eventBus.on('test-event', handler1);
      eventBus.on('test-event', handler2);
      
      eventBus.removeAllListeners('test-event');
      eventBus.emit('test-event', {});
      
      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
    });

    it('should remove all listeners when no type specified', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      
      eventBus.on('event1', handler1);
      eventBus.on('event2', handler2);
      
      eventBus.removeAllListeners();
      
      eventBus.emit('event1', {});
      eventBus.emit('event2', {});
      
      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
    });
  });

  describe('listenerCount', () => {
    it('should return the number of listeners for an event', () => {
      eventBus.on('test-event', () => {});
      eventBus.on('test-event', () => {});
      eventBus.on('other-event', () => {});
      
      expect(eventBus.listenerCount('test-event')).toBe(2);
      expect(eventBus.listenerCount('other-event')).toBe(1);
      expect(eventBus.listenerCount('non-existent')).toBe(0);
    });
  });

  describe('getEventTypes', () => {
    it('should return all registered event types', () => {
      eventBus.on('event1', () => {});
      eventBus.on('event2', () => {});
      eventBus.on('event3', () => {});
      
      const types = eventBus.getEventTypes();
      
      expect(types).toContain('event1');
      expect(types).toContain('event2');
      expect(types).toContain('event3');
      expect(types).toHaveLength(3);
    });
  });

  describe('debugging features', () => {
    it('should track event history', () => {
      eventBus.emit('event1', { value: 1 });
      eventBus.emit('event2', { value: 2 });
      eventBus.emit('event3', { value: 3 });
      
      const history = eventBus.getEventHistory(2);
      
      expect(history).toHaveLength(2);
      expect(history[0].type).toBe('event2');
      expect(history[1].type).toBe('event3');
    });

    it('should clear event history', () => {
      eventBus.emit('event1', {});
      eventBus.emit('event2', {});
      
      eventBus.clearEventHistory();
      const history = eventBus.getEventHistory();
      
      expect(history).toHaveLength(0);
    });

    it('should track event statistics', () => {
      eventBus.on('event1', () => {});
      eventBus.on('event1', () => {});
      eventBus.on('event2', () => {});
      
      eventBus.emit('event1', {});
      eventBus.emit('event1', {});
      eventBus.emit('event2', {});
      
      const stats = eventBus.getEventStats();
      
      expect(stats.totalEmitted).toBe(3);
      expect(stats.totalHandlers).toBe(3);
      expect(stats.eventCounts['event1']).toBe(2);
      expect(stats.eventCounts['event2']).toBe(1);
      expect(stats.handlerCounts['event1']).toBe(2);
      expect(stats.handlerCounts['event2']).toBe(1);
    });

    it('should enable/disable logging', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      eventBus.enableLogging(true);
      eventBus.emit('test-event', { value: 42 });
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '[EventBus] test-event',
        expect.objectContaining({ type: 'test-event' })
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('type safety', () => {
    it('should provide type safety with MFEEventMap', () => {
      const handler = vi.fn<(event: EventPayload<'mfe:loaded', any>) => void>();
      
      eventBus.on('mfe:loaded', handler);
      
      eventBus.emit('mfe:loaded', {
        name: 'test-mfe',
        version: '1.0.0',
        // TypeScript would catch if we added invalid properties
      });
      
      expect(handler).toHaveBeenCalled();
      const event = handler.mock.calls[0][0];
      expect(event.data.name).toBe('test-mfe');
      expect(event.data.version).toBe('1.0.0');
    });
  });

  describe('EventFlowDebugger', () => {
    it('should track event flows', () => {
      const flowDebugger = new EventFlowDebugger(eventBus);
      
      eventBus.on('event1', () => {});
      eventBus.on('event1', () => {});
      eventBus.on('event2', () => {});
      
      eventBus.emit('event1', {});
      eventBus.emit('event2', {});
      
      const diagram = flowDebugger.getFlowDiagram();
      
      expect(diagram).toContain('event1');
      expect(diagram).toContain('event2');
      expect(diagram).toContain('Listeners: 2');
      expect(diagram).toContain('Listeners: 1');
    });
  });
});

describe('createSimpleEventBus factory', () => {
  it('should create an event bus instance', () => {
    const eventBus = createSimpleEventBus('factory-test');
    
    expect(eventBus).toBeDefined();
    expect(eventBus.emit).toBeDefined();
    expect(eventBus.on).toBeDefined();
    expect(eventBus.once).toBeDefined();
    expect(eventBus.removeAllListeners).toBeDefined();
    expect(eventBus.listenerCount).toBeDefined();
    expect(eventBus.getEventTypes).toBeDefined();
  });

  it('should use default source when not provided', () => {
    const eventBus = createSimpleEventBus();
    const handler = vi.fn();
    
    eventBus.on('test-event', handler);
    eventBus.emit('test-event', {});
    
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({
        source: 'container'
      })
    );
  });
});