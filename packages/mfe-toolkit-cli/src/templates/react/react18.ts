import type { TemplateConfig, TemplateGenerator, ServiceConfig } from '../types';
import { getServiceConfig, getFrameworkIcon } from '../types';

export class React18Template implements TemplateGenerator {
  private config: TemplateConfig;
  private serviceConfig: ServiceConfig;

  constructor(config: TemplateConfig) {
    this.config = config;
    this.serviceConfig = getServiceConfig(config.serviceType || 'general', config.name);
  }

  generateMain(): string {
    const { name } = this.config;
    const { requiredServices, capabilities } = this.serviceConfig;

    return `import React from 'react';
import ReactDOM from 'react-dom/client';
import type { MFEModule, MFEServiceContainer } from '@mfe-toolkit/core';
import { App } from './App';

let root: ReactDOM.Root | null = null;

const module: MFEModule = {
  metadata: {
    name: '${name}',
    version: '1.0.0',
    requiredServices: ${JSON.stringify(requiredServices)},
    capabilities: ${JSON.stringify(capabilities)}
  },

  mount: async (element: HTMLElement, container: MFEServiceContainer) => {
    const services = container.getAllServices();
    
    root = ReactDOM.createRoot(element);
    root.render(
      <React.StrictMode>
        <App services={services} />
      </React.StrictMode>
    );
    
    if (services.logger) {
      services.logger.info('[${name}] Mounted successfully with React 18');
    }
  },
  
  unmount: async (container: MFEServiceContainer) => {
    if (root) {
      root.unmount();
      root = null;
    }
    
    const services = container.getAllServices();
    if (services.logger) {
      services.logger.info('[${name}] Unmounted successfully');
    }
  }
};

export default module;`;
  }

  generateApp(): string {
    const { name, serviceType } = this.config;
    
    if (serviceType === 'modal') {
      return this.generateModalApp();
    } else if (serviceType === 'notification') {
      return this.generateNotificationApp();
    }
    
    return this.generateGeneralApp();
  }

