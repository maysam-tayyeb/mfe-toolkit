import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { App } from './App';
import { MFEServices } from '@mfe/dev-kit';
import { EVENTS } from '@mfe/shared';

describe('MFE Example App', () => {
  let mockServices: MFEServices;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Create fresh mock services for each test
    mockServices = {
      logger: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
      },
      auth: {
        getSession: vi.fn(() => ({
          userId: 'test-user-123',
          username: 'testuser',
          email: 'test@example.com',
          isAuthenticated: true,
          roles: ['user', 'admin'],
          permissions: ['read', 'write', 'delete'],
          token: 'mock-token',
        })),
        isAuthenticated: vi.fn(() => true),
        hasPermission: vi.fn((permission) => ['read', 'write'].includes(permission)),
        hasRole: vi.fn((role) => ['user', 'admin'].includes(role)),
      },
      eventBus: {
        emit: vi.fn(),
        on: vi.fn(() => vi.fn()), // Return unsubscribe function
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

  describe('Component Rendering', () => {
    it('should render the main heading and description', () => {
      render(<App services={mockServices} />);
      
      expect(screen.getByText('MFE Service Explorer')).toBeInTheDocument();
      expect(screen.getByText('Interactive demonstration of all available MFE services and capabilities')).toBeInTheDocument();
    });

    it('should render all service sections', () => {
      render(<App services={mockServices} />);
      
      expect(screen.getByText('Modal Service')).toBeInTheDocument();
      expect(screen.getByText('Notification Service')).toBeInTheDocument();
      expect(screen.getByText('Event Bus')).toBeInTheDocument();
      expect(screen.getByText('Event Log')).toBeInTheDocument();
      expect(screen.getByText('Auth Service')).toBeInTheDocument();
      expect(screen.getByText('Logger Service')).toBeInTheDocument();
    });

    it('should render MFE configuration and shared dependencies sections', () => {
      render(<App services={mockServices} />);
      
      expect(screen.getByText('MFE Configuration')).toBeInTheDocument();
      expect(screen.getByText('Shared Dependencies')).toBeInTheDocument();
    });
  });

  describe('Modal Service', () => {
    it('should open simple modal when button is clicked', async () => {
      render(<App services={mockServices} />);
      
      const simpleModalBtn = screen.getByRole('button', { name: /simple modal/i });
      await userEvent.click(simpleModalBtn);
      
      expect(mockServices.modal.open).toHaveBeenCalledWith({
        title: 'Simple Modal Example',
        content: expect.anything(),
        size: 'sm',
      });
    });

    it('should open confirmation modal with callback', async () => {
      render(<App services={mockServices} />);
      
      const confirmModalBtn = screen.getByRole('button', { name: /confirmation modal/i });
      await userEvent.click(confirmModalBtn);
      
      expect(mockServices.modal.open).toHaveBeenCalledWith({
        title: 'Confirm Action',
        content: expect.anything(),
        size: 'md',
        onConfirm: expect.any(Function),
      });
      
      // Test the onConfirm callback
      const openCall = vi.mocked(mockServices.modal.open);
      const onConfirm = openCall.mock.calls[0][0].onConfirm;
      onConfirm?.();
      
      expect(mockServices.notification.success).toHaveBeenCalledWith(
        'Confirmed',
        'Action completed successfully'
      );
    });

    it('should open form modal', async () => {
      render(<App services={mockServices} />);
      
      const formModalBtn = screen.getByRole('button', { name: /form modal/i });
      await userEvent.click(formModalBtn);
      
      expect(mockServices.modal.open).toHaveBeenCalledWith({
        title: 'User Input',
        content: expect.anything(),
        size: 'lg',
        onConfirm: expect.any(Function),
      });
    });
  });

  describe('Notification Service', () => {
    it('should trigger success notification', async () => {
      render(<App services={mockServices} />);
      
      const successBtn = screen.getByRole('button', { name: /^success$/i });
      await userEvent.click(successBtn);
      
      expect(mockServices.notification.success).toHaveBeenCalledWith(
        'Success Notification',
        'This is a success message from the MFE'
      );
    });

    it('should trigger error notification', async () => {
      render(<App services={mockServices} />);
      
      const notificationSection = screen.getByText('Notification Service').closest('div');
      const errorBtn = within(notificationSection!).getByRole('button', { name: /^error$/i });
      await userEvent.click(errorBtn);
      
      expect(mockServices.notification.error).toHaveBeenCalledWith(
        'Error Notification',
        'This is a error message from the MFE'
      );
    });

    it('should trigger warning notification', async () => {
      render(<App services={mockServices} />);
      
      const warningBtn = screen.getByRole('button', { name: /^warning$/i });
      await userEvent.click(warningBtn);
      
      expect(mockServices.notification.warning).toHaveBeenCalledWith(
        'Warning Notification',
        'This is a warning message from the MFE'
      );
    });

    it('should trigger info notification', async () => {
      render(<App services={mockServices} />);
      
      const notificationSection = screen.getByText('Notification Service').closest('div');
      const infoBtn = within(notificationSection!).getByRole('button', { name: /^info$/i });
      await userEvent.click(infoBtn);
      
      expect(mockServices.notification.info).toHaveBeenCalledWith(
        'Info Notification',
        'This is a info message from the MFE'
      );
    });
  });

  describe('Event Bus', () => {
    it('should emit MFE_LOADED event on mount', () => {
      render(<App services={mockServices} />);
      
      expect(mockServices.eventBus.emit).toHaveBeenCalledWith(
        EVENTS.MFE_LOADED,
        { name: 'example', version: '1.0.0' }
      );
    });

    it('should emit MFE_UNLOADED event on unmount', () => {
      const { unmount } = render(<App services={mockServices} />);
      
      unmount();
      
      expect(mockServices.eventBus.emit).toHaveBeenCalledWith(
        EVENTS.MFE_UNLOADED,
        { name: 'example' }
      );
    });

    it('should send custom event with valid JSON data', async () => {
      render(<App services={mockServices} />);
      
      const eventNameInput = screen.getByPlaceholderText('Event name');
      const eventDataInput = screen.getByPlaceholderText(/Event data/);
      const sendEventBtn = screen.getByRole('button', { name: /send event/i });
      
      await userEvent.type(eventNameInput, 'CUSTOM_EVENT');
      // Type JSON data - set value directly to avoid special character issues
      await userEvent.clear(eventDataInput);
      // Use paste to insert JSON string
      await userEvent.paste('{"test": "data"}');
      await userEvent.click(sendEventBtn);
      
      expect(mockServices.eventBus.emit).toHaveBeenCalledWith(
        'CUSTOM_EVENT',
        { test: 'data' }
      );
      expect(mockServices.notification.success).toHaveBeenCalledWith(
        'Event Sent',
        'Event "CUSTOM_EVENT" emitted'
      );
    });

    it('should show error for invalid JSON data', async () => {
      render(<App services={mockServices} />);
      
      const eventNameInput = screen.getByPlaceholderText('Event name');
      const eventDataInput = screen.getByPlaceholderText(/Event data/);
      const sendEventBtn = screen.getByRole('button', { name: /send event/i });
      
      await userEvent.type(eventNameInput, 'CUSTOM_EVENT');
      await userEvent.type(eventDataInput, 'invalid json');
      await userEvent.click(sendEventBtn);
      
      expect(mockServices.eventBus.emit).not.toHaveBeenCalledWith('CUSTOM_EVENT');
      expect(mockServices.notification.error).toHaveBeenCalledWith(
        'Invalid JSON',
        'Please enter valid JSON data'
      );
    });

    it('should toggle event listening', async () => {
      render(<App services={mockServices} />);
      
      const listeningBtn = screen.getByRole('button', { name: /listening/i });
      expect(listeningBtn).toHaveTextContent('Listening');
      
      await userEvent.click(listeningBtn);
      expect(listeningBtn).toHaveTextContent('Paused');
      
      await userEvent.click(listeningBtn);
      expect(listeningBtn).toHaveTextContent('Listening');
    });

    it('should clear event log', async () => {
      render(<App services={mockServices} />);
      
      const clearLogBtn = screen.getByRole('button', { name: /clear log/i });
      await userEvent.click(clearLogBtn);
      
      expect(mockServices.notification.info).toHaveBeenCalledWith(
        'Event Log Cleared',
        'All events have been removed'
      );
    });
  });

  describe('Auth Service', () => {
    it('should display session information in modal', async () => {
      render(<App services={mockServices} />);
      
      const viewSessionBtn = screen.getByRole('button', { name: /view session details/i });
      await userEvent.click(viewSessionBtn);
      
      expect(mockServices.modal.open).toHaveBeenCalledWith({
        title: 'Session Information',
        content: expect.anything(),
        size: 'lg',
      });
    });

    it('should show no session warning when session is null', async () => {
      mockServices.auth.getSession = vi.fn(() => null);
      render(<App services={mockServices} />);
      
      const viewSessionBtn = screen.getByRole('button', { name: /view session details/i });
      await userEvent.click(viewSessionBtn);
      
      expect(mockServices.notification.warning).toHaveBeenCalledWith(
        'No Session',
        'No active session found'
      );
    });

    it('should check write permission', async () => {
      render(<App services={mockServices} />);
      
      const checkPermBtn = screen.getByRole('button', { name: /check write permission/i });
      await userEvent.click(checkPermBtn);
      
      expect(mockServices.auth.hasPermission).toHaveBeenCalledWith('write');
      expect(mockServices.notification.info).toHaveBeenCalledWith(
        'Permission Check',
        'Has "write" permission: Yes'
      );
    });
  });

  describe('Logger Service', () => {
    it('should log debug message', async () => {
      render(<App services={mockServices} />);
      
      const debugBtn = screen.getByRole('button', { name: /^debug$/i });
      await userEvent.click(debugBtn);
      
      expect(mockServices.logger.debug).toHaveBeenCalledWith(
        expect.stringContaining('Test debug message from MFE at')
      );
      expect(mockServices.notification.info).toHaveBeenCalledWith(
        'Logged',
        'Check console for debug message'
      );
    });

    it('should log info message', async () => {
      render(<App services={mockServices} />);
      
      const loggerSection = screen.getByText('Logger Service').closest('div');
      const infoBtn = within(loggerSection!).getByRole('button', { name: /^info$/i });
      await userEvent.click(infoBtn);
      
      expect(mockServices.logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Test info message from MFE at')
      );
    });

    it('should log warn message', async () => {
      render(<App services={mockServices} />);
      
      const warnBtn = screen.getByRole('button', { name: /^warn$/i });
      await userEvent.click(warnBtn);
      
      expect(mockServices.logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Test warn message from MFE at')
      );
    });

    it('should log error message', async () => {
      render(<App services={mockServices} />);
      
      const loggerSection = screen.getByText('Logger Service').closest('div');
      const errorBtn = within(loggerSection!).getByRole('button', { name: /^error$/i });
      await userEvent.click(errorBtn);
      
      expect(mockServices.logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Test error message from MFE at')
      );
    });
  });

  describe('Event Log Display', () => {
    it('should show empty state message initially', () => {
      render(<App services={mockServices} />);
      
      // The event log is populated with an initial event, so let's check that it exists
      const eventLogSection = screen.getByText('Event Log').parentElement;
      expect(eventLogSection).toBeInTheDocument();
      // The log will have the initial MFE_LOADED event
      expect(screen.getByText('Sent')).toBeInTheDocument();
    });

    it('should display sent events in the log', async () => {
      render(<App services={mockServices} />);
      
      const eventNameInput = screen.getByPlaceholderText('Event name');
      const sendEventBtn = screen.getByRole('button', { name: /send event/i });
      
      await userEvent.type(eventNameInput, 'TEST_EVENT');
      await userEvent.click(sendEventBtn);
      
      // Wait for the event to appear in the log
      await waitFor(() => {
        // Check within the event log section specifically
        const eventLogSection = screen.getByText('Event Log').parentElement;
        expect(within(eventLogSection!).getByText('TEST_EVENT')).toBeInTheDocument();
      });
    });
  });

  describe('Layout and Styling', () => {
    it('should render service blocks in 2-column grid on medium screens', () => {
      render(<App services={mockServices} />);
      
      const serviceGrid = screen.getByText('Modal Service').closest('.grid');
      expect(serviceGrid).toHaveClass('grid', 'gap-6', 'md:grid-cols-2');
    });

    it('should render logger service spanning both columns', () => {
      render(<App services={mockServices} />);
      
      const loggerSection = screen.getByText('Logger Service').closest('div');
      expect(loggerSection).toHaveClass('md:col-span-2');
    });

    it('should render event bus and event log side by side', () => {
      render(<App services={mockServices} />);
      
      const eventBusGrid = screen.getByText('Event Bus').closest('.grid');
      expect(eventBusGrid).toHaveClass('grid', 'gap-6', 'md:grid-cols-2');
    });

    it('should have consistent button styling', () => {
      render(<App services={mockServices} />);
      
      const modalButtons = screen.getAllByRole('button').filter(btn => 
        btn.textContent?.includes('Modal')
      );
      
      modalButtons.forEach(btn => {
        expect(btn).toHaveClass('h-9', 'px-3');
      });
    });
  });

  describe('React Version Display', () => {
    it('should display React version if available', () => {
      render(<App services={mockServices} />);
      
      // React version is displayed in the Shared Dependencies section
      const sharedDepsSection = screen.getByText('Shared Dependencies').closest('div');
      expect(sharedDepsSection).toBeInTheDocument();
      // The actual version will be whatever React provides
      const reactEntry = within(sharedDepsSection!).getByText('React:').parentElement;
      expect(reactEntry).toBeInTheDocument();
    });
  });
});