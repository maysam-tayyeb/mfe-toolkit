// Template files as constants for better readability and maintainability
// These are imported at build time and bundled into the CLI

export const mainTsxTemplate = `import React from 'react';
import ReactDOM from 'react-dom/client';
import type { MFEModule, ServiceContainer } from '@mfe-toolkit/core';
// Import service types only if needed (zero runtime cost)
// Example: import type { NotificationService } from '@mfe-toolkit/service-notification';
import { App } from './App';

let root: ReactDOM.Root | null = null;

const module: MFEModule = {
  mount: async (element: HTMLElement, container: ServiceContainer) => {
    root = ReactDOM.createRoot(element);
    root.render(
      <React.StrictMode>
        <App serviceContainer={container} />
      </React.StrictMode>
    );
    
    // Logger is always available in ServiceMap
    const logger = container.get('logger');
    logger.info('[{{name}}] Mounted successfully with React 18');
  },
  
  unmount: async (container: ServiceContainer) => {
    if (root) {
      root.unmount();
      root = null;
    }
    
    const logger = container.get('logger');
    logger.info('[{{name}}] Unmounted successfully');
  }
};

export default module;`;

export const appTsxTemplate = `import React, { useState } from 'react';
import type { ServiceContainer } from '@mfe-toolkit/core';
// Import service types only if needed
// Example: import type { EventBus } from '@mfe-toolkit/service-event-bus';

interface AppProps {
  serviceContainer: ServiceContainer;
}

export const App: React.FC<AppProps> = ({ serviceContainer }) => {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount(prev => prev + 1);
    // Logger is always available
    const logger = serviceContainer.get('logger');
    logger.info(\`Button clicked! Count: \${count + 1}\`);
  };

  return (
    <div className="ds-card ds-p-6 ds-m-4">
      <div className="ds-text-center">
        <h1 className="ds-text-3xl ds-font-bold ds-mb-2 ds-text-accent-primary">
          ⚛️ Hello from {{name}}!
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

export const buildJsTemplate = `import { buildMFE } from '@mfe-toolkit/build';

await buildMFE({
  entry: 'src/main.tsx',
  outfile: 'dist/{{name}}.js',
  manifestPath: './manifest.json'
});`;

export const readmeTemplate = `# {{name}}

## Description
React 18 {{serviceType}} microfrontend with concurrent features and automatic batching.

## Features
- React 18 with Concurrent Rendering
- Automatic batching for better performance
- Suspense for data fetching
- Transitions API ready
- {{serviceFeature}}
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
Designed to be loaded by the MFE container application with shared dependencies via import maps.`;