  private generateModalApp(): string {
    const { name } = this.config;
    
    return `import React, { useState, useTransition } from 'react';
import type { MFEServices } from '@mfe-toolkit/core';

interface AppProps {
  services: MFEServices;
}

export const App: React.FC<AppProps> = ({ services }) => {
  const [modalCount, setModalCount] = useState(0);
  const [customTitle, setCustomTitle] = useState('Custom Modal');
  const [customContent, setCustomContent] = useState('This is custom modal content from React 18.');
  const [selectedSize, setSelectedSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('md');
  const [isPending, startTransition] = useTransition();

  const showModal = (config: any) => {
    if (!services.modal) {
      console.error('Modal service not available');
      return;
    }
    services.modal.show(config);
    setModalCount(prev => prev + 1);
  };

  const showSimpleModal = () => {
    showModal({
      title: 'React 18 Modal',
      content: <p>This modal is powered by React 18 with concurrent features!</p>,
      showCloseButton: true
    });
  };

  const showConfirmModal = () => {
    showModal({
      title: 'Confirm Action',
      content: (
        <div>
          <p>Are you sure you want to proceed?</p>
          <p className="ds-text-sm ds-text-muted ds-mt-2">
            Triggered from React 18 MFE with Concurrent Mode
          </p>
        </div>
      ),
      onConfirm: () => {
        console.log('Confirmed from React 18!');
        services.modal?.close();
        startTransition(() => {
          services.notification?.show({
            title: 'Success',
            message: 'Action confirmed with React 18 transitions!',
            type: 'success'
          });
        });
      },
      showCloseButton: true
    });
  };

  const showSizeModal = (size: 'sm' | 'md' | 'lg' | 'xl') => {
    showModal({
      title: \`\${size.toUpperCase()} Modal\`,
      content: (
        <div>
          <p>This is a <strong>\${size}</strong> modal.</p>
          <p className="ds-text-sm ds-text-muted ds-mt-2">
            React 18 with createRoot API
          </p>
        </div>
      ),
      size,
      showCloseButton: true
    });
  };

  const showCustomModal = () => {
    showModal({
      title: customTitle,
      content: <p>{customContent}</p>,
      size: selectedSize,
      showCloseButton: true
    });
  };

  const showFeatureModal = () => {
    showModal({
      title: 'React 18 Features',
      content: (
        <div className="ds-space-y-4">
          <div className="ds-bg-accent-primary-soft ds-p-3 ds-rounded">
            <h3 className="ds-font-semibold ds-mb-2">Concurrent Features</h3>
            <ul className="ds-list-disc ds-list-inside ds-text-sm">
              <li>Automatic batching of updates</li>
              <li>Concurrent rendering with createRoot</li>
              <li>useTransition for non-urgent updates</li>
              <li>Suspense improvements</li>
              <li>Strict Mode enhancements</li>
            </ul>
          </div>
          <div className="ds-grid ds-grid-cols-3 ds-gap-2">
            <div className="ds-card-compact ds-text-center">
              <div className="ds-text-2xl">⚡</div>
              <div className="ds-text-xs">Concurrent</div>
            </div>
            <div className="ds-card-compact ds-text-center">
              <div className="ds-text-2xl">⚛️</div>
              <div className="ds-text-xs">React 18</div>
            </div>
            <div className="ds-card-compact ds-text-center">
              <div className="ds-text-2xl">🚀</div>
              <div className="ds-text-xs">Modern</div>
            </div>
          </div>
        </div>
      ),
      size: 'lg',
      showCloseButton: true
    });
  };

  const showTransitionModal = () => {
    startTransition(() => {
      showModal({
        title: 'Transition Modal',
        content: (
          <div>
            <p>This modal was opened using React 18's useTransition!</p>
            <p className="ds-text-sm ds-text-muted ds-mt-2">
              Non-urgent updates are deferred for better performance
            </p>
          </div>
        ),
        showCloseButton: true
      });
    });
  };

  return (
    <div className="ds-card ds-p-6 ds-m-4">
      <div className="ds-mb-6 ds-text-center">
        <h1 className="ds-text-3xl ds-font-bold ds-mb-2 ds-text-accent-primary">
          ⚛️ React 18 Modal Demo
        </h1>
        <p className="ds-text-gray-600">
          Modern React with Concurrent Features
        </p>
        {isPending && (
          <p className="ds-text-sm ds-text-warning ds-mt-2">
            Transition pending...
          </p>
        )}
      </div>

      <div className="ds-grid ds-grid-cols-3 ds-gap-4 ds-mb-6">
        <div className="ds-card-compact ds-text-center">
          <div className="ds-text-2xl ds-font-bold ds-text-accent-primary">{modalCount}</div>
          <div className="ds-text-sm ds-text-gray-600">Modals Opened</div>
        </div>
        <div className="ds-card-compact ds-text-center">
          <div className="ds-text-2xl">⚛️</div>
          <div className="ds-text-sm ds-text-gray-600">React 18</div>
        </div>
        <div className="ds-card-compact ds-text-center">
          <div className="ds-text-2xl">⚡</div>
          <div className="ds-text-sm ds-text-gray-600">Concurrent</div>
        </div>
      </div>

      <div className="ds-space-y-4">
        <div>
          <h3 className="ds-text-lg ds-font-semibold ds-mb-3">Modal Types</h3>
          <div className="ds-flex ds-flex-wrap ds-gap-2">
            <button onClick={showSimpleModal} className="ds-btn-primary">
              Simple Modal
            </button>
            <button onClick={showConfirmModal} className="ds-btn-success">
              Confirm Dialog
            </button>
            <button onClick={showFeatureModal} className="ds-btn-secondary">
              Features
            </button>
            <button onClick={showTransitionModal} className="ds-btn-warning">
              With Transition
            </button>
          </div>
        </div>

        <div>
          <h3 className="ds-text-lg ds-font-semibold ds-mb-3">Modal Sizes</h3>
          <div className="ds-flex ds-gap-2">
            {(['sm', 'md', 'lg', 'xl'] as const).map(size => (
              <button 
                key={size}
                onClick={() => showSizeModal(size)} 
                className="ds-btn-outline ds-btn-sm"
              >
                {size.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="ds-text-lg ds-font-semibold ds-mb-3">Custom Modal</h3>
          <div className="ds-space-y-3">
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              className="ds-input"
              placeholder="Modal title"
            />
            <textarea
              value={customContent}
              onChange={(e) => setCustomContent(e.target.value)}
              className="ds-textarea"
              rows={2}
              placeholder="Modal content"
            />
            <select 
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value as any)}
              className="ds-select"
            >
              <option value="sm">Small</option>
              <option value="md">Medium</option>
              <option value="lg">Large</option>
              <option value="xl">Extra Large</option>
            </select>
            <button onClick={showCustomModal} className="ds-btn-primary">
              Show Custom Modal
            </button>
          </div>
        </div>
      </div>

      <div className="ds-mt-6 ds-pt-4 ds-border-t ds-text-center ds-text-sm ds-text-gray-500">
        React 18 Modal Service Demo • Concurrent Features Enabled
      </div>
    </div>
  );
};`;
  }

