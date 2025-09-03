import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SimpleEventBus, createEventBus } from '../implementation';
import type { EventPayload } from '../types';

describe('SimpleEventBus', () => {
  let eventBus: SimpleEventBus;

  beforeEach(() => {
    eventBus = new SimpleEventBus('test');
  });

  describe('emit', () => {
    it('should emit events with type and data', () => {
      const handler = vi.fn();
      eventBus.on('test:event', handler);
      
      eventBus.emit('test:event', { message: 'hello' });
      
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'test:event',
          data: { message: 'hello' },
          source: 'test',
          timestamp: expect.any(Number)
        })
      );
    });

    it('should emit EventPayload objects', () => {
      const handler = vi.fn();
      eventBus.on('test:event', handler);
      
      const event: EventPayload = {
        type: 'test:event',
        data: { message: 'hello' },
        timestamp: Date.now(),
        source: 'custom-source'
      };
      
      eventBus.emit(event);
      
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'test:event',
          data: { message: 'hello' },
          source: 'custom-source'
        })
      );
    });
  });

  describe('on', () => {
    it('should subscribe to events', () => {
      const handler = vi.fn();
      const unsubscribe = eventBus.on('test:event', handler);
      
      eventBus.emit('test:event', { test: true });
      expect(handler).toHaveBeenCalledTimes(1);
      
      unsubscribe();
      eventBus.emit('test:event', { test: true });
      expect(handler).toHaveBeenCalledTimes(1); // Still 1, not called again
    });

    it('should handle multiple subscribers', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      
      eventBus.on('test:event', handler1);
      eventBus.on('test:event', handler2);
      
      eventBus.emit('test:event', {});
      
      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);
    });

    it('should support wildcard subscriptions', () => {
      const handler = vi.fn();
      eventBus.on('*', handler);
      
      eventBus.emit('event1', {});
      eventBus.emit('event2', {});
      
      expect(handler).toHaveBeenCalledTimes(2);
    });
  });

  describe('once', () => {
    it('should only fire once', () => {
      const handler = vi.fn();
      eventBus.once('test:event', handler);
      
      eventBus.emit('test:event', {});
      eventBus.emit('test:event', {});
      eventBus.emit('test:event', {});
      
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe('off', () => {
    it('should unsubscribe specific handler', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      
      eventBus.on('test:event', handler1);
      eventBus.on('test:event', handler2);
      
      eventBus.off('test:event', handler1);
      eventBus.emit('test:event', {});
      
      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).toHaveBeenCalledTimes(1);
    });
  });

  describe('removeAllListeners', () => {
    it('should remove all listeners for a specific event', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      
      eventBus.on('test:event', handler1);
      eventBus.on('test:event', handler2);
      
      eventBus.removeAllListeners('test:event');
      eventBus.emit('test:event', {});
      
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

  describe('debugging features', () => {
    it('should track event history', () => {
      eventBus.emit('event1', { data: 1 });
      eventBus.emit('event2', { data: 2 });
      eventBus.emit('event3', { data: 3 });
      
      const history = eventBus.getEventHistory(2);
      expect(history).toHaveLength(2);
      expect(history[0].type).toBe('event2');
      expect(history[1].type).toBe('event3');
    });

    it('should clear event history', () => {
      eventBus.emit('event1', {});
      eventBus.emit('event2', {});
      
      expect(eventBus.getEventHistory()).toHaveLength(2);
      
      eventBus.clearEventHistory();
      expect(eventBus.getEventHistory()).toHaveLength(0);
    });

    it('should provide event statistics', () => {
      eventBus.on('event1', vi.fn());
      eventBus.on('event1', vi.fn());
      eventBus.on('event2', vi.fn());
      
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
  });

  describe('factory function', () => {
    it('should create event bus with config', () => {
      const logger = {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn()
      };
      
      const bus = createEventBus('test', {
        debug: true,
        maxHistorySize: 5,
        logger
      });
      
      bus.emit('test', {});
      expect(logger.debug).toHaveBeenCalled();
    });
  });
});