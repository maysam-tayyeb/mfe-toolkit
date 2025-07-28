import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EVENTS } from '@mfe/shared';

// Mock React and ReactDOM
vi.mock('react', () => ({
  default: {
    version: '17.0.2',
    createElement: vi.fn((component, props) => ({ type: component, props })),
    StrictMode: ({ children }: any) => children,
  },
}));

vi.mock('react-dom', () => ({
  default: {
    render: vi.fn(),
    unmountComponentAtNode: vi.fn(),
  },
}));

// Mock the App component
vi.mock('./App', () => ({
  App: vi.fn(() => null),
}));

describe('React 17 MFE Main Entry', () => {
  const originalEnv = process.env.NODE_ENV;
  const originalWindow = global.window;

  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks();

    // Reset modules to ensure fresh imports
    vi.resetModules();

    // Mock DOM elements
    document.body.innerHTML = '<div id="react17-mfe-root"></div>';
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    global.window = originalWindow;
    vi.clearAllMocks();
    vi.resetModules();
  });

  describe('Development Mode', () => {
    beforeEach(() => {
      // Mock window.location for development mode
      Object.defineProperty(window, 'location', {
        value: { port: '3002' },
        writable: true,
      });
    });

    it('should render in development mode with mock services', async () => {
      const ReactDOM = (await import('react-dom')).default;

      // Import main to trigger the module execution
      await import('./main');

      // Should have called ReactDOM.render
      expect(ReactDOM.render).toHaveBeenCalledWith(
        expect.anything(),
        document.getElementById('react17-mfe-root')
      );
    });
  });

  describe('Production Mode', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';

      // Mock window.location for production mode
      Object.defineProperty(window, 'location', {
        value: { port: '3000' }, // Not dev port
        writable: true,
      });

      // Mock window services
      (window as any).__MFE_SERVICES__ = {
        logger: {
          info: vi.fn(),
          error: vi.fn(),
        },
        eventBus: {
          emit: vi.fn(),
        },
      };
    });

    it('should export default MFE module with mount and unmount functions', async () => {
      // Import main to get the exported module
      const module = await import('./main');

      expect(module.default).toBeDefined();
      expect(module.default.mount).toBeInstanceOf(Function);
      expect(module.default.unmount).toBeInstanceOf(Function);
    });

    it('should mount the MFE when mount is called', async () => {
      const ReactDOM = (await import('react-dom')).default;
      const module = await import('./main');

      // Create container element
      const container = document.createElement('div');
      document.body.appendChild(container);

      // Call mount
      module.default.mount(container, (window as any).__MFE_SERVICES__);

      // Should render the app
      expect(ReactDOM.render).toHaveBeenCalled();

      // Should emit MFE loaded event
      expect((window as any).__MFE_SERVICES__.eventBus.emit).toHaveBeenCalledWith(
        EVENTS.MFE_LOADED,
        {
          name: 'react17',
          version: '1.0.0',
          reactVersion: '17.0.2',
        }
      );
    });

    it('should handle mount errors gracefully', async () => {
      const ReactDOM = (await import('react-dom')).default;
      const originalRender = ReactDOM.render;
      Object.defineProperty(ReactDOM, 'render', {
        value: vi.fn(() => {
          throw new Error('Render error');
        }),
        configurable: true,
      });

      const module = await import('./main');
      const container = document.createElement('div');
      document.body.appendChild(container);

      // Call mount - should throw error
      expect(() => {
        module.default.mount(container, (window as any).__MFE_SERVICES__);
      }).toThrow('Render error');

      expect((window as any).__MFE_SERVICES__.logger.error).toHaveBeenCalledWith(
        'Error during React 17 MFE mount',
        expect.any(Error)
      );

      // Restore original render
      Object.defineProperty(ReactDOM, 'render', {
        value: originalRender,
        configurable: true,
      });
    });

    it('should unmount the MFE when unmount is called', async () => {
      // Reset modules to clear previous test's mock
      vi.resetModules();

      // Re-mock React and ReactDOM
      vi.mock('react', () => ({
        default: {
          version: '17.0.2',
          createElement: vi.fn((component, props) => ({ type: component, props })),
          StrictMode: ({ children }: any) => children,
        },
      }));

      vi.mock('react-dom', () => ({
        default: {
          render: vi.fn(),
          unmountComponentAtNode: vi.fn(),
        },
      }));

      const ReactDOM = (await import('react-dom')).default;
      const module = await import('./main');

      // Mount first
      const container = document.createElement('div');
      document.body.appendChild(container);
      module.default.mount(container, (window as any).__MFE_SERVICES__);

      // Clear mocks
      vi.clearAllMocks();

      // Call unmount
      module.default.unmount();

      // Should unmount from the container
      expect(ReactDOM.unmountComponentAtNode).toHaveBeenCalled();
    });
  });
});