  private generateNotificationApp(): string {
    return `import React, { useState, useTransition } from 'react';
import type { MFEServices } from '@mfe-toolkit/core';

interface AppProps {
  services: MFEServices;
}

export const App: React.FC<AppProps> = ({ services }) => {
  const [notificationCount, setNotificationCount] = useState(0);
  const [isPending, startTransition] = useTransition();

  const showNotification = (type: 'success' | 'info' | 'warning' | 'error') => {
    startTransition(() => {
      services.notification?.show({
        title: \`\${type.charAt(0).toUpperCase() + type.slice(1)} Notification\`,
        message: \`React 18 notification with concurrent features\`,
        type
      });
      setNotificationCount(prev => prev + 1);
    });
  };

  return (
    <div className="ds-card ds-p-6 ds-m-4">
      <div className="ds-mb-6 ds-text-center">
        <h1 className="ds-text-3xl ds-font-bold ds-mb-2 ds-text-accent-primary">
          🔔 React 18 Notifications
        </h1>
        <p className="ds-text-gray-600">Concurrent Notification Service</p>
        {isPending && <p className="ds-text-sm ds-text-warning">Updating...</p>}
      </div>

      <div className="ds-text-center ds-mb-6">
        <div className="ds-text-3xl ds-font-bold">{notificationCount}</div>
        <div className="ds-text-sm ds-text-gray-600">Notifications Sent</div>
      </div>

      <div className="ds-flex ds-flex-wrap ds-gap-2 ds-justify-center">
        <button onClick={() => showNotification('success')} className="ds-btn-success">
          Success
        </button>
        <button onClick={() => showNotification('info')} className="ds-btn-primary">
          Info
        </button>
        <button onClick={() => showNotification('warning')} className="ds-btn-warning">
          Warning
        </button>
        <button onClick={() => showNotification('error')} className="ds-btn-danger">
          Error
        </button>
      </div>
    </div>
  );
};`;
  }

  private generateGeneralApp(): string {
    const { name } = this.config;
    
    return `import React, { useState, useTransition } from 'react';
import type { MFEServices } from '@mfe-toolkit/core';

interface AppProps {
  services: MFEServices;
}

export const App: React.FC<AppProps> = ({ services }) => {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState('Welcome to React 18 MFE!');
  const [isPending, startTransition] = useTransition();

  const handleLog = () => {
    startTransition(() => {
      services.logger?.info(\`[${name}] Count is \${count}\`);
      setMessage(\`Logged count: \${count}\`);
    });
  };

  return (
    <div className="ds-card ds-p-6 ds-m-4">
      <div className="ds-mb-6 ds-text-center">
        <h1 className="ds-text-3xl ds-font-bold ds-mb-2 ds-text-accent-primary">
          ⚛️ ${name}
        </h1>
        <p className="ds-text-gray-600">React 18 with Concurrent Features</p>
        {isPending && <p className="ds-text-sm ds-text-warning">Updating...</p>}
      </div>

      <div className="ds-text-center ds-mb-6">
        <div className="ds-text-3xl ds-font-bold">{count}</div>
        <div className="ds-text-sm ds-text-gray-600">Counter Value</div>
      </div>

      <div className="ds-bg-accent-primary-soft ds-p-3 ds-rounded ds-mb-4">
        <p className="ds-text-sm">{message}</p>
      </div>

      <div className="ds-flex ds-gap-2 ds-justify-center">
        <button onClick={() => setCount(c => c + 1)} className="ds-btn-primary">
          Increment
        </button>
        <button onClick={() => setCount(0)} className="ds-btn-outline">
          Reset
        </button>
        <button onClick={handleLog} className="ds-btn-secondary">
          Log Count
        </button>
      </div>
    </div>
  );
};`;
  }

