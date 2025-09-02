import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UnifiedServiceContainer, createServiceContainer } from '../service-container';
import type { ReactContextValues } from '../service-container';

describe('Unified Service Container', () => {
  let container: UnifiedServiceContainer;
  let mockContextValues: ReactContextValues;

  beforeEach(() => {
    container = createServiceContainer();

    mockContextValues = {
      auth: {
        session: {
          userId: 'test-user-id',
          username: 'test-user',
          email: 'test@example.com',
          roles: ['user', 'admin'],
          permissions: ['read', 'write'],
          isAuthenticated: true,
        },
      },
      ui: {
        openModal: vi.fn(),
        closeModal: vi.fn(),
        addNotification: vi.fn(),
      },
    };
  });

  describe('Service Container Interface', () => {
    it('should implement ServiceContainer interface', () => {
      expect(container).toHaveProperty('get');
      expect(container).toHaveProperty('require');
      expect(container).toHaveProperty('has');
      expect(container).toHaveProperty('listAvailable');
      expect(container).toHaveProperty('getAllServices');
      expect(container).toHaveProperty('createScoped');
      expect(container).toHaveProperty('dispose');
    });

    it('should provide all core services', () => {
      expect(container.has('logger')).toBe(true);
      expect(container.has('auth')).toBe(true);
      expect(container.has('authz')).toBe(true);
      expect(container.has('eventBus')).toBe(true);
      expect(container.has('modal')).toBe(true);
      expect(container.has('notification')).toBe(true);
      expect(container.has('theme')).toBe(true);
      expect(container.has('errorReporter')).toBe(true);
    });

    it('should list available services', () => {
      const services = container.listAvailable();
      expect(services).toHaveLength(8);
      expect(services.every((s) => s.status === 'ready')).toBe(true);
    });

    it('should throw error for required missing service', () => {
      expect(() => container.require('nonexistent' as any)).toThrow(
        "Required service 'nonexistent' not found"
      );
    });
  });

  describe('Context Integration', () => {
    it('should warn when accessing services before context is set', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const auth = container.get('auth');
      auth?.getSession();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Service accessed before React contexts are initialized')
      );

      consoleSpy.mockRestore();
    });

    it('should provide default values before context is set', () => {
      const auth = container.get('auth');
      expect(auth?.getSession()).toBeNull();
      expect(auth?.isAuthenticated()).toBe(false);

      const authz = container.get('authz');
      expect(authz?.hasPermission('any')).toBe(false);
      expect(authz?.hasRole('any')).toBe(false);
      expect(authz?.getPermissions()).toEqual([]);
      expect(authz?.getRoles()).toEqual([]);
    });

    it('should use context values when set', () => {
      container.setContextValues(mockContextValues);

      const auth = container.get('auth');
      const session = auth?.getSession();

      expect(session).toEqual(mockContextValues.auth.session);
      expect(auth?.isAuthenticated()).toBe(true);
    });
  });

  describe('Auth Service', () => {
    beforeEach(() => {
      container.setContextValues(mockContextValues);
    });

    it('should provide authentication status', () => {
      const auth = container.get('auth');
      expect(auth?.isAuthenticated()).toBe(true);

      // Update context values
      container.setContextValues({
        ...mockContextValues,
        auth: { session: null },
      });

      expect(auth?.isAuthenticated()).toBe(false);
    });

    it('should provide session data', () => {
      const auth = container.get('auth');
      const session = auth?.getSession();

      expect(session?.username).toBe('test-user');
      expect(session?.email).toBe('test@example.com');
    });
  });

  describe('Authorization Service', () => {
    beforeEach(() => {
      container.setContextValues(mockContextValues);
    });

    it('should check permissions', () => {
      const authz = container.get('authz');

      expect(authz?.hasPermission('read')).toBe(true);
      expect(authz?.hasPermission('delete')).toBe(false);
      expect(authz?.hasAnyPermission(['read', 'delete'])).toBe(true);
      expect(authz?.hasAllPermissions(['read', 'write'])).toBe(true);
      expect(authz?.hasAllPermissions(['read', 'delete'])).toBe(false);
    });

    it('should check roles', () => {
      const authz = container.get('authz');

      expect(authz?.hasRole('user')).toBe(true);
      expect(authz?.hasRole('superadmin')).toBe(false);
      expect(authz?.hasAnyRole(['user', 'superadmin'])).toBe(true);
      expect(authz?.hasAllRoles(['user', 'admin'])).toBe(true);
      expect(authz?.hasAllRoles(['user', 'superadmin'])).toBe(false);
    });

    it('should check resource access', () => {
      const authz = container.get('authz');

      container.setContextValues({
        ...mockContextValues,
        auth: {
          session: {
            ...mockContextValues.auth.session!,
            permissions: ['posts:read', 'posts:write', 'users:read'],
          },
        },
      });

      expect(authz?.canAccess('posts', 'read')).toBe(true);
      expect(authz?.canAccess('posts', 'delete')).toBe(false);
      expect(authz?.canAccessAny([{ resource: 'posts', actions: ['read', 'delete'] }])).toBe(true);
      expect(authz?.canAccessAll([{ resource: 'posts', actions: ['read', 'write'] }])).toBe(true);
    });
  });

  describe('Modal Service', () => {
    beforeEach(() => {
      container.setContextValues(mockContextValues);
    });

    it('should open modal and return ID', () => {
      const modal = container.get('modal');
      const id = modal?.open({ title: 'Test', content: 'Test content' });

      expect(id).toMatch(/^modal-\d+$/);
      expect(mockContextValues.ui.openModal).toHaveBeenCalledWith({
        title: 'Test',
        content: 'Test content',
      });
    });

    it('should close modal', () => {
      const modal = container.get('modal');
      modal?.close();

      expect(mockContextValues.ui.closeModal).toHaveBeenCalled();
    });
  });

  describe('Notification Service', () => {
    beforeEach(() => {
      container.setContextValues(mockContextValues);
    });

    it('should show notifications with different types', () => {
      const notification = container.get('notification');

      const successId = notification?.success('Success', 'Operation completed');
      expect(successId).toMatch(/^notification-\d+$/);
      expect(mockContextValues.ui.addNotification).toHaveBeenCalledWith({
        type: 'success',
        title: 'Success',
        message: 'Operation completed',
      });

      const errorId = notification?.error('Error', 'Something went wrong');
      expect(errorId).toMatch(/^notification-\d+$/);
      expect(mockContextValues.ui.addNotification).toHaveBeenCalledWith({
        type: 'error',
        title: 'Error',
        message: 'Something went wrong',
      });
    });

    it('should warn for unimplemented dismiss methods', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const notification = container.get('notification');
      notification?.dismiss('notification-123');
      notification?.dismissAll();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('NotificationService.dismiss not yet implemented')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('NotificationService.dismissAll not yet implemented')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Static Services', () => {
    it('should provide logger service', () => {
      const logger = container.get('logger');
      expect(logger).toBeDefined();
      expect(logger).toHaveProperty('debug');
      expect(logger).toHaveProperty('info');
      expect(logger).toHaveProperty('warn');
      expect(logger).toHaveProperty('error');
    });

    it('should provide event bus service', () => {
      const eventBus = container.get('eventBus');
      expect(eventBus).toBeDefined();
      expect(eventBus).toHaveProperty('emit');
      expect(eventBus).toHaveProperty('on');
      expect(eventBus).toHaveProperty('off');
    });

    it('should provide theme service', () => {
      const theme = container.get('theme');
      expect(theme).toBeDefined();
      expect(theme).toHaveProperty('getTheme');
      expect(theme).toHaveProperty('setTheme');
      expect(theme).toHaveProperty('subscribe');
    });
  });

  describe('Scoped Container', () => {
    it('should create scoped container with overrides', () => {
      const mockLogger = {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
      };

      const scopedContainer = container.createScoped({
        logger: mockLogger,
      });

      expect(scopedContainer.get('logger')).toBe(mockLogger);
      expect(scopedContainer.get('eventBus')).toBeDefined();
    });

    it('should inherit context values in scoped container', () => {
      container.setContextValues(mockContextValues);

      const scopedContainer = container.createScoped({});
      const auth = scopedContainer.get('auth');

      expect(auth?.getSession()).toEqual(mockContextValues.auth.session);
    });
  });

  describe('Disposal', () => {
    it('should clear services on dispose', async () => {
      container.setContextValues(mockContextValues);
      await container.dispose();

      // After disposal, services should return default values
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const auth = container.get('auth');
      auth?.getSession();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Service accessed before React contexts are initialized')
      );

      consoleSpy.mockRestore();
    });
  });
});
