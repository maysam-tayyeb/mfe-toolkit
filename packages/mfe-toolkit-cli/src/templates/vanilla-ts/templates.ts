// Template files as constants for better readability and maintainability
// These are imported at build time and bundled into the CLI

export const mainTsTemplate = `import type { MFEModule, ServiceContainer } from '@mfe-toolkit/core';
// Import service types only if needed (zero runtime cost)
// Example: import type { EventBus } from '@mfe-toolkit/service-event-bus';

const module: MFEModule = {
  mount: async (element: HTMLElement, container: ServiceContainer) => {
    let clickCount = 0;

    element.innerHTML = \`
      <div class="ds-card ds-p-6 ds-m-4">
        <div class="ds-text-center">
          <h1 class="ds-text-3xl ds-font-bold ds-mb-2 ds-text-accent-primary">
            📦 Hello from {{name}}!
          </h1>
          <p class="ds-text-gray-600 ds-mb-6">
            Vanilla TypeScript MFE • Zero Dependencies
          </p>
          
          <div class="ds-card-compact ds-inline-block ds-p-4">
            <div class="ds-text-4xl ds-font-bold ds-text-accent-primary ds-mb-2">
              <span id="counter">0</span>
            </div>
            <button id="increment-btn" class="ds-btn-primary">
              Click me!
            </button>
          </div>
          
          <p class="ds-text-sm ds-text-gray-500 ds-mt-6">
            Built with ❤️ using MFE Toolkit
          </p>
        </div>
      </div>
    \`;
    
    element.querySelector('#increment-btn')?.addEventListener('click', () => {
      clickCount++;
      const counterEl = element.querySelector('#counter');
      if (counterEl) counterEl.textContent = String(clickCount);
      
      // Services are available but should be checked for safety
      const logger = container.get('logger');
      logger.info(\`Button clicked! Count: \${clickCount}\`);
    });
    
    // Logger is always available in ServiceMap
    const logger = container.get('logger');
    logger.info('[{{name}}] Mounted successfully');
  },
  
  unmount: async (container: ServiceContainer) => {
    const logger = container.get('logger');
    logger.info('[{{name}}] Unmounted successfully');
  }
};

export default module;`;

export const buildJsTemplate = `import { buildMFE } from '@mfe-toolkit/build';

await buildMFE({
  entry: 'src/main.ts',
  outfile: 'dist/{{name}}.js',
  manifestPath: './manifest.json'
});`;

export const readmeTemplate = `# {{name}}

Vanilla TypeScript MFE with zero framework dependencies.`;