  generatePackageJson(): object {
    const { name } = this.config;
    
    return {
      name: `@mfe/${name}`,
      version: '1.0.0',
      private: true,
      type: 'module',
      scripts: {
        build: 'node build.js',
        'build:watch': 'node build.js --watch',
        clean: 'rm -rf dist'
      },
      dependencies: {
        '@mfe-toolkit/core': 'workspace:*',
        'react': '^18.2.0',
        'react-dom': '^18.2.0'
      },
      devDependencies: {
        '@mfe-toolkit/build': 'workspace:*',
        '@types/react': '^18.2.0',
        '@types/react-dom': '^18.2.0',
        'esbuild': '^0.24.2',
        'typescript': '^5.3.0'
      }
    };
  }

  generateManifest(): object {
    const { name, projectPath } = this.config;
    const { requiredServices, capabilities, emits, listens, features, eventNamespace } = this.serviceConfig;
    
    const urlPath = projectPath.includes('service-demos') 
      ? `service-demos/${this.config.serviceType}/${name}` 
      : name;

    return {
      $schema: 'https://mfe-made-easy.com/schemas/mfe-manifest-v2.schema.json',
      name,
      version: '1.0.0',
      url: `http://localhost:8080/${urlPath}/${name}.js`,
      alternativeUrls: [],
      dependencies: {
        runtime: {
          'react': '^18.2.0 || ^19.0.0',
          'react-dom': '^18.2.0 || ^19.0.0'
        },
        peer: {
          '@mfe-toolkit/core': '^0.1.0'
        }
      },
      compatibility: {
        container: '^1.0.0',
        browsers: {
          chrome: '>=90',
          firefox: '>=88',
          safari: '>=14',
          edge: '>=90'
        },
        frameworks: {
          react: '^18.2.0 || ^19.0.0'
        }
      },
      capabilities: {
        emits,
        listens,
        features: [...features, 'react18-hooks', 'concurrent-features']
      },
      requirements: {
        services: requiredServices.map(name => ({ name, optional: name === 'logger' }))
      },
      metadata: {
        displayName: `React 18 ${this.config.serviceType === 'modal' ? 'Modal' : this.config.serviceType === 'notification' ? 'Notification' : ''} Demo`.trim(),
        description: `${this.config.serviceType || 'General'} service demonstration MFE built with React 18`,
        icon: '⚛️',
        author: { name: 'MFE Toolkit Team' },
        category: projectPath.includes('service-demos') ? 'service-demos' : 'custom',
        tags: [this.config.serviceType || 'demo', 'react18', 'service']
      },
      config: {
        loading: {
          timeout: 30000,
          retries: 3,
          retryDelay: 1000,
          priority: 5,
          preload: false,
          lazy: true
        },
        runtime: {
          isolation: 'none',
          keepAlive: false,
          singleton: true
        },
        communication: {
          eventNamespace
        }
      }
    };
  }

  generateBuildScript(): string {
    const { name } = this.config;
    
    return `import { buildMFE } from '@mfe-toolkit/build';

await buildMFE({
  entry: 'src/main.tsx',
  outfile: 'dist/${name}.js',
  manifestPath: './manifest.json'
});`;
  }

  generateTsConfig(): object {
    return {
      compilerOptions: {
        target: 'ES2020',
        module: 'ESNext',
        lib: ['ES2020', 'DOM', 'DOM.Iterable'],
        jsx: 'react-jsx', // React 18 uses the new JSX transform
        moduleResolution: 'node',
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        declaration: false,
        noEmit: true,
        resolveJsonModule: true,
        types: ['react', 'react-dom']
      },
      include: ['src/**/*'],
      exclude: ['node_modules', 'dist']
    };
  }

  generateReadme(): string {
    const { name, serviceType } = this.config;
    
    return `# ${name}

## Description
React 18 ${serviceType || 'general'} microfrontend with concurrent features and modern APIs.

## Features
- React 18 with createRoot API
- Concurrent rendering capabilities
- Automatic batching
- useTransition and Suspense support
- ${serviceType === 'modal' ? 'Modal service integration' : serviceType === 'notification' ? 'Notification service integration' : 'General MFE functionality'}
- Design system integration
- TypeScript support

## Development

\`\`\`bash
# Install dependencies
pnpm install

# Build for production
pnpm build

# Build in watch mode
pnpm build:watch

# Clean build artifacts
pnpm clean
\`\`\`

## React 18 Specifics
This MFE leverages React 18's modern features:
- \`createRoot()\` for concurrent rendering
- \`useTransition()\` for non-urgent updates
- Automatic batching of state updates
- Improved Suspense boundaries

## Integration
Designed to be loaded by the MFE container application with shared dependencies via import maps.
`;
  }
}