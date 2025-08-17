import type { TemplateConfig, TemplateGenerator, ServiceConfig } from '../types';
import { getServiceConfig } from '../types';

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
    const { name } = this.config;
    
    return `import React, { useState } from 'react';
import type { MFEServices } from '@mfe-toolkit/core';

interface AppProps {
  services: MFEServices;
}

export const App: React.FC<AppProps> = ({ services }) => {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount(prev => prev + 1);
    services.logger?.info(\`Button clicked! Count: \${count + 1}\`);
  };

  return (
    <div className="ds-card ds-p-6 ds-m-4">
      <div className="ds-text-center">
        <h1 className="ds-text-3xl ds-font-bold ds-mb-2 ds-text-accent-primary">
          ⚛️ Hello from ${name}!
        </h1>
        <p className="ds-text-gray-600 ds-mb-6">
          React 18 MFE • Concurrent Features
        </p>
        
        <div className="ds-card-compact ds-inline-block ds-p-4">
          <div className="ds-text-4xl ds-font-bold ds-text-accent-primary ds-mb-2">
            {count}
          </div>
          <button 
            onClick={handleClick}
            className="ds-btn-primary"
          >
            Click me!
          </button>
        </div>
        
        <p className="ds-text-sm ds-text-gray-500 ds-mt-6">
          Built with ❤️ using MFE Toolkit
        </p>
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
    const { requiredServices, emits, listens, features, eventNamespace } = this.serviceConfig;
    
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
          'react': '^18.0.0',
          'react-dom': '^18.0.0'
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
          react: '^18.0.0'
        }
      },
      capabilities: {
        emits,
        listens,
        features: [...features, 'react18-hooks', 'concurrent-rendering', 'suspense', 'automatic-batching']
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
        tags: [this.config.serviceType || 'demo', 'react18', 'service', 'concurrent']
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
        target: 'ES2022',
        module: 'ESNext',
        lib: ['ES2022', 'DOM', 'DOM.Iterable'],
        jsx: 'react-jsx',
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
React 18 ${serviceType || 'general'} microfrontend with concurrent features and automatic batching.

## Features
- React 18 with Concurrent Rendering
- Automatic batching for better performance
- Suspense for data fetching
- Transitions API ready
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
This MFE leverages React 18's concurrent features:
- Automatic batching for state updates
- Concurrent rendering capabilities
- Improved Suspense boundaries
- Transition API support

## Integration
Designed to be loaded by the MFE container application with shared dependencies via import maps.
`;
  }
}