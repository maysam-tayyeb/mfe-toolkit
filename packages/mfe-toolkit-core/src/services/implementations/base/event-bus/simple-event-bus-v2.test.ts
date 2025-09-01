/**
 * Tests for Simplified Event Bus Implementation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SimplifiedEventBusImpl, createSimplifiedEventBus, EventFlowDebugger } from './simple-event-bus-v2';
import { Events, MFEEvents } from '../../../../domain/events';
import type { BaseEvent } from '../../../../domain/events';

describe('SimplifiedEventBus', () => {
  let eventBus: SimplifiedEventBusImpl;
  
  beforeEach(() => {
    eventBus = new SimplifiedEventBusImpl('test');
  });

  describe('emit', () => {
    it('should emit with type and data (legacy)', () => {
      const handler = vi.fn();
      eventBus.on('test:event', handler);
      
      eventBus.emit('test:event', { value: 42 });
      
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'test:event',
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

    it('should handle wildcard listeners', () => {
      const handler = vi.fn();
      eventBus.on('*', handler);
      
      eventBus.emit('any:event', { test: true });
      
      expect(handler).toHaveBeenCalled();
    });
  });

  describe('on/off', () => {
    it('should subscribe and unsubscribe', () => {
      const handler = vi.fn();
      const unsubscribe = eventBus.on('test:event', handler);
      
      eventBus.emit('test:event', {});
      expect(handler).toHaveBeenCalledTimes(1);
      
      unsubscribe();
      eventBus.emit('test:event', {});
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple handlers', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      
      eventBus.on('test:event', handler1);
      eventBus.on('test:event', handler2);
      
      eventBus.emit('test:event', {});
      
      expect(handler1).toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
    });
  });

  describe('once', () => {
    it('should only trigger once', () => {
      const handler = vi.fn();
      eventBus.once('test:event', handler);
      
      eventBus.emit('test:event', {});
      eventBus.emit('test:event', {});
      
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe('removeAllListeners', () => {
    it('should remove all listeners for a type', () => {
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
      eventBus.emit('test:event', { value: 42 });
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '[EventBus] test:event',
        expect.objectContaining({ type: 'test:event' })
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('type safety', () => {
    it('should provide type safety with MFEEventMap', () => {
      const handler = vi.fn<[BaseEvent<'mfe:loaded', any>], void>();
      
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

describe('createSimplifiedEventBus factory', () => {
  it('should create an event bus instance', () => {
    const eventBus = createSimplifiedEventBus('factory-test');
    
    expect(eventBus).toBeDefined();
    expect(eventBus.emit).toBeDefined();
    expect(eventBus.on).toBeDefined();
    expect(eventBus.once).toBeDefined();
  });
});