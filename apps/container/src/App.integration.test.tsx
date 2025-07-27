import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import App from './App';
import authReducer from './store/authSlice';
import modalReducer from './store/modalSlice';
import notificationReducer from './store/notificationSlice';
// import { EVENTS } from '@mfe/shared';

// Mock the MFE loader component
vi.mock('@mfe/dev-kit', () => ({
  MFEPage: ({ mfeName }: { mfeName: string }) => (
    <div data-testid="mfe-page">MFE Page: {mfeName}</div>
  ),
  EventBusImpl: vi.fn().mockImplementation(() => ({
    emit: vi.fn(),
    on: vi.fn(() => vi.fn()),
    once: vi.fn(() => vi.fn()),
    off: vi.fn(),
  })),
  LoggerImpl: vi.fn().mockImplementation(() => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  })),
  createMFERegistry: vi.fn(() => ({
    register: vi.fn(),
    get: vi.fn(),
    getAll: vi.fn(() => []),
    has: vi.fn(() => false),
  })),
}));

describe('Container App Integration Tests', () => {
  let store: any;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer,
        modal: modalReducer,
        notification: notificationReducer,
      },
    });
  });

  const renderApp = (route = '/') => {
    window.history.pushState({}, 'Test page', route);
    return render(
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    );
  };

  describe('Navigation Integration', () => {
    it('should render navigation with all menu items', () => {
      renderApp();
      
      expect(screen.getByText('MFE Platform')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /example mfe/i })).toBeInTheDocument();
    });

    it('should navigate between pages', async () => {
      renderApp();
      
      // Start at home
      expect(screen.getByText('Welcome to MFE Platform')).toBeInTheDocument();
      
      // Navigate to dashboard
      const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
      await userEvent.click(dashboardLink);
      
      await waitFor(() => {
        expect(screen.getByText('Platform Dashboard')).toBeInTheDocument();
      });
      
      // Navigate to MFE
      const mfeLink = screen.getByRole('link', { name: /example mfe/i });
      await userEvent.click(mfeLink);
      
      await waitFor(() => {
        expect(screen.getByTestId('mfe-page')).toBeInTheDocument();
      });
    });
  });

  describe('Modal Integration', () => {
    it('should open and close modals from navigation', async () => {
      renderApp('/dashboard');
      
      // Wait for dashboard to load
      await waitFor(() => {
        expect(screen.getByText('Platform Dashboard')).toBeInTheDocument();
      });
      
      // Click on View Full Status button
      const statusButton = screen.getByRole('button', { name: /view full status/i });
      await userEvent.click(statusButton);
      
      // Modal should appear
      await waitFor(() => {
        expect(screen.getByText('Platform Health Check')).toBeInTheDocument();
      });
      
      // Close modal
      const closeButton = screen.getByRole('button', { name: /close/i });
      await userEvent.click(closeButton);
      
      // Modal should disappear
      await waitFor(() => {
        expect(screen.queryByText('Platform Health Check')).not.toBeInTheDocument();
      });
    });
  });

  describe('Notification Integration', () => {
    it('should show notifications when triggered', async () => {
      renderApp('/dashboard');
      
      await waitFor(() => {
        expect(screen.getByText('Platform Dashboard')).toBeInTheDocument();
      });
      
      // Click reload registry button
      const reloadButton = screen.getByRole('button', { name: /reload mfe registry/i });
      await userEvent.click(reloadButton);
      
      // Should show info notification
      await waitFor(() => {
        expect(screen.getByText('Registry Reloading')).toBeInTheDocument();
      });
      
      // Wait for success notification
      await waitFor(() => {
        expect(screen.getByText('Registry Updated')).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('should auto-dismiss notifications', async () => {
      renderApp('/dashboard');
      
      await waitFor(() => {
        expect(screen.getByText('Platform Dashboard')).toBeInTheDocument();
      });
      
      const reloadButton = screen.getByRole('button', { name: /reload mfe registry/i });
      await userEvent.click(reloadButton);
      
      // Notification appears
      await waitFor(() => {
        expect(screen.getByText('Registry Reloading')).toBeInTheDocument();
      });
      
      // Notification should auto-dismiss after timeout
      await waitFor(() => {
        expect(screen.queryByText('Registry Reloading')).not.toBeInTheDocument();
      }, { timeout: 4000 });
    });
  });

  describe('Auth Integration', () => {
    it('should display auth state in UI', () => {
      // Set auth state
      store.dispatch({
        type: 'auth/setSession',
        payload: {
          userId: 'test-123',
          username: 'testuser',
          email: 'test@example.com',
          isAuthenticated: true,
          roles: ['user', 'admin'],
          permissions: ['read', 'write'],
          token: 'test-token',
        },
      });
      
      renderApp('/dashboard');
      
      // Should show username in dashboard
      expect(screen.getByText('testuser')).toBeInTheDocument();
    });
  });

  describe('MFE Loading Integration', () => {
    it('should load MFE page when navigating to MFE route', async () => {
      renderApp();
      
      const mfeLink = screen.getByRole('link', { name: /example mfe/i });
      await userEvent.click(mfeLink);
      
      await waitFor(() => {
        expect(screen.getByTestId('mfe-page')).toBeInTheDocument();
        expect(screen.getByText('MFE Page: example')).toBeInTheDocument();
      });
    });

    it('should handle MFE route parameters', () => {
      renderApp('/mfe/custom-mfe');
      
      expect(screen.getByTestId('mfe-page')).toBeInTheDocument();
      expect(screen.getByText('MFE Page: custom-mfe')).toBeInTheDocument();
    });
  });

  describe('Service Integration', () => {
    it('should provide services to window for MFEs', () => {
      renderApp();
      
      // Check that services are available on window
      expect((window as any).__MFE_SERVICES__).toBeDefined();
      expect((window as any).__MFE_SERVICES__.logger).toBeDefined();
      expect((window as any).__MFE_SERVICES__.auth).toBeDefined();
      expect((window as any).__MFE_SERVICES__.eventBus).toBeDefined();
      expect((window as any).__MFE_SERVICES__.modal).toBeDefined();
      expect((window as any).__MFE_SERVICES__.notification).toBeDefined();
    });

    it('should expose Redux store on window', () => {
      renderApp();
      
      expect((window as any).__REDUX_STORE__).toBeDefined();
      expect((window as any).__REDUX_STORE__.getState).toBeDefined();
      expect((window as any).__REDUX_STORE__.dispatch).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should show 404 page for unknown routes', () => {
      renderApp('/unknown-route');
      
      expect(screen.getByText('404 - Page Not Found')).toBeInTheDocument();
      expect(screen.getByText(/The page you are looking for does not exist/)).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive navigation', () => {
      renderApp();
      
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('border-b');
      
      const navContainer = nav.querySelector('.container');
      expect(navContainer).toHaveClass('mx-auto', 'flex', 'items-center', 'justify-between');
    });
  });
});