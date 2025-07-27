import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';
import type { MFEServices } from '@mfe/dev-kit';
import { EVENTS } from '@mfe/shared';

const mockServices: MFEServices = {
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
  auth: {
    getSession: vi.fn(() => ({
      userId: 'test-user',
      username: 'testuser',
      email: 'test@example.com',
      isAuthenticated: true,
      roles: ['user'],
      permissions: ['read'],
      token: 'test-token',
    })),
    isAuthenticated: vi.fn(() => true),
    hasPermission: vi.fn(() => true),
    hasRole: vi.fn(() => true),
  },
  eventBus: {
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    once: vi.fn(),
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

describe('React 17 MFE App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the app title', () => {
    render(<App services={mockServices} />);
    expect(screen.getByText('React 17 MFE Demo')).toBeInTheDocument();
  });

  it('should display React version', () => {
    render(<App services={mockServices} />);
    expect(screen.getByText('17.0.2')).toBeInTheDocument();
  });

  it('should emit MFE loaded event on mount', () => {
    render(<App services={mockServices} />);
    expect(mockServices.eventBus.emit).toHaveBeenCalledWith(EVENTS.MFE_LOADED, {
      name: 'react17',
      version: '1.0.0',
    });
  });

  describe('Counter Component', () => {
    it('should display initial count of 0', () => {
      render(<App services={mockServices} />);
      expect(screen.getByText('Count: 0')).toBeInTheDocument();
    });

    it('should increment count when button is clicked', async () => {
      render(<App services={mockServices} />);
      const incrementButton = screen.getByRole('button', { name: /increment/i });

      await userEvent.click(incrementButton);
      expect(screen.getByText('Count: 1')).toBeInTheDocument();

      await userEvent.click(incrementButton);
      expect(screen.getByText('Count: 2')).toBeInTheDocument();
    });

    it('should log counter increment', async () => {
      render(<App services={mockServices} />);
      const incrementButton = screen.getByRole('button', { name: /increment/i });

      await userEvent.click(incrementButton);
      expect(mockServices.logger.debug).toHaveBeenCalledWith(
        'Counter incremented in class component'
      );
    });
  });

  describe('User Info Modal', () => {
    it('should open user info modal when button is clicked', async () => {
      render(<App services={mockServices} />);
      const showUserInfoButton = screen.getByRole('button', { name: /show user info/i });

      await userEvent.click(showUserInfoButton);

      expect(mockServices.modal.open).toHaveBeenCalledWith({
        title: 'User Information',
        content: expect.any(Object),
        size: 'md',
      });
    });

    it('should show warning when user is not authenticated', async () => {
      const unauthServices = {
        ...mockServices,
        auth: {
          ...mockServices.auth,
          getSession: vi.fn(() => null),
          isAuthenticated: vi.fn(() => false),
        },
      };

      render(<App services={unauthServices} />);
      const showUserInfoButton = screen.getByRole('button', { name: /show user info/i });

      await userEvent.click(showUserInfoButton);

      expect(unauthServices.notification.warning).toHaveBeenCalledWith(
        'No Session',
        'User is not logged in'
      );
    });
  });

  describe('Legacy Features', () => {
    it('should display legacy features section', () => {
      render(<App services={mockServices} />);
      expect(screen.getByText('Legacy Features Demo')).toBeInTheDocument();
      expect(screen.getByText(/This MFE uses React 17 features/)).toBeInTheDocument();
    });
  });

  describe('Event Communication', () => {
    it('should emit custom event when button is clicked', async () => {
      render(<App services={mockServices} />);

      const emitButton = screen.getByRole('button', { name: /emit event/i });
      await userEvent.click(emitButton);

      expect(mockServices.eventBus.emit).toHaveBeenNthCalledWith(
        2, // Second call (first is MFE_LOADED)
        'react17:action',
        { timestamp: expect.any(String), message: 'Hello from React 17' }
      );
    });

    it('should track event count', async () => {
      render(<App services={mockServices} />);

      expect(screen.getByText('Events emitted: 0')).toBeInTheDocument();

      const emitButton = screen.getByRole('button', { name: /emit event/i });
      await userEvent.click(emitButton);

      expect(screen.getByText('Events emitted: 1')).toBeInTheDocument();
    });
  });

  describe('Service Interaction', () => {
    it('should trigger notification service', async () => {
      render(<App services={mockServices} />);
      const notificationButton = screen.getByRole('button', { name: /send notification/i });

      await userEvent.click(notificationButton);

      expect(mockServices.notification.success).toHaveBeenCalledWith(
        'React 17 MFE',
        'Successfully sent from React 17 MFE!'
      );
    });

    it('should track notification count', async () => {
      render(<App services={mockServices} />);

      expect(screen.getByText('Notifications sent: 0')).toBeInTheDocument();

      const notificationButton = screen.getByRole('button', { name: /send notification/i });
      await userEvent.click(notificationButton);

      expect(screen.getByText('Notifications sent: 1')).toBeInTheDocument();
    });
  });

  describe('Component Lifecycle', () => {
    it('should log lifecycle methods', () => {
      const { unmount } = render(<App services={mockServices} />);

      // Component did mount is logged
      expect(mockServices.logger.info).toHaveBeenCalledWith('React 17 MFE mounted');

      // Unmount the component
      unmount();

      // Component will unmount is logged
      expect(mockServices.logger.info).toHaveBeenCalledWith('React 17 MFE unmounting');
    });
  });

  describe('Error Handling', () => {
    it('should handle errors gracefully', () => {
      const errorServices = {
        ...mockServices,
        eventBus: {
          ...mockServices.eventBus,
          emit: vi.fn((eventName) => {
            // Only throw error for specific events, not for MFE_LOADED
            if (eventName !== EVENTS.MFE_LOADED) {
              throw new Error('Event bus error');
            }
          }),
        },
      };

      render(<App services={errorServices} />);

      // Should render despite error potential
      expect(screen.getByText('React 17 MFE Demo')).toBeInTheDocument();
    });
  });
});
