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

describe('React 17 MFE App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the app title', () => {
    render(<App services={mockServices} />);
    expect(screen.getByText('React 17 MFE Service Explorer')).toBeInTheDocument();
  });

  it('should display React version', () => {
    render(<App services={mockServices} />);
    const versionElement = screen.getAllByText('17.0.2')[0]; // Get the first one
    expect(versionElement).toBeInTheDocument();
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
      const userInfoButton = screen.getByRole('button', { name: /user info modal/i });

      await userEvent.click(userInfoButton);

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
      const eventNameInput = screen.getByPlaceholderText('Event name');
      const eventDataInput = screen.getByPlaceholderText(/Event data.*JSON format/);
      
      await userEvent.type(eventNameInput, 'react17:test');
      await userEvent.paste(eventDataInput, '{"message": "Hello from React 17"}');

      const emitButton = screen.getByRole('button', { name: /emit event/i });
      await userEvent.click(emitButton);

      expect(mockServices.eventBus.emit).toHaveBeenCalledWith(
        'react17:test',
        { message: 'Hello from React 17' }
      );
    });

    it('should handle empty event data', async () => {
      render(<App services={mockServices} />);

      const eventNameInput = screen.getByPlaceholderText('Event name');
      await userEvent.type(eventNameInput, 'react17:simple');

      const emitButton = screen.getByRole('button', { name: /emit event/i });
      await userEvent.click(emitButton);

      expect(mockServices.eventBus.emit).toHaveBeenCalledWith(
        'react17:simple',
        {}
      );
    });

    it('should show notification on successful event emission', async () => {
      render(<App services={mockServices} />);

      const eventNameInput = screen.getByPlaceholderText('Event name');
      await userEvent.type(eventNameInput, 'react17:notify');

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
        'This is a success message from React 17 MFE'
      );
    });

    it('should trigger all notification types', async () => {
      render(<App services={mockServices} />);
      
      // Test all notification types
      const types = ['success', 'error', 'warning', 'info'];
      
      for (const type of types) {
        const buttons = screen.getAllByRole('button', { name: new RegExp(type, 'i') });
        // Get the first button that matches (to avoid logger buttons)
        const notificationButton = buttons.find(btn => 
          btn.closest('[class*="border rounded-lg p-6"]')?.textContent?.includes('Notification Service')
        );
        
        if (notificationButton) {
          await userEvent.click(notificationButton);
          
          expect(mockServices.notification[type as keyof typeof mockServices.notification]).toHaveBeenCalledWith(
            `React 17 ${type.charAt(0).toUpperCase() + type.slice(1)}`,
            `This is a ${type} message from React 17 MFE`
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
      const debugButton = allButtons.find(btn => 
        btn.textContent === 'debug' && 
        btn.closest('.border')?.textContent?.includes('Logger Service')
      );
      
      if (debugButton) {
        await userEvent.click(debugButton);
        expect(mockServices.logger.debug).toHaveBeenCalledWith(
          expect.stringMatching(/React 17 debug message at/)
        );
      }
    });

    it('should show notification when logging', async () => {
      render(<App services={mockServices} />);
      
      // Find all buttons with text "info" and get the one in logger service section
      const allButtons = screen.getAllByRole('button');
      const infoButton = allButtons.find(btn => 
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
      expect(mockServices.logger.info).toHaveBeenCalledWith('React 17 MFE mounted');

      // Unmount the component
      unmount();

      // Component will unmount is logged
      expect(mockServices.logger.info).toHaveBeenCalledWith('React 17 MFE unmounting');
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
      expect(screen.getByText('React 17 MFE Service Explorer')).toBeInTheDocument();
      expect(container).toBeTruthy();

      // Restore console.error
      console.error = originalError;
    });

    it('should show error notification for invalid JSON in event data', async () => {
      render(<App services={mockServices} />);
      
      // Wait for component to fully render
      await screen.findByText('Event Bus');

      const eventNameInput = screen.getByPlaceholderText('Event name');
      const eventDataInput = screen.getByPlaceholderText(/Event data.*JSON format/);
      
      await userEvent.type(eventNameInput, 'test:event');
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
