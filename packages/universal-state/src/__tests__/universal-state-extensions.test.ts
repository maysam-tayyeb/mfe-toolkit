import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UniversalStateManager } from '../core/universal-state-manager';
import {
  createDerivedState,
  watchPath,
  transaction,
  createSelector,
  createHistory,
  createStateMachine,
} from '../core/universal-state-extensions';

describe('UniversalStateManager Extensions', () => {
  let manager: UniversalStateManager;

  beforeEach(() => {
    manager = new UniversalStateManager({
      persistent: false,
      crossTab: false,
      devtools: false,
    });
  });

  describe('createDerivedState', () => {
    it('should create computed state that updates automatically', async () => {
      manager.set('firstName', 'John');
      manager.set('lastName', 'Doe');

      const getFullName = createDerivedState(
        manager,
        (state) => `${state.firstName || ''} ${state.lastName || ''}`.trim()
      );

      expect(getFullName()).toBe('John Doe');

      manager.set('firstName', 'Jane');
      
      // Wait for Valtio to propagate changes
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(getFullName()).toBe('Jane Doe');
    });

    it('should sync derived state to a key if provided', async () => {
      manager.set('count', 5);

      createDerivedState(
        manager,
        (state) => (state.count || 0) * 2,
        'doubleCount'
      );

      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(manager.get('doubleCount')).toBe(10);

      manager.set('count', 10);
      
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(manager.get('doubleCount')).toBe(20);
    });
  });

  describe('watchPath', () => {
    it('should watch nested paths for changes', async () => {
      const callback = vi.fn();
      
      manager.set('user', { profile: { name: 'John' } });
      
      const unwatch = watchPath(manager, ['user', 'profile', 'name'], callback);
      
      const proxyStore = manager.getProxyStore();
      proxyStore.user.profile.name = 'Jane';
      
      // Wait for Valtio to propagate the change
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(callback).toHaveBeenCalledWith('Jane', 'John');
      
      unwatch();
    });
  });

  describe('transaction', () => {
    it('should batch multiple updates into a single operation', () => {
      const listener = vi.fn();
      manager.subscribeAll(listener);

      transaction(manager, (state) => {
        state.key1 = 'value1';
        state.key2 = 'value2';
        state.key3 = 'value3';
      });

      // batchUpdate still notifies for each key, but all with 'transaction' source
      expect(listener).toHaveBeenCalledTimes(3);
      
      // Verify all calls have transaction source
      for (let i = 0; i < 3; i++) {
        expect(listener).toHaveBeenNthCalledWith(i + 1,
          expect.objectContaining({
            key: expect.stringMatching(/key[123]/),
            source: 'transaction',
          })
        );
      }

      expect(manager.get('key1')).toBe('value1');
      expect(manager.get('key2')).toBe('value2');
      expect(manager.get('key3')).toBe('value3');
    });
  });

  describe('createSelector', () => {
    it('should only notify when selected value changes', async () => {
      const callback = vi.fn();
      
      manager.set('user', { name: 'John', age: 30 });
      
      const selector = createSelector(
        manager,
        (state) => state.user?.name
      );
      
      const unsubscribe = selector.subscribe(callback);
      
      expect(callback).toHaveBeenCalledWith('John');
      callback.mockClear();
      
      // Update age - selector should not fire
      const proxyStore = manager.getProxyStore();
      proxyStore.user = { ...proxyStore.user, age: 31 };
      
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(callback).not.toHaveBeenCalled();
      
      // Update name - selector should fire
      proxyStore.user = { ...proxyStore.user, name: 'Jane' };
      
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(callback).toHaveBeenCalledWith('Jane');
      
      unsubscribe();
    });

    it('should use custom equality function', async () => {
      const callback = vi.fn();
      
      manager.set('items', [1, 2, 3]);
      
      const selector = createSelector(
        manager,
        (state) => state.items || [],
        (a, b) => a.length === b.length // Only care about length
      );
      
      const unsubscribe = selector.subscribe(callback);
      callback.mockClear();
      
      // Update with same length - should not fire
      manager.set('items', [4, 5, 6]);
      
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(callback).not.toHaveBeenCalled();
      
      // Update with different length - should fire
      manager.set('items', [1, 2, 3, 4]);
      
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(callback).toHaveBeenCalledWith([1, 2, 3, 4]);
      
      unsubscribe();
    });
  });

  describe('createHistory', () => {
    it('should track state history for undo/redo', async () => {
      const history = createHistory(manager, { debounceMs: 10 });
      
      manager.set('value', 1);
      await new Promise(resolve => setTimeout(resolve, 20));
      
      manager.set('value', 2);
      await new Promise(resolve => setTimeout(resolve, 20));
      
      manager.set('value', 3);
      await new Promise(resolve => setTimeout(resolve, 20));
      
      expect(manager.get('value')).toBe(3);
      expect(history.canUndo()).toBe(true);
      expect(history.canRedo()).toBe(false);
      
      history.undo();
      expect(manager.get('value')).toBe(2);
      expect(history.canUndo()).toBe(true);
      expect(history.canRedo()).toBe(true);
      
      history.undo();
      expect(manager.get('value')).toBe(1);
      expect(history.canUndo()).toBe(false);
      expect(history.canRedo()).toBe(true);
      
      history.redo();
      expect(manager.get('value')).toBe(2);
    });

    it('should respect max history limit', async () => {
      const history = createHistory(manager, { maxHistory: 2, debounceMs: 10 });
      
      manager.set('value', 1);
      await new Promise(resolve => setTimeout(resolve, 20));
      
      manager.set('value', 2);
      await new Promise(resolve => setTimeout(resolve, 20));
      
      manager.set('value', 3);
      await new Promise(resolve => setTimeout(resolve, 20));
      
      // Should only be able to undo once due to maxHistory
      history.undo();
      expect(manager.get('value')).toBe(2);
      
      expect(history.canUndo()).toBe(false);
    });
  });

  describe('createStateMachine', () => {
    it('should manage state transitions', () => {
      const entryHandler = vi.fn();
      const exitHandler = vi.fn();
      
      const machine = createStateMachine<'idle' | 'loading' | 'success' | 'error', 'FETCH' | 'SUCCESS' | 'ERROR'>(
        manager,
        {
          key: 'fetchState',
          initial: 'idle',
          states: {
            idle: {
              on: { FETCH: 'loading' },
            },
            loading: {
              on: { SUCCESS: 'success', ERROR: 'error' },
              entry: entryHandler,
              exit: exitHandler,
            },
            success: {
              on: { FETCH: 'loading' },
            },
            error: {
              on: { FETCH: 'loading' },
            },
          },
        }
      );
      
      expect(machine.getState()).toBe('idle');
      
      machine.send('FETCH');
      expect(machine.getState()).toBe('loading');
      expect(entryHandler).toHaveBeenCalled();
      
      machine.send('SUCCESS');
      expect(machine.getState()).toBe('success');
      expect(exitHandler).toHaveBeenCalled();
      
      // Invalid transition - should stay in current state
      machine.send('ERROR');
      expect(machine.getState()).toBe('success');
    });

    it('should notify subscribers on state changes', () => {
      const callback = vi.fn();
      
      const machine = createStateMachine<'on' | 'off', 'TOGGLE'>(
        manager,
        {
          key: 'toggleState',
          initial: 'off',
          states: {
            on: { on: { TOGGLE: 'off' } },
            off: { on: { TOGGLE: 'on' } },
          },
        }
      );
      
      const unsubscribe = machine.subscribe(callback);
      
      expect(callback).toHaveBeenCalledWith('off');
      callback.mockClear();
      
      machine.send('TOGGLE');
      expect(callback).toHaveBeenCalledWith('on');
      
      machine.send('TOGGLE');
      expect(callback).toHaveBeenCalledWith('off');
      
      unsubscribe();
    });
  });
});