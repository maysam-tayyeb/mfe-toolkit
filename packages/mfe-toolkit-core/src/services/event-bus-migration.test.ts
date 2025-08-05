import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createMigrationEventBus,
  EventUsageAnalyzer,
  createAnalyzingEventBus,
  generateMigrationGuide,
} from './event-bus-migration';
import { createEventBus } from './event-bus';
import type { EventBus } from '../types';

describe('EventBusMigrationAdapter', () => {
  let migrationBus: EventBus & { typed: any };

  beforeEach(() => {
    migrationBus = createMigrationEventBus();
  });

  describe('Backward Compatibility', () => {
    it('should work with legacy emit/on patterns', () => {
      const handler = vi.fn();
      const unsubscribe = migrationBus.on('test:event', handler);

      migrationBus.emit('test:event', { data: 'test' });

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'test:event',
          data: { data: 'test' },
          timestamp: expect.any(Number),
          source: expect.any(String),
        })
      );

      unsubscribe();
      migrationBus.emit('test:event', { data: 'second' });
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should support wildcard subscriptions', () => {
      const handler = vi.fn();
      migrationBus.on('*', handler);

      migrationBus.emit('event1', 'data1');
      migrationBus.emit('event2', 'data2');

      expect(handler).toHaveBeenCalledTimes(2);
    });

    it('should support once subscriptions', () => {
      const handler = vi.fn();
      migrationBus.once('test:event', handler);

      migrationBus.emit('test:event', 'first');
      migrationBus.emit('test:event', 'second');

      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe('Typed Access', () => {
    it('should provide access to typed event bus', () => {
      expect(migrationBus.typed).toBeDefined();
      expect(typeof migrationBus.typed.emit).toBe('function');
      expect(typeof migrationBus.typed.waitFor).toBe('function');
      expect(typeof migrationBus.typed.getStats).toBe('function');
    });

    it('should allow mixed typed and untyped usage', () => {
      const typedHandler = vi.fn();
      const untypedHandler = vi.fn();

      // Use typed API
      migrationBus.typed.on('mfe:loaded', typedHandler);

      // Use untyped API
      migrationBus.on('mfe:loaded', untypedHandler);

      // Emit using typed API
      migrationBus.typed.emit('mfe:loaded', {
        name: 'test-mfe',
        version: '1.0.0',
      });

      expect(typedHandler).toHaveBeenCalled();
      expect(untypedHandler).toHaveBeenCalled();
    });

    it('should share state between typed and untyped usage', () => {
      const handler = vi.fn();

      // Subscribe using untyped API
      migrationBus.on('test:event', handler);

      // Emit using typed API
      migrationBus.typed.emit('test:event' as any, { test: true });

      expect(handler).toHaveBeenCalled();
    });
  });

  describe('Event Format Conversion', () => {
    it('should convert typed events to legacy format', () => {
      const handler = vi.fn();
      migrationBus.on('test:event', handler);

      migrationBus.typed.emit('test:event' as any, { typed: true });

      expect(handler).toHaveBeenCalledWith({
        type: 'test:event',
        data: { typed: true },
        timestamp: expect.any(Number),
        source: expect.any(String),
      });
    });

    it('should handle events with metadata', () => {
      const handler = vi.fn();
      migrationBus.on('test:event', handler);

      migrationBus.typed.emit(
        'test:event' as any,
        { data: 'test' },
        { correlationId: 'corr-123', version: '1.0' }
      );

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'test:event',
          data: { data: 'test' },
        })
      );
    });
  });
});

describe('EventUsageAnalyzer', () => {
  let analyzer: EventUsageAnalyzer;

  beforeEach(() => {
    analyzer = new EventUsageAnalyzer();
  });

  describe('Event Tracking', () => {
    it('should track emitted events', () => {
      analyzer.trackEmit('user:login', { userId: '123' });
      analyzer.trackEmit('user:logout', { userId: '123' });
      analyzer.trackEmit('user:login', { userId: '456' });

      const eventTypes = analyzer.getEventTypes();
      expect(eventTypes).toEqual(['user:login', 'user:logout']);
    });

    it('should store sample data for events', () => {
      const loginData1 = { userId: '123', name: 'John' };
      const loginData2 = { userId: '456', name: 'Jane' };

      analyzer.trackEmit('user:login', loginData1);
      analyzer.trackEmit('user:login', loginData2);

      const samples = analyzer.getSampleData('user:login');
      expect(samples).toHaveLength(2);
      expect(samples).toContain(loginData1);
      expect(samples).toContain(loginData2);
    });

    it('should handle events with no data', () => {
      analyzer.trackEmit('app:ready', undefined);
      analyzer.trackEmit('app:ready', null);

      const samples = analyzer.getSampleData('app:ready');
      expect(samples).toHaveLength(2);
    });
  });

  describe('Type Generation', () => {
    it('should generate TypeScript definitions from tracked events', () => {
      analyzer.trackEmit('user:login', {
        userId: '123',
        username: 'john',
        admin: true,
      });
      analyzer.trackEmit('app:config', {
        theme: 'dark',
        language: 'en',
      });
      analyzer.trackEmit('data:update', ['item1', 'item2']);

      const typeDefs = analyzer.generateTypeDefinitions();

      expect(typeDefs).toContain('export type AppEventMap = {');
      expect(typeDefs).toContain("'app:config': { theme: string; language: string };");
      expect(typeDefs).toContain("'data:update': unknown[];");
      expect(typeDefs).toContain(
        "'user:login': { userId: string; username: string; admin: boolean };"
      );
    });

    it('should handle primitive types', () => {
      analyzer.trackEmit('count:update', 42);
      analyzer.trackEmit('name:change', 'John');
      analyzer.trackEmit('flag:toggle', true);

      const typeDefs = analyzer.generateTypeDefinitions();

      expect(typeDefs).toContain("'count:update': number;");
      expect(typeDefs).toContain("'flag:toggle': boolean;");
      expect(typeDefs).toContain("'name:change': string;");
    });

    it('should handle null and undefined', () => {
      analyzer.trackEmit('null:event', null);
      analyzer.trackEmit('undefined:event', undefined);

      const typeDefs = analyzer.generateTypeDefinitions();

      expect(typeDefs).toContain("'null:event': null;");
      expect(typeDefs).toContain("'undefined:event': undefined;");
    });
  });

  describe('Reset', () => {
    it('should clear all tracked data', () => {
      analyzer.trackEmit('test:event', { data: 'test' });
      expect(analyzer.getEventTypes()).toHaveLength(1);

      analyzer.reset();

      expect(analyzer.getEventTypes()).toHaveLength(0);
      expect(analyzer.getSampleData('test:event')).toHaveLength(0);
    });
  });
});

