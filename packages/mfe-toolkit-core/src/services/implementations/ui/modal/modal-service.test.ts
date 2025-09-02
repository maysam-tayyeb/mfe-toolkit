import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ModalServiceImpl, createModalService } from './modal-service';
import type { ModalService, BaseModalConfig } from '../../../../services/types';

describe('ModalServiceImpl', () => {
  let modalService: ModalService;
  let addEventListenerSpy: ReturnType<typeof vi.spyOn>;
  let removeEventListenerSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    modalService = new ModalServiceImpl();
    
    // Mock window event listeners
    addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    modalService.dispose();
  });

  describe('open', () => {
    it('should open a modal and return an ID', () => {
      const config: BaseModalConfig = {
        title: 'Test Modal',
        content: 'Test content',
      };

      const id = modalService.open(config);

      expect(id).toBeDefined();
      expect(id).toMatch(/^modal-\d+-\d+$/);
      expect(modalService.isOpen(id)).toBe(true);
    });

    it('should add modal to stack', () => {
      const config1: BaseModalConfig = { title: 'Modal 1' };
      const config2: BaseModalConfig = { title: 'Modal 2' };

      const id1 = modalService.open(config1);
      const id2 = modalService.open(config2);

      const openModals = modalService.getOpenModals();
      expect(openModals).toHaveLength(2);
      expect(openModals[0].id).toBe(id1);
      expect(openModals[1].id).toBe(id2);
    });

    it('should setup escape handler by default', () => {
      const config: BaseModalConfig = { title: 'Test Modal' };
      modalService.open(config);

      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    it('should not setup escape handler when closeOnEscape is false', () => {
      const config: BaseModalConfig = {
        title: 'Test Modal',
        closeOnEscape: false,
      };
      modalService.open(config);

      expect(addEventListenerSpy).not.toHaveBeenCalled();
    });

    it('should call onClose when modal is closed', () => {
      const onCloseSpy = vi.fn();
      const config: BaseModalConfig = {
        title: 'Test Modal',
        onClose: onCloseSpy,
      };

      const id = modalService.open(config);
      modalService.close(id);

      expect(onCloseSpy).toHaveBeenCalled();
    });
  });

  describe('close', () => {
    it('should close a specific modal by ID', () => {
      const id = modalService.open({ title: 'Test' });
      
      expect(modalService.isOpen(id)).toBe(true);
      modalService.close(id);
      expect(modalService.isOpen(id)).toBe(false);
    });

    it('should close topmost modal when no ID provided', () => {
      const id1 = modalService.open({ title: 'Modal 1' });
      const id2 = modalService.open({ title: 'Modal 2' });

      modalService.close(); // Close topmost (Modal 2)

      expect(modalService.isOpen(id1)).toBe(true);
      expect(modalService.isOpen(id2)).toBe(false);
    });

    it('should handle closing non-existent modal gracefully', () => {
      expect(() => modalService.close('non-existent')).not.toThrow();
    });

    it('should remove modal from stack', () => {
      const id1 = modalService.open({ title: 'Modal 1' });
      const id2 = modalService.open({ title: 'Modal 2' });
      const id3 = modalService.open({ title: 'Modal 3' });

      modalService.close(id2); // Close middle modal

      const openModals = modalService.getOpenModals();
      expect(openModals).toHaveLength(2);
      expect(openModals.map(m => m.id)).toEqual([id1, id3]);
    });

    it('should call onClose callback', () => {
      const onCloseSpy = vi.fn();
      const id = modalService.open({
        title: 'Test',
        onClose: onCloseSpy,
      });

      modalService.close(id);
      expect(onCloseSpy).toHaveBeenCalled();
    });

    it('should do nothing when no modals are open', () => {
      expect(() => modalService.close()).not.toThrow();
    });
  });

  describe('closeAll', () => {
    it('should close all modals in reverse order', () => {
      const onClose1 = vi.fn();
      const onClose2 = vi.fn();
      const onClose3 = vi.fn();

      const id1 = modalService.open({ title: 'Modal 1', onClose: onClose1 });
      const id2 = modalService.open({ title: 'Modal 2', onClose: onClose2 });
      const id3 = modalService.open({ title: 'Modal 3', onClose: onClose3 });

      modalService.closeAll();

      expect(modalService.isOpen()).toBe(false);
      expect(modalService.getOpenModals()).toHaveLength(0);

      // Check callbacks were called in reverse order
      expect(onClose3.mock.invocationCallOrder[0]).toBeLessThan(onClose2.mock.invocationCallOrder[0]);
      expect(onClose2.mock.invocationCallOrder[0]).toBeLessThan(onClose1.mock.invocationCallOrder[0]);
    });

    it('should handle empty modal stack', () => {
      expect(() => modalService.closeAll()).not.toThrow();
    });
  });

  describe('update', () => {
    it('should update modal config', () => {
      const id = modalService.open({
        title: 'Original Title',
        content: 'Original Content',
      });

      modalService.update(id, {
        title: 'Updated Title',
      });

      const openModals = modalService.getOpenModals();
      expect(openModals[0].config.title).toBe('Updated Title');
      expect(openModals[0].config.content).toBe('Original Content'); // Unchanged
    });

    it('should handle updating non-existent modal', () => {
      expect(() => modalService.update('non-existent', { title: 'New' })).not.toThrow();
    });

    it('should notify listeners on update', () => {
      const listener = vi.fn();
      modalService.subscribe(listener);
      
      const id = modalService.open({ title: 'Test' });
      listener.mockClear(); // Clear initial call

      modalService.update(id, { title: 'Updated' });
      
      expect(listener).toHaveBeenCalled();
    });
  });

  describe('isOpen', () => {
    it('should check if specific modal is open', () => {
      const id = modalService.open({ title: 'Test' });
      
      expect(modalService.isOpen(id)).toBe(true);
      expect(modalService.isOpen('non-existent')).toBe(false);
    });

    it('should check if any modal is open when no ID provided', () => {
      expect(modalService.isOpen()).toBe(false);
      
      const id = modalService.open({ title: 'Test' });
      expect(modalService.isOpen()).toBe(true);
      
      modalService.close(id);
      expect(modalService.isOpen()).toBe(false);
    });
  });

  describe('getOpenModals', () => {
    it('should return empty array when no modals open', () => {
      expect(modalService.getOpenModals()).toEqual([]);
    });

    it('should return modals in stack order', () => {
      const config1: BaseModalConfig = { title: 'Modal 1' };
      const config2: BaseModalConfig = { title: 'Modal 2' };
      const config3: BaseModalConfig = { title: 'Modal 3' };

      const id1 = modalService.open(config1);
      const id2 = modalService.open(config2);
      const id3 = modalService.open(config3);

      const openModals = modalService.getOpenModals();
      
      expect(openModals).toHaveLength(3);
      expect(openModals[0]).toEqual({ id: id1, config: config1 });
      expect(openModals[1]).toEqual({ id: id2, config: config2 });
      expect(openModals[2]).toEqual({ id: id3, config: config3 });
    });
  });

  describe('subscribe', () => {
    it('should notify subscriber immediately with current state', () => {
      const listener = vi.fn();
      
      modalService.open({ title: 'Existing Modal' });
      modalService.subscribe(listener);

      expect(listener).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({
          config: expect.objectContaining({ title: 'Existing Modal' }),
        }),
      ]));
    });

    it('should notify subscribers on open', () => {
      const listener = vi.fn();
      modalService.subscribe(listener);
      listener.mockClear(); // Clear initial call

      modalService.open({ title: 'New Modal' });

      expect(listener).toHaveBeenCalled();
    });

    it('should notify subscribers on close', () => {
      const listener = vi.fn();
      const id = modalService.open({ title: 'Test' });
      
      modalService.subscribe(listener);
      listener.mockClear(); // Clear initial call

      modalService.close(id);

      expect(listener).toHaveBeenCalled();
    });

    it('should support multiple subscribers', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      modalService.subscribe(listener1);
      modalService.subscribe(listener2);

      listener1.mockClear();
      listener2.mockClear();

      modalService.open({ title: 'Test' });

      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
    });

    it('should unsubscribe when calling returned function', () => {
      const listener = vi.fn();
      const unsubscribe = modalService.subscribe(listener);
      
      listener.mockClear();
      unsubscribe();

      modalService.open({ title: 'Test' });

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('Escape key handling', () => {
    it('should close topmost modal on Escape key', () => {
      const id1 = modalService.open({ title: 'Modal 1' });
      const id2 = modalService.open({ title: 'Modal 2' });

      // Get the last event handler that was registered (for the topmost modal)
      const calls = addEventListenerSpy.mock.calls.filter(call => call[0] === 'keydown');
      const handler = calls[calls.length - 1][1] as EventListener;

      // Simulate Escape key press
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      handler(escapeEvent);

      expect(modalService.isOpen(id1)).toBe(true);
      expect(modalService.isOpen(id2)).toBe(false); // Topmost closed
    });

    it('should not close modal on other keys', () => {
      const id = modalService.open({ title: 'Test' });

      const handler = addEventListenerSpy.mock.calls.find(
        call => call[0] === 'keydown'
      )?.[1] as EventListener;

      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      handler(enterEvent);

      expect(modalService.isOpen(id)).toBe(true);
    });

    it('should only close topmost modal when multiple modals open', () => {
      const id1 = modalService.open({ title: 'Modal 1' });
      const id2 = modalService.open({ title: 'Modal 2' });
      const id3 = modalService.open({ title: 'Modal 3' });

      // Get handlers for each modal
      const handlers = addEventListenerSpy.mock.calls
        .filter(call => call[0] === 'keydown')
        .map(call => call[1] as EventListener);

      // Simulate Escape on first handler (should not close anything since it's not topmost)
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      handlers[0](escapeEvent);

      expect(modalService.isOpen(id1)).toBe(true);
      expect(modalService.isOpen(id2)).toBe(true);
      expect(modalService.isOpen(id3)).toBe(true);

      // Simulate Escape on last handler (should close topmost)
      handlers[2](escapeEvent);

      expect(modalService.isOpen(id1)).toBe(true);
      expect(modalService.isOpen(id2)).toBe(true);
      expect(modalService.isOpen(id3)).toBe(false);
    });

    it('should cleanup event listener when modal is closed', () => {
      const id = modalService.open({ title: 'Test' });
      
      const handler = addEventListenerSpy.mock.calls.find(
        call => call[0] === 'keydown'
      )?.[1];

      modalService.close(id);

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', handler);
    });
  });

  describe('dispose', () => {
    it('should close all modals and clear listeners', () => {
      const listener = vi.fn();
      
      modalService.open({ title: 'Modal 1' });
      modalService.open({ title: 'Modal 2' });
      modalService.subscribe(listener);

      modalService.dispose();

      expect(modalService.isOpen()).toBe(false);
      expect(modalService.getOpenModals()).toHaveLength(0);

      // Verify listener is cleared by trying to trigger it
      listener.mockClear();
      modalService.open({ title: 'New Modal' });
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('createModalService factory', () => {
    it('should create a new modal service instance', () => {
      const service = createModalService();
      
      expect(service).toBeInstanceOf(ModalServiceImpl);
      expect(service.isOpen()).toBe(false);
    });

    it('should support custom modal config types', () => {
      interface CustomModalConfig extends BaseModalConfig {
        customProp?: string;
      }

      const service = createModalService<CustomModalConfig>();
      const id = service.open({
        title: 'Custom Modal',
        customProp: 'custom value',
      });

      const modals = service.getOpenModals();
      expect(modals[0].config).toHaveProperty('customProp', 'custom value');
    });
  });

  describe('Edge cases', () => {
    it('should handle rapid open/close operations', () => {
      const ids: string[] = [];
      
      for (let i = 0; i < 10; i++) {
        ids.push(modalService.open({ title: `Modal ${i}` }));
      }

      for (const id of ids) {
        modalService.close(id);
      }

      expect(modalService.isOpen()).toBe(false);
    });

    it('should generate unique IDs', () => {
      const ids = new Set<string>();
      
      for (let i = 0; i < 100; i++) {
        const id = modalService.open({ title: 'Test' });
        expect(ids.has(id)).toBe(false);
        ids.add(id);
      }
    });

    it('should handle undefined window object', () => {
      // Temporarily remove window
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;

      expect(() => {
        const service = new ModalServiceImpl();
        service.open({ title: 'Test', closeOnEscape: true });
      }).not.toThrow();

      // Restore window
      global.window = originalWindow;
    });
  });
});