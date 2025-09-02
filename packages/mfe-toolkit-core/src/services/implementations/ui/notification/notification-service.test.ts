import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NotificationServiceImpl, createNotificationService } from './notification-service';
import type { NotificationService, NotificationConfig } from '../../../../services/types';

describe('NotificationServiceImpl', () => {
  let notificationService: NotificationService;

  beforeEach(() => {
    notificationService = new NotificationServiceImpl();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('show', () => {
    it('should show a notification and return ID', () => {
      const config: NotificationConfig = {
        type: 'info',
        title: 'Test Notification',
        message: 'Test message',
      };

      const id = notificationService.show(config);

      expect(id).toBeDefined();
      expect(id).toMatch(/^notification-\d+$/);
    });

    it('should use provided ID if specified', () => {
      const config: NotificationConfig = {
        id: 'custom-id',
        type: 'info',
        title: 'Test',
      };

      const id = notificationService.show(config);

      expect(id).toBe('custom-id');
    });

    it('should auto-dismiss after default duration', () => {
      const config: NotificationConfig = {
        type: 'info',
        title: 'Auto-dismiss test',
      };

      const id = notificationService.show(config);
      const dismissSpy = vi.spyOn(notificationService, 'dismiss');

      // Default duration is 5000ms
      vi.advanceTimersByTime(4999);
      expect(dismissSpy).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(dismissSpy).toHaveBeenCalledWith(id);
    });

    it('should auto-dismiss after custom duration', () => {
      const config: NotificationConfig = {
        type: 'info',
        title: 'Custom duration',
        duration: 2000,
      };

      const id = notificationService.show(config);
      const dismissSpy = vi.spyOn(notificationService, 'dismiss');

      vi.advanceTimersByTime(1999);
      expect(dismissSpy).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(dismissSpy).toHaveBeenCalledWith(id);
    });

    it('should not auto-dismiss when duration is 0', () => {
      const config: NotificationConfig = {
        type: 'info',
        title: 'Persistent notification',
        duration: 0,
      };

      const id = notificationService.show(config);
      const dismissSpy = vi.spyOn(notificationService, 'dismiss');

      vi.advanceTimersByTime(10000);
      expect(dismissSpy).not.toHaveBeenCalled();
    });

    it('should notify listeners when notification is shown', () => {
      const listener = vi.fn();
      notificationService.subscribe(listener);
      listener.mockClear(); // Clear initial call

      const config: NotificationConfig = {
        type: 'info',
        title: 'Test',
      };

      notificationService.show(config);

      expect(listener).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'info',
            title: 'Test',
          }),
        ])
      );
    });
  });

  describe('success', () => {
    it('should create success notification', () => {
      const listener = vi.fn();
      notificationService.subscribe(listener);
      listener.mockClear();

      const id = notificationService.success('Success!', 'Operation completed');

      expect(id).toBeDefined();
      expect(listener).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'success',
            title: 'Success!',
            message: 'Operation completed',
          }),
        ])
      );
    });

    it('should auto-dismiss success notifications', () => {
      const id = notificationService.success('Success!');
      const dismissSpy = vi.spyOn(notificationService, 'dismiss');

      vi.advanceTimersByTime(5000);
      expect(dismissSpy).toHaveBeenCalledWith(id);
    });
  });

  describe('error', () => {
    it('should create error notification', () => {
      const listener = vi.fn();
      notificationService.subscribe(listener);
      listener.mockClear();

      const id = notificationService.error('Error!', 'Something went wrong');

      expect(id).toBeDefined();
      expect(listener).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'error',
            title: 'Error!',
            message: 'Something went wrong',
          }),
        ])
      );
    });

    it('should not auto-dismiss error notifications', () => {
      const id = notificationService.error('Error!');
      const dismissSpy = vi.spyOn(notificationService, 'dismiss');

      vi.advanceTimersByTime(10000);
      expect(dismissSpy).not.toHaveBeenCalled();
    });
  });

  describe('warning', () => {
    it('should create warning notification', () => {
      const listener = vi.fn();
      notificationService.subscribe(listener);
      listener.mockClear();

      const id = notificationService.warning('Warning!', 'Be careful');

      expect(id).toBeDefined();
      expect(listener).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'warning',
            title: 'Warning!',
            message: 'Be careful',
          }),
        ])
      );
    });

    it('should auto-dismiss warning notifications', () => {
      const id = notificationService.warning('Warning!');
      const dismissSpy = vi.spyOn(notificationService, 'dismiss');

      vi.advanceTimersByTime(5000);
      expect(dismissSpy).toHaveBeenCalledWith(id);
    });
  });

  describe('info', () => {
    it('should create info notification', () => {
      const listener = vi.fn();
      notificationService.subscribe(listener);
      listener.mockClear();

      const id = notificationService.info('Info', 'For your information');

      expect(id).toBeDefined();
      expect(listener).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'info',
            title: 'Info',
            message: 'For your information',
          }),
        ])
      );
    });

    it('should auto-dismiss info notifications', () => {
      const id = notificationService.info('Info');
      const dismissSpy = vi.spyOn(notificationService, 'dismiss');

      vi.advanceTimersByTime(5000);
      expect(dismissSpy).toHaveBeenCalledWith(id);
    });
  });

  describe('dismiss', () => {
    it('should dismiss a specific notification', () => {
      const id = notificationService.show({ type: 'info', title: 'Test' });
      
      const listener = vi.fn();
      notificationService.subscribe(listener);
      listener.mockClear();

      notificationService.dismiss(id);

      expect(listener).toHaveBeenCalledWith([]);
    });

    it('should call onClose callback when dismissing', () => {
      const onCloseSpy = vi.fn();
      const config: NotificationConfig = {
        type: 'info',
        title: 'Test',
        onClose: onCloseSpy,
      };

      const id = notificationService.show(config);
      notificationService.dismiss(id);

      expect(onCloseSpy).toHaveBeenCalled();
    });

    it('should handle dismissing non-existent notification', () => {
      expect(() => notificationService.dismiss('non-existent')).not.toThrow();
    });

    it('should notify listeners when notification is dismissed', () => {
      const id1 = notificationService.show({ type: 'info', title: 'Test 1' });
      const id2 = notificationService.show({ type: 'info', title: 'Test 2' });

      const listener = vi.fn();
      notificationService.subscribe(listener);
      listener.mockClear();

      notificationService.dismiss(id1);

      expect(listener).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            title: 'Test 2',
          }),
        ])
      );
      expect(listener).toHaveBeenCalledWith(
        expect.not.arrayContaining([
          expect.objectContaining({
            title: 'Test 1',
          }),
        ])
      );
    });
  });

  describe('dismissAll', () => {
    it('should dismiss all notifications', () => {
      const onClose1 = vi.fn();
      const onClose2 = vi.fn();
      const onClose3 = vi.fn();

      notificationService.show({ type: 'info', title: 'Test 1', onClose: onClose1 });
      notificationService.show({ type: 'warning', title: 'Test 2', onClose: onClose2 });
      notificationService.show({ type: 'error', title: 'Test 3', onClose: onClose3 });

      const listener = vi.fn();
      notificationService.subscribe(listener);
      listener.mockClear();

      notificationService.dismissAll();

      expect(onClose1).toHaveBeenCalled();
      expect(onClose2).toHaveBeenCalled();
      expect(onClose3).toHaveBeenCalled();
      expect(listener).toHaveBeenCalledWith([]);
    });

    it('should handle empty notification list', () => {
      expect(() => notificationService.dismissAll()).not.toThrow();
    });
  });

  describe('subscribe', () => {
    it('should call subscriber immediately with current notifications', () => {
      notificationService.show({ type: 'info', title: 'Existing 1' });
      notificationService.show({ type: 'warning', title: 'Existing 2' });

      const listener = vi.fn();
      notificationService.subscribe(listener);

      expect(listener).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ title: 'Existing 1' }),
          expect.objectContaining({ title: 'Existing 2' }),
        ])
      );
    });

    it('should notify subscribers when notification is added', () => {
      const listener = vi.fn();
      notificationService.subscribe(listener);
      listener.mockClear();

      notificationService.show({ type: 'info', title: 'New notification' });

      expect(listener).toHaveBeenCalled();
    });

    it('should notify subscribers when notification is dismissed', () => {
      const id = notificationService.show({ type: 'info', title: 'Test' });
      
      const listener = vi.fn();
      notificationService.subscribe(listener);
      listener.mockClear();

      notificationService.dismiss(id);

      expect(listener).toHaveBeenCalled();
    });

    it('should support multiple subscribers', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      notificationService.subscribe(listener1);
      notificationService.subscribe(listener2);

      listener1.mockClear();
      listener2.mockClear();

      notificationService.show({ type: 'info', title: 'Test' });

      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
    });

    it('should unsubscribe when calling returned function', () => {
      const listener = vi.fn();
      const unsubscribe = notificationService.subscribe(listener);
      
      listener.mockClear();
      unsubscribe();

      notificationService.show({ type: 'info', title: 'Test' });

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('createNotificationService factory', () => {
    it('should create a new notification service instance', () => {
      const service = createNotificationService();
      
      expect(service).toBeInstanceOf(NotificationServiceImpl);
      
      // Test that it's functional
      const id = service.show({ type: 'info', title: 'Test' });
      expect(id).toBeDefined();
    });
  });

  describe('Edge cases', () => {
    it('should handle rapid show/dismiss operations', () => {
      const ids: string[] = [];
      
      for (let i = 0; i < 10; i++) {
        ids.push(notificationService.show({ 
          type: 'info', 
          title: `Notification ${i}`,
          duration: 0, // Prevent auto-dismiss
        }));
      }

      for (const id of ids) {
        notificationService.dismiss(id);
      }

      const listener = vi.fn();
      notificationService.subscribe(listener);

      expect(listener).toHaveBeenCalledWith([]);
    });

    it('should generate unique IDs', () => {
      const ids = new Set<string>();
      
      for (let i = 0; i < 100; i++) {
        const id = notificationService.show({ 
          type: 'info', 
          title: 'Test',
          duration: 0,
        });
        expect(ids.has(id)).toBe(false);
        ids.add(id);
      }
    });

    it('should handle notifications with same custom ID', () => {
      const config1: NotificationConfig = {
        id: 'custom-id',
        type: 'info',
        title: 'First',
      };

      const config2: NotificationConfig = {
        id: 'custom-id',
        type: 'warning',
        title: 'Second',
      };

      notificationService.show(config1);
      notificationService.show(config2);

      const listener = vi.fn();
      notificationService.subscribe(listener);

      // Should have replaced the first notification
      expect(listener).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'custom-id',
            type: 'warning',
            title: 'Second',
          }),
        ])
      );
      expect(listener).toHaveBeenCalledWith(
        expect.not.arrayContaining([
          expect.objectContaining({
            title: 'First',
          }),
        ])
      );
    });

    it('should handle undefined message gracefully', () => {
      const id = notificationService.info('Title only');
      
      const listener = vi.fn();
      notificationService.subscribe(listener);

      expect(listener).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            title: 'Title only',
            message: undefined,
          }),
        ])
      );
    });

    it('should handle multiple auto-dismiss timers', () => {
      const dismissSpy = vi.spyOn(notificationService, 'dismiss');

      const id1 = notificationService.show({ type: 'info', title: 'Test 1', duration: 1000 });
      const id2 = notificationService.show({ type: 'info', title: 'Test 2', duration: 2000 });
      const id3 = notificationService.show({ type: 'info', title: 'Test 3', duration: 3000 });

      vi.advanceTimersByTime(1000);
      expect(dismissSpy).toHaveBeenCalledTimes(1);
      expect(dismissSpy).toHaveBeenCalledWith(id1);

      vi.advanceTimersByTime(1000);
      expect(dismissSpy).toHaveBeenCalledTimes(2);
      expect(dismissSpy).toHaveBeenCalledWith(id2);

      vi.advanceTimersByTime(1000);
      expect(dismissSpy).toHaveBeenCalledTimes(3);
      expect(dismissSpy).toHaveBeenCalledWith(id3);
    });
  });
});