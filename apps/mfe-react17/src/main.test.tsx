import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EVENTS } from '@mfe/shared';

// Mock React and ReactDOM
vi.mock('react', () => ({
  default: {
    version: '17.0.2',
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
  App: () => 'Mocked App Component',
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
  });

  describe('Development Mode', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
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

    it('should expose mount and unmount functions on window', async () => {
      // Import main to trigger the module execution
      await import('./main');

      expect((window as any).React17MFE).toBeDefined();
      expect((window as any).React17MFE.mount).toBeInstanceOf(Function);
      expect((window as any).React17MFE.unmount).toBeInstanceOf(Function);
    });

    it('should mount the MFE when mount is called', async () => {
      const ReactDOM = (await import('react-dom')).default;

      await import('./main');

      // Create container element
      const container = document.createElement('div');
      container.id = 'test-container';
      document.body.appendChild(container);

      // Call mount
      (window as any).React17MFE.mount('test-container');

      // Should render the app
      expect(ReactDOM.render).toHaveBeenCalledWith(expect.anything(), container);

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

    it('should handle missing services gracefully', async () => {
      (window as any).__MFE_SERVICES__ = undefined;
      console.error = vi.fn();

      await import('./main');

      const container = document.createElement('div');
      container.id = 'test-container';
      document.body.appendChild(container);

      // Call mount without services
      (window as any).React17MFE.mount('test-container');

      expect(console.error).toHaveBeenCalledWith('React 17 MFE: Services not available');
    });

    it('should handle missing container element', async () => {
      console.error = vi.fn();

      await import('./main');

      // Call mount with non-existent container
      (window as any).React17MFE.mount('non-existent');

      expect(console.error).toHaveBeenCalledWith(
        "React 17 MFE: Container element 'non-existent' not found"
      );
    });

    it('should unmount the MFE when unmount is called', async () => {
      const ReactDOM = (await import('react-dom')).default;

      await import('./main');

      // Create and mount first
      const container = document.createElement('div');
      container.setAttribute('data-testid', 'react17-mfe');
      const wrapper = document.createElement('div');
      wrapper.appendChild(container);
      document.body.appendChild(wrapper);

      // Call unmount
      (window as any).React17MFE.unmount();

      // Should unmount from the container
      expect(ReactDOM.unmountComponentAtNode).toHaveBeenCalledWith(wrapper);

      // Should emit MFE unloaded event
      expect((window as any).__MFE_SERVICES__.eventBus.emit).toHaveBeenCalledWith(
        EVENTS.MFE_UNLOADED,
        { name: 'react17' }
      );
    });

    it('should handle render errors gracefully', async () => {
      const ReactDOM = (await import('react-dom')).default;
      const originalRender = ReactDOM.render;
      Object.defineProperty(ReactDOM, 'render', {
        value: vi.fn(() => {
          throw new Error('Render error');
        }),
        configurable: true,
      });

      await import('./main');

      const container = document.createElement('div');
      container.id = 'test-container';
      document.body.appendChild(container);

      // Call mount - should handle error
      (window as any).React17MFE.mount('test-container');

      expect((window as any).__MFE_SERVICES__.logger.error).toHaveBeenCalledWith(
        'Failed to render React 17 MFE',
        expect.any(Error)
      );

      // Restore original render
      Object.defineProperty(ReactDOM, 'render', {
        value: originalRender,
        configurable: true,
      });
    });

    it('should log initialization in production', async () => {
      await import('./main');

      expect((window as any).__MFE_SERVICES__.logger.info).toHaveBeenCalledWith(
        'React 17 MFE initialized'
      );
    });
  });
});
