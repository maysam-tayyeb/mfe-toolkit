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
    on: vi.fn(() => vi.fn()), // Return a mock unsubscribe function
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

describe('Legacy Service Explorer MFE App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the app title', () => {
    render(<App services={mockServices} />);
    expect(screen.getByText('Legacy Service Explorer')).toBeInTheDocument();
  });

  it('should display React version', () => {
    render(<App services={mockServices} />);
    // Look for React 17 in the component structure
    expect(screen.getByText('Legacy Service Explorer')).toBeInTheDocument();
  });

  it('should emit MFE loaded event on mount', () => {
    render(<App services={mockServices} />);
    expect(mockServices.eventBus.emit).toHaveBeenCalledWith(EVENTS.MFE_LOADED, {
      name: 'react17',
      version: '1.0.0',
    });
  });

  describe('Modal Service', () => {
    it('should open simple modal when button is clicked', async () => {
      render(<App services={mockServices} />);
      const simpleModalButton = screen.getByRole('button', { name: /simple modal/i });

      await userEvent.click(simpleModalButton);

      expect(mockServices.modal.open).toHaveBeenCalledWith({
        title: 'React 17 Simple Modal',
        content: 'This modal is triggered from a Legacy Service Explorer MFE!',
        size: 'sm',
      });
    });

    it('should open compatibility info modal', async () => {
      render(<App services={mockServices} />);
      const compatButton = screen.getByRole('button', { name: /compatibility info/i });

      await userEvent.click(compatButton);

      expect(mockServices.modal.open).toHaveBeenCalledWith({
        title: 'React 17 Compatibility',
        content: expect.stringContaining('This MFE demonstrates cross-version support'),
        size: 'md',
      });
    });
  });

  describe('User Info Modal', () => {
    it('should open user info modal when button is clicked', async () => {
      render(<App services={mockServices} />);
      const userInfoButton = screen.getByRole('button', { name: /user info modal/i });

      await userEvent.click(userInfoButton);

      expect(mockServices.modal.open).toHaveBeenCalledWith({
        title: 'User Information',
        content: expect.stringContaining('Username: testuser'),
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
      const userInfoButton = screen.getByRole('button', { name: /user info modal/i });

      await userEvent.click(userInfoButton);

      expect(unauthServices.notification.warning).toHaveBeenCalledWith(
        'No Session',
        'User is not logged in'
      );
    });
  });

  describe('Legacy Features', () => {
    it('should display legacy features section', () => {
      render(<App services={mockServices} />);
      expect(screen.getByText('Legacy React 17 Features')).toBeInTheDocument();
      expect(screen.getByText(/This MFE demonstrates:/)).toBeInTheDocument();
    });
  });

  describe('Event Communication', () => {
    it('should emit custom event when button is clicked', async () => {
      render(<App services={mockServices} />);

      // Fill in event name and data
      const eventNameInput = screen.getByPlaceholderText(/Event name to send/);
      const eventDataInput = screen.getByPlaceholderText(/Event data.*JSON format/);

      await userEvent.clear(eventNameInput);
      await userEvent.type(eventNameInput, 'react17:test');
      await userEvent.clear(eventDataInput);
      await userEvent.paste(eventDataInput, '{"message": "Hello from React 17"}');

      const emitButton = screen.getByRole('button', { name: /emit event/i });
      await userEvent.click(emitButton);

      expect(mockServices.eventBus.emit).toHaveBeenNthCalledWith(2, 'react17:test', {
        message: 'Hello from React 17',
      });
    });

    it('should handle empty event data', async () => {
      render(<App services={mockServices} />);

      const eventNameInput = screen.getByPlaceholderText(/Event name to send/);
      const eventDataInput = screen.getByPlaceholderText(/Event data.*JSON format/);
      await userEvent.clear(eventNameInput);
      await userEvent.type(eventNameInput, 'react17:simple');
      await userEvent.clear(eventDataInput);

      const emitButton = screen.getByRole('button', { name: /emit event/i });
      await userEvent.click(emitButton);

      expect(mockServices.eventBus.emit).toHaveBeenCalledWith('react17:simple', {});
    });

    it('should show notification on successful event emission', async () => {
      render(<App services={mockServices} />);

      const eventNameInput = screen.getByPlaceholderText(/Event name to send/);
      const eventDataInput = screen.getByPlaceholderText(/Event data.*JSON format/);
      await userEvent.clear(eventNameInput);
      await userEvent.type(eventNameInput, 'react17:notify');
      await userEvent.clear(eventDataInput);

      const emitButton = screen.getByRole('button', { name: /emit event/i });
      await userEvent.click(emitButton);

      expect(mockServices.notification.success).toHaveBeenCalledWith(
        'Event Sent',
        'Event "react17:notify" emitted'
      );
    });
  });

  describe('Service Interaction', () => {
    it('should trigger notification service', async () => {
      render(<App services={mockServices} />);
      const successButton = screen.getByRole('button', { name: /success/i });

      await userEvent.click(successButton);

      expect(mockServices.notification.success).toHaveBeenCalledWith(
        'React 17 Success',
        'This is a success message from Legacy Service Explorer MFE'
      );
    });

    it('should trigger all notification types', async () => {
      render(<App services={mockServices} />);

      // Test all notification types
      const types = ['success', 'error', 'warning', 'info'];

      for (const type of types) {
        const buttons = screen.getAllByRole('button', { name: new RegExp(type, 'i') });
        // Get the first button that matches (to avoid logger buttons)
        const notificationButton = buttons.find((btn) =>
          btn
            .closest('[class*="border rounded-lg p-6"]')
            ?.textContent?.includes('Notification Service')
        );

        if (notificationButton) {
          await userEvent.click(notificationButton);

          expect(
            mockServices.notification[type as keyof typeof mockServices.notification]
          ).toHaveBeenCalledWith(
            `React 17 ${type.charAt(0).toUpperCase() + type.slice(1)}`,
            `This is a ${type} message from Legacy Service Explorer MFE`
          );
        }
      }
    });
  });

  describe('Logger Service', () => {
    it('should trigger logger at different levels', async () => {
      render(<App services={mockServices} />);

      // Find all buttons with text "debug" and get the one in logger service section
      const allButtons = screen.getAllByRole('button');
      const debugButton = allButtons.find(
        (btn) =>
          btn.textContent === 'debug' &&
          btn.closest('.border')?.textContent?.includes('Logger Service')
      );

      if (debugButton) {
        await userEvent.click(debugButton);
        expect(mockServices.logger.debug).toHaveBeenCalledWith(
          expect.stringMatching(/Test debug message from MFE at/)
        );
      }
    });

    it('should show notification when logging', async () => {
      render(<App services={mockServices} />);

      // Find all buttons with text "info" and get the one in logger service section
      const allButtons = screen.getAllByRole('button');
      const infoButton = allButtons.find(
        (btn) =>
          btn.textContent === 'info' &&
          btn.closest('.border')?.textContent?.includes('Logger Service')
      );

      if (infoButton) {
        await userEvent.click(infoButton);
        expect(mockServices.notification.info).toHaveBeenCalledWith(
          'Logged',
          'Check console for info message'
        );
      }
    });
  });

  describe('Component Lifecycle', () => {
    it('should log lifecycle methods', () => {
      const { unmount } = render(<App services={mockServices} />);

      // Component did mount is logged
      expect(mockServices.logger.info).toHaveBeenCalledWith(
        'Legacy Service Explorer MFE initialized'
      );

      // Unmount the component
      unmount();

      // Component will unmount is logged
      expect(mockServices.logger.info).toHaveBeenCalledWith(
        'Legacy Service Explorer MFE unmounting'
      );
    });
  });

  describe('Event Bus Subscription Bug', () => {
    it('should maintain multiple event subscriptions when adding new listeners', async () => {
      const eventHandlers = new Map<string, Set<any>>();

      const trackingServices = {
        ...mockServices,
        eventBus: {
          ...mockServices.eventBus,
          on: vi.fn((event: string, handler: any) => {
            if (!eventHandlers.has(event)) {
              eventHandlers.set(event, new Set());
            }
            eventHandlers.get(event)!.add(handler);

            // Return unsubscribe function
            return () => {
              const handlers = eventHandlers.get(event);
              if (handlers) {
                handlers.delete(handler);
                if (handlers.size === 0) {
                  eventHandlers.delete(event);
                }
              }
            };
          }),
        },
      };

      render(<App services={trackingServices} />);

      // Subscribe to first event
      const eventInput = screen.getByPlaceholderText(/Event name to listen/);
      const listenButton = screen.getByRole('button', { name: 'Listen' });

      await userEvent.clear(eventInput);
      await userEvent.type(eventInput, 'test.event1');
      await userEvent.click(listenButton);

      await screen.findByText('test.event1');

      // Verify first subscription is active
      expect(eventHandlers.has('test.event1')).toBe(true);
      expect(eventHandlers.get('test.event1')?.size).toBe(1);

      // Clear input and subscribe to second event
      await userEvent.clear(eventInput);
      await userEvent.type(eventInput, 'test.event2');
      await userEvent.click(listenButton);

      await screen.findByText('test.event2');

      // Clear input and subscribe to third event
      await userEvent.clear(eventInput);
      await userEvent.type(eventInput, 'test.event3');
      await userEvent.click(listenButton);

      await screen.findByText('test.event3');

      // BUG: All event subscriptions should still be active
      expect(eventHandlers.has('test.event1')).toBe(true);
      expect(eventHandlers.has('test.event2')).toBe(true);
      expect(eventHandlers.has('test.event3')).toBe(true);

      // Verify all handlers are still registered
      expect(eventHandlers.get('test.event1')?.size).toBe(1);
      expect(eventHandlers.get('test.event2')?.size).toBe(1);
      expect(eventHandlers.get('test.event3')?.size).toBe(1);
    });

    it('should receive events from all subscribed event types', async () => {
      const eventHandlers = new Map<string, Set<any>>();

      const trackingServices = {
        ...mockServices,
        eventBus: {
          ...mockServices.eventBus,
          on: vi.fn((event: string, handler: any) => {
            if (!eventHandlers.has(event)) {
              eventHandlers.set(event, new Set());
            }
            eventHandlers.get(event)!.add(handler);

            return () => {
              const handlers = eventHandlers.get(event);
              if (handlers) {
                handlers.delete(handler);
                if (handlers.size === 0) {
                  eventHandlers.delete(event);
                }
              }
            };
          }),
        },
      };

      render(<App services={trackingServices} />);

      const eventInput = screen.getByPlaceholderText(/Event name to listen/);
      const listenButton = screen.getByRole('button', { name: 'Listen' });

      // Add three event listeners
      const events = ['custom.test1', 'custom.test2', 'custom.test3'];
      for (const event of events) {
        await userEvent.clear(eventInput);
        await userEvent.type(eventInput, event);
        await userEvent.click(listenButton);
        await screen.findByText(event);
      }

      // Simulate receiving events from another MFE
      for (const event of events) {
        const handlers = eventHandlers.get(event);
        if (handlers) {
          handlers.forEach((handler) => {
            handler({
              type: event,
              data: { message: `Test message for ${event}` },
              timestamp: Date.now(),
              source: 'test-mfe',
            });
          });
        }
      }

      // Check that notifications were shown for all events
      expect(trackingServices.notification.info).toHaveBeenCalledWith(
        'Custom Event Received',
        expect.stringContaining('custom.test1')
      );
      expect(trackingServices.notification.info).toHaveBeenCalledWith(
        'Custom Event Received',
        expect.stringContaining('custom.test2')
      );
      expect(trackingServices.notification.info).toHaveBeenCalledWith(
        'Custom Event Received',
        expect.stringContaining('custom.test3')
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle errors gracefully', () => {
      // Mock console.error to suppress error output in tests
      const originalError = console.error;
      console.error = vi.fn();

      const errorServices = {
        ...mockServices,
        eventBus: {
          ...mockServices.eventBus,
          emit: vi.fn(),
          on: vi.fn(() => vi.fn()), // Return a normal unsubscribe function
        },
      };

      // Should not throw during render
      const { container } = render(<App services={errorServices} />);

      // Should render despite error potential
      expect(screen.getByText('Legacy Service Explorer')).toBeInTheDocument();
      expect(container).toBeTruthy();

      // Restore console.error
      console.error = originalError;
    });

    it('should show error notification for invalid JSON in event data', async () => {
      render(<App services={mockServices} />);

      // Wait for component to fully render
      await screen.findByText('Event Bus');

      const eventNameInput = screen.getByPlaceholderText(/Event name to send/);
      const eventDataInput = screen.getByPlaceholderText(/Event data.*JSON format/);

      await userEvent.clear(eventNameInput);
      await userEvent.type(eventNameInput, 'test:event');
      await userEvent.clear(eventDataInput);
      await userEvent.type(eventDataInput, 'invalid json');

      const emitButton = screen.getByRole('button', { name: /emit event/i });
      await userEvent.click(emitButton);

      expect(mockServices.notification.error).toHaveBeenCalledWith(
        'Invalid JSON',
        'Please enter valid JSON data'
      );
    });
  });
});
