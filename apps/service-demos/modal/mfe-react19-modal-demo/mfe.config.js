/**
 * MFE Development Configuration
 * Used by @mfe-toolkit/dev-container
 */

module.exports = {
  name: 'React 19 Modal Demo',
  displayName: 'Modal Service Demo (React 19)',
  version: '1.0.0',
  framework: 'react19',

  // Entry point for the MFE
  entry: './src/main.tsx',

  // Dev container configuration
  devContainer: {
    port: 3333,
    servicesUI: true,

    // Mock auth configuration
    mockAuth: {
      isAuthenticated: true,
      user: {
        id: '123',
        name: 'Dev User',
        email: 'dev@example.com',
      },
      roles: ['user', 'admin'],
      permissions: ['read', 'write'],
    },

    // Theme configuration
    theme: 'light',

    // Enable all services
    services: {
      modal: true,
      notification: true,
      eventBus: true,
      logger: true,
      auth: true,
      theme: true,
      stateManager: true,
      designSystem: true, // Enable design system service
    },

    // Shared dependencies that should be provided by container
    sharedDependencies: {
      react: '^19.0.0',
      'react-dom': '^19.0.0',
      '@mfe/design-system': '*',
      '@mfe-toolkit/core': '*',
    },

    // Hot reload configuration
    hot: true,

    // Proxy configuration for API calls
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },

  // Build configuration
  build: {
    // External dependencies (not bundled)
    externals: ['react', 'react-dom', '@mfe/design-system'],

    // Output configuration
    output: {
      format: 'esm',
      filename: 'mfe-react19-modal-demo.js',
    },
  },
};