describe('createAnalyzingEventBus', () => {
  it('should wrap event bus and track emissions', () => {
    const eventBus = createEventBus();
    const analyzer = new EventUsageAnalyzer();
    const analyzingBus = createAnalyzingEventBus(eventBus, analyzer);

    const handler = vi.fn();
    analyzingBus.on('test:event', handler);

    analyzingBus.emit('test:event', { data: 'test' });

    // Should track the emission
    expect(analyzer.getEventTypes()).toContain('test:event');
    expect(analyzer.getSampleData('test:event')).toHaveLength(1);

    // Should still work as normal event bus
    expect(handler).toHaveBeenCalled();
  });

  it('should not affect subscriptions', () => {
    const eventBus = createEventBus();
    const analyzer = new EventUsageAnalyzer();
    const analyzingBus = createAnalyzingEventBus(eventBus, analyzer);

    const handler = vi.fn();
    const unsubscribe = analyzingBus.on('test:event', handler);

    analyzingBus.emit('test:event', 'data');
    expect(handler).toHaveBeenCalled();

    unsubscribe();
    analyzingBus.emit('test:event', 'data2');
    expect(handler).toHaveBeenCalledTimes(1);
  });
});

describe('generateMigrationGuide', () => {
  it('should generate comprehensive migration guide', () => {
    const analyzer = new EventUsageAnalyzer();

    analyzer.trackEmit('user:login', { userId: '123' });
    analyzer.trackEmit('app:ready', {});
    analyzer.trackEmit('data:sync', { items: [] });

    const guide = generateMigrationGuide(analyzer);

    expect(guide).toContain('# Event Bus Migration Guide');
    expect(guide).toContain('user:login');
    expect(guide).toContain('app:ready');
    expect(guide).toContain('data:sync');
    expect(guide).toContain('export type AppEventMap = {');
    expect(guide).toContain('Step 1: Create Your Event Map');
    expect(guide).toContain('Step 2: Update Your Event Bus Creation');
    expect(guide).toContain('Step 3: Migrate Event Emissions');
    expect(guide).toContain('Step 4: Migrate Event Handlers');
  });

  it('should include code examples in guide', () => {
    const analyzer = new EventUsageAnalyzer();
    analyzer.trackEmit('test:event', {});

    const guide = generateMigrationGuide(analyzer);

    expect(guide).toContain('createTypedEventBus');
    expect(guide).toContain("eventBus.emit('user:login'");
    expect(guide).toContain("eventBus.on('user:login'");
  });
});

describe('Integration Tests', () => {
  it('should allow gradual migration from legacy to typed', () => {
    // Start with legacy event bus
    const legacyBus = createEventBus();
    const handler = vi.fn();

    legacyBus.on('test:event', handler);
    legacyBus.emit('test:event', { legacy: true });

    expect(handler).toHaveBeenCalledTimes(1);

    // Create migration bus with same behavior
    const migrationBus = createMigrationEventBus();
    const newHandler = vi.fn();

    migrationBus.on('test:event', newHandler);
    migrationBus.emit('test:event', { migration: true });

    expect(newHandler).toHaveBeenCalledTimes(1);

    // Use typed API on same bus
    migrationBus.typed.on('test:event' as any, (event) => {
      expect(event.data).toEqual({ typed: true });
    });

    migrationBus.typed.emit('test:event' as any, { typed: true });
  });

  it('should support analyzing existing event bus usage', () => {
    const eventBus = createEventBus();
    const analyzer = new EventUsageAnalyzer();
    const analyzingBus = createAnalyzingEventBus(eventBus, analyzer);

    // Simulate typical app usage
    analyzingBus.emit('app:init', { version: '1.0.0' });
    analyzingBus.emit('user:login', { userId: '123', role: 'admin' });
    analyzingBus.emit('feature:toggle', { feature: 'darkMode', enabled: true });

    // Generate migration artifacts
    const typeDefs = analyzer.generateTypeDefinitions();
    const guide = generateMigrationGuide(analyzer);

    expect(typeDefs).toContain("'app:init':");
    expect(typeDefs).toContain("'user:login':");
    expect(typeDefs).toContain("'feature:toggle':");
    expect(guide).toContain('app:init');
  });
});
