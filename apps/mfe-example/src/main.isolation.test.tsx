import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';
import type { MFEServices } from '@mfe/dev-kit';

describe('MFE in Isolation', () => {
  let mockServices: MFEServices;

  beforeEach(() => {
    // Create complete mock services
    mockServices = {
      logger: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
      },
      auth: {
        getSession: vi.fn(() => null),
        isAuthenticated: vi.fn(() => false),
        hasPermission: vi.fn(() => false),
        hasRole: vi.fn(() => false),
      },
      eventBus: {
        emit: vi.fn(),
        on: vi.fn(() => vi.fn()),
        once: vi.fn(() => vi.fn()),
        off: vi.fn(),
      },
      modal: {
        open: vi.fn(),
        close: vi.fn(),
      },
      notification: {
        show: vi.fn(),
        success: vi.fn(),
        error: vi.fn(),
        warning: vi.fn(),
        info: vi.fn(),
      },
    };
  });

  describe('MFE Isolation Tests', () => {
    it('should render without container services', () => {
      render(<App services={mockServices} />);

      expect(screen.getByText('MFE Service Explorer')).toBeInTheDocument();
    });

    it('should handle null session gracefully', async () => {
      render(<App services={mockServices} />);

      const viewSessionBtn = screen.getByRole('button', { name: /view session details/i });
      await userEvent.click(viewSessionBtn);

      expect(mockServices.notification.warning).toHaveBeenCalledWith(
        'No Session',
        'No active session found'
      );
    });

    it('should work with mock logger service', async () => {
      render(<App services={mockServices} />);

      expect(mockServices.logger.info).toHaveBeenCalledWith('Example MFE mounted successfully');
    });

    it('should emit events through mock event bus', () => {
      render(<App services={mockServices} />);

      expect(mockServices.eventBus.emit).toHaveBeenCalledWith('mfe:loaded', {
        name: 'example',
        version: '1.0.0',
      });
    });

    it('should handle modal service calls', async () => {
      render(<App services={mockServices} />);

      const simpleModalBtn = screen.getByRole('button', { name: /simple modal/i });
      await userEvent.click(simpleModalBtn);

      expect(mockServices.modal.open).toHaveBeenCalled();
    });

    it('should handle notification service calls', async () => {
      render(<App services={mockServices} />);

      const notificationSection = screen.getByText('Notification Service').closest('div');
      const successBtn = within(notificationSection!).getByRole('button', { name: /success/i });
      await userEvent.click(successBtn);

      expect(mockServices.notification.success).toHaveBeenCalled();
    });

    it('should handle service errors gracefully', () => {
      // Make auth service throw error
      mockServices.auth.getSession = vi.fn(() => {
        throw new Error('Auth error');
      });

      // Component should still render
      const { container } = render(<App services={mockServices} />);
      expect(container).toBeTruthy();

      // Main content should be visible
      expect(screen.getByText('MFE Service Explorer')).toBeInTheDocument();
    });

    it('should work with minimal service implementation', () => {
      // Create minimal services that just log
      const minimalServices: MFEServices = {
        logger: {
          info: console.log,
          warn: console.warn,
          error: console.error,
          debug: console.debug,
        },
        auth: {
          getSession: () => null,
          isAuthenticated: () => false,
          hasPermission: () => false,
          hasRole: () => false,
        },
        eventBus: {
          emit: () => {},
          on: () => () => {},
          once: () => () => {},
          off: () => {},
        },
        modal: {
          open: () => {},
          close: () => {},
        },
        notification: {
          show: () => {},
          success: () => {},
          error: () => {},
          warning: () => {},
          info: () => {},
        },
      };

      expect(() => render(<App services={minimalServices} />)).not.toThrow();
    });
  });
});
