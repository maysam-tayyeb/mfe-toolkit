import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createMFEServices,
  setContextBridge,
  resetContextBridge,
  isContextBridgeReady,
  waitForContextBridge,
} from '../mfe-services';
import { ContextBridgeRef } from '../context-bridge';
import { MFEServices } from '@mfe-toolkit/core';

describe('MFE Services with Proxy Pattern', () => {
  let services: MFEServices;
  let mockContextBridge: ContextBridgeRef;

  beforeEach(() => {
    // Reset the context bridge state
    resetContextBridge();

    // Create mock services that persist
    const mockAuthService = {
      getSession: vi.fn(() => ({
        userId: 'test-user-id',
        username: 'test-user',
        email: 'test@example.com',
        roles: ['user'],
        permissions: ['read'],
        isAuthenticated: true,
      })),
      isAuthenticated: vi.fn(() => true),
      hasPermission: vi.fn(() => true),
      hasRole: vi.fn(() => true),
    };

    const mockModalService = {
      open: vi.fn(),
      close: vi.fn(),
    };

    const mockNotificationService = {
      show: vi.fn(),
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
      info: vi.fn(),
    };

    // Create mock context bridge
    mockContextBridge = {
      getAuthService: vi.fn(() => mockAuthService),
      getModalService: vi.fn(() => mockModalService),
      getNotificationService: vi.fn(() => mockNotificationService),
      getThemeService: vi.fn(() => ({
        getTheme: vi.fn(() => 'light' as const),
        setTheme: vi.fn(),
        toggleTheme: vi.fn(),
        subscribe: vi.fn(() => vi.fn()),
      })),
    };

    services = createMFEServices();
  });

  afterEach(() => {
    // Clean up
    resetContextBridge();
  });

  describe('Context Bridge Status', () => {
    it('should report not ready before context bridge is set', () => {
      expect(isContextBridgeReady()).toBe(false);
    });

    it('should report ready after context bridge is set', () => {
      setContextBridge(mockContextBridge);
      expect(isContextBridgeReady()).toBe(true);
    });

    it('should resolve waitForContextBridge promise when bridge is set', async () => {
      const readyPromise = waitForContextBridge();
      setContextBridge(mockContextBridge);

      await expect(readyPromise).resolves.toBeUndefined();
    });
  });

  describe('Auth Service Proxy', () => {
    it('should return default values when bridge is not ready', () => {
      expect(services.auth.getSession()).toBeNull();
      expect(services.auth.isAuthenticated()).toBe(false);
      expect(services.auth.hasPermission('any')).toBe(false);
      expect(services.auth.hasRole('any')).toBe(false);
    });

    it('should warn when called before bridge initialization', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      services.auth.getSession();

      expect(consoleSpy).toHaveBeenCalledWith(
        'AuthService.getSession called before context bridge initialization'
      );

      consoleSpy.mockRestore();
    });

    it('should delegate to context bridge when ready', () => {
      setContextBridge(mockContextBridge);

      const session = services.auth.getSession();

      expect(session).toMatchObject({ username: 'test-user' });
      expect(mockContextBridge.getAuthService).toHaveBeenCalled();
    });
  });

  describe('Modal Service Proxy', () => {
    it('should warn but not throw when called before initialization', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      expect(() => services.modal.open({ title: 'Test', content: 'Test content' })).not.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith(
        'ModalService.open called before context bridge initialization'
      );

      consoleSpy.mockRestore();
    });

    it('should delegate to context bridge when ready', () => {
      setContextBridge(mockContextBridge);

      services.modal.open({ title: 'Test', content: 'Test content' });

      // Get the mocked service and check it was called
      const modalService = mockContextBridge.getModalService();
      expect(modalService.open).toHaveBeenCalledWith({ title: 'Test', content: 'Test content' });
    });
  });

  describe('Notification Service Proxy', () => {
    it('should handle all notification methods', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      services.notification.show({ title: 'Test', type: 'info' });
      services.notification.success('Success', 'Message');
      services.notification.error('Error', 'Message');
      services.notification.warning('Warning', 'Message');
      services.notification.info('Info', 'Message');

      expect(consoleSpy).toHaveBeenCalledTimes(5);

      consoleSpy.mockRestore();
    });

    it('should delegate all methods when bridge is ready', () => {
      setContextBridge(mockContextBridge);

      services.notification.success('Success', 'Message');

      // Get the mocked service and check it was called
      const notificationService = mockContextBridge.getNotificationService();
      expect(notificationService.success).toHaveBeenCalledWith('Success', 'Message');
    });
  });

  describe('Error Handling', () => {
    it('should throw error if accessing non-existent method', () => {
      setContextBridge(mockContextBridge);

      expect(() => {
        (services.auth as any).nonExistentMethod();
      }).toThrow('AuthService.nonExistentMethod is not a function');
    });
  });

  describe('Service Consistency', () => {
    it('should maintain standard MFEServices interface', () => {
      // Verify services implement the standard interface
      expect(services).toHaveProperty('logger');
      expect(services).toHaveProperty('auth');
      expect(services).toHaveProperty('eventBus');
      expect(services).toHaveProperty('modal');
      expect(services).toHaveProperty('notification');
      expect(services).toHaveProperty('errorReporter');

      // Verify no additional properties leaked
      expect(services).not.toHaveProperty('isReady');
      expect(services).not.toHaveProperty('waitForReady');
    });
  });
});
