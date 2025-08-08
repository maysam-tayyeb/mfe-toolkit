import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UniversalStateManager } from '../core/universal-state-manager';

describe('BroadcastChannel Serialization', () => {
  let manager: UniversalStateManager;
  let mockBroadcastChannel: any;
  let postMessageSpy: any;

  beforeEach(() => {
    // Mock BroadcastChannel
    postMessageSpy = vi.fn();
    mockBroadcastChannel = {
      postMessage: postMessageSpy,
      close: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    };

    // Mock BroadcastChannel constructor
    (global as any).BroadcastChannel = vi.fn(() => mockBroadcastChannel);

    manager = new UniversalStateManager({
      crossTab: true,
      persistent: false,
      devtools: false,
    });
  });

  it('should serialize simple values correctly', () => {
    manager.set('simple', 'test value');

    expect(postMessageSpy).toHaveBeenCalledWith({
      type: 'STATE_UPDATE',
      event: {
        key: 'simple',
        value: 'test value',
        previousValue: undefined,
        source: 'unknown',
        timestamp: expect.any(Number),
      },
      instanceId: expect.any(String),
    });
  });

  it('should serialize arrays correctly', () => {
    const testArray = [1, 2, 3, 'test', { nested: true }];
    manager.set('array', testArray);

    expect(postMessageSpy).toHaveBeenCalledWith({
      type: 'STATE_UPDATE',
      event: {
        key: 'array',
        value: [1, 2, 3, 'test', { nested: true }],
        previousValue: undefined,
        source: 'unknown',
        timestamp: expect.any(Number),
      },
      instanceId: expect.any(String),
    });
  });

  it('should serialize objects correctly', () => {
    const testObject = {
      name: 'Test',
      count: 42,
      nested: {
        deep: {
          value: 'nested value',
        },
      },
    };
    manager.set('object', testObject);

    expect(postMessageSpy).toHaveBeenCalledWith({
      type: 'STATE_UPDATE',
      event: {
        key: 'object',
        value: testObject,
        previousValue: undefined,
        source: 'unknown',
        timestamp: expect.any(Number),
      },
      instanceId: expect.any(String),
    });
  });

  it('should handle non-serializable values gracefully', () => {
    // Function should be converted to string
    const funcValue = () => console.log('test');
    manager.set('function', funcValue);

    const call = postMessageSpy.mock.calls[0][0];
    expect(call.type).toBe('STATE_UPDATE');
    expect(typeof call.event.value).toBe('string');
  });

  it('should handle circular references without throwing', () => {
    const circular: any = { name: 'test' };
    circular.self = circular;

    // Should not throw
    expect(() => {
      manager.set('circular', circular);
    }).not.toThrow();

    // Should have been called (even if value is transformed)
    expect(postMessageSpy).toHaveBeenCalled();
  });

  it('should serialize Date objects correctly', () => {
    const testDate = new Date('2024-01-01T00:00:00Z');
    manager.set('date', testDate);

    expect(postMessageSpy).toHaveBeenCalledWith({
      type: 'STATE_UPDATE',
      event: {
        key: 'date',
        value: '2024-01-01T00:00:00.000Z',
        previousValue: undefined,
        source: 'unknown',
        timestamp: expect.any(Number),
      },
      instanceId: expect.any(String),
    });
  });

  it('should handle delete operations with serialization', () => {
    // Set a complex value first
    const complexValue = { nested: { array: [1, 2, 3] } };
    manager.set('toDelete', complexValue);

    postMessageSpy.mockClear();

    // Delete it
    manager.delete('toDelete');

    expect(postMessageSpy).toHaveBeenCalledWith({
      type: 'STATE_DELETE',
      event: {
        key: 'toDelete',
        value: undefined,
        previousValue: { nested: { array: [1, 2, 3] } },
        source: 'delete',
        timestamp: expect.any(Number),
      },
      instanceId: expect.any(String),
    });
  });

  it('should not throw when broadcasting fails', () => {
    // Make postMessage throw an error
    postMessageSpy.mockImplementation(() => {
      throw new Error('Failed to clone');
    });

    // Should not throw
    expect(() => {
      manager.set('willFail', { someValue: true });
    }).not.toThrow();
  });
});
