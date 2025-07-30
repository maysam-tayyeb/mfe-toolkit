import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createEventBus } from './event-bus';
import type { EventBus } from '../types';

describe('EventBus', () => {
  let eventBus: EventBus;

  beforeEach(() => {
    // Use legacy implementation for these tests
    eventBus = createEventBus({ useLegacy: true });
  });

  describe('on (subscribe)', () => {
    it('should subscribe to events', () => {
      const handler = vi.fn();
      const unsubscribe = eventBus.on('test-event', handler);

      expect(typeof unsubscribe).toBe('function');
    });

    it('should call handler when event is emitted', () => {
      const handler = vi.fn();
      eventBus.on('test-event', handler);

      const testData = { data: 'test' };
      eventBus.emit('test-event', testData);

      expect(handler).toHaveBeenCalledWith({
        type: 'test-event',
        data: testData,
        timestamp: expect.any(Number),
        source: 'unknown',
      });
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple subscribers', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      eventBus.on('test-event', handler1);
      eventBus.on('test-event', handler2);

      const testData = { data: 'test' };
      eventBus.emit('test-event', testData);

      expect(handler1).toHaveBeenCalledWith({
        type: 'test-event',
        data: testData,
        timestamp: expect.any(Number),
        source: 'unknown',
      });
      expect(handler2).toHaveBeenCalledWith({
        type: 'test-event',
        data: testData,
        timestamp: expect.any(Number),
        source: 'unknown',
      });
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

  describe('off (unsubscribe)', () => {
    it('should unsubscribe from events', () => {
      const handler = vi.fn();
      const unsubscribe = eventBus.on('test-event', handler);

      unsubscribe();
      eventBus.emit('test-event', { data: 'test' });

      expect(handler).not.toHaveBeenCalled();
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
  });

  describe('emit', () => {
    it('should emit events with payload', () => {
      const handler = vi.fn();
      eventBus.on('test-event', handler);

      const payload = { id: 1, message: 'test' };
      eventBus.emit('test-event', payload);

      expect(handler).toHaveBeenCalledWith({
        type: 'test-event',
        data: payload,
        timestamp: expect.any(Number),
        source: 'unknown',
      });
    });

    it('should handle events with no subscribers', () => {
      expect(() => {
        eventBus.emit('no-subscribers', { data: 'test' });
      }).not.toThrow();
    });

    it('should handle events with undefined payload', () => {
      const handler = vi.fn();
      eventBus.on('test-event', handler);

      eventBus.emit('test-event', undefined);

      expect(handler).toHaveBeenCalledWith({
        type: 'test-event',
        data: undefined,
        timestamp: expect.any(Number),
        source: 'unknown',
      });
    });
  });

  describe('once', () => {
    it('should handle one-time event subscription', () => {
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
});
