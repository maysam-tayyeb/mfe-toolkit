/**
 * MFE Development Container Server
 * Serves the MFE with all necessary services and UI
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import chalk from 'chalk';

export interface ServerConfig {
  port?: number;
  mfePath: string;
  mfeConfig: any;
  servicesUI?: boolean;
  hot?: boolean;
}

export class DevContainerServer {
  private app: express.Application;
  private server: any;
  private wss?: WebSocketServer;
  private config: ServerConfig;

  constructor(config: ServerConfig) {
    this.config = config;
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    // Enable CORS for all origins in dev
    this.app.use(cors());

    // Parse JSON bodies
    this.app.use(express.json());

    // Serve static files from MFE dist
    const mfeDistPath = path.join(this.config.mfePath, 'dist');
    if (fs.existsSync(mfeDistPath)) {
      this.app.use('/mfe', express.static(mfeDistPath));
    }

    // Serve node_modules for shared dependencies
    const nodeModulesPath = path.join(process.cwd(), 'node_modules');
    this.app.use('/node_modules', express.static(nodeModulesPath));
  }

  private setupRoutes(): void {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok', mfe: this.config.mfeConfig.name });
    });

    // MFE config endpoint
    this.app.get('/api/mfe-config', (req, res) => {
      res.json(this.config.mfeConfig);
    });

    // Shared dependencies endpoint
    this.app.get('/api/shared-deps', (req, res) => {
      const deps = this.config.mfeConfig.devContainer?.sharedDependencies || {};
      res.json(deps);
    });

    // Service status endpoint
    this.app.get('/api/services', (req, res) => {
      const services = this.config.mfeConfig.devContainer?.services || {};
      res.json(services);
    });

    // Main HTML page
    this.app.get('/', (req, res) => {
      const html = this.generateHTML();
      res.send(html);
    });

    // Services UI (if enabled)
    if (this.config.servicesUI) {
      this.app.get('/services-ui', (req, res) => {
        const html = this.generateServicesUI();
        res.send(html);
      });
    }
  }

  private generateHTML(): string {
    const { mfeConfig } = this.config;
    const framework = mfeConfig.framework || 'vanilla';
    const sharedDeps = mfeConfig.devContainer?.sharedDependencies || {};

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${mfeConfig.displayName || mfeConfig.name} - Dev Container</title>
  <script src="https://cdn.tailwindcss.com"></script>
  ${
    framework.includes('react')
      ? `
  <script crossorigin src="https://unpkg.com/react@${sharedDeps.react || '19.0.0'}/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@${sharedDeps['react-dom'] || '19.0.0'}/umd/react-dom.development.js"></script>
  `
      : ''
  }
  ${
    framework.includes('vue')
      ? `
  <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
  `
      : ''
  }
  <style>
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
  </style>
</head>
<body class="bg-gray-50 dark:bg-gray-900">
  <!-- Dev Container Header -->
  <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
    <div class="max-w-7xl mx-auto flex items-center justify-between">
      <div class="flex items-center gap-4">
        <span class="text-sm font-semibold text-gray-900 dark:text-gray-100">
          🔧 MFE Dev Container
        </span>
        <span class="text-xs text-gray-500 dark:text-gray-400">
          ${mfeConfig.name} v${mfeConfig.version || '0.0.0'}
        </span>
      </div>
      <div class="flex items-center gap-2">
        ${
          this.config.servicesUI
            ? `
        <a href="/services-ui" target="_blank" class="text-xs px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
          Services UI
        </a>
        `
            : ''
        }
        <span class="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
          Port: ${this.config.port || 3333}
        </span>
      </div>
    </div>
  </div>
  
  <!-- MFE Mount Point -->
  <div id="mfe-root" class="min-h-screen"></div>
  
  <!-- Modal Container -->
  <div id="dev-modal-container"></div>
  
  <!-- Notification Container -->
  <div id="dev-notification-container"></div>
  
  <!-- Load MFE -->
  <script type="module">
    // Import services from dev container
    import('/mfe/main.js').then(async (module) => {
      const { createDevServices } = await import('/api/services.js');
      
      // Create services
      const services = createDevServices({
        framework: '${framework}',
        mockAuth: ${JSON.stringify(mfeConfig.devContainer?.mockAuth || false)},
        theme: '${mfeConfig.devContainer?.theme || 'light'}',
      });
      
      // Mount MFE
      const mountPoint = document.getElementById('mfe-root');
      if (module.default && typeof module.default === 'function') {
        const mfe = module.default({ services });
        if (mfe && mfe.mount) {
          mfe.mount(mountPoint);
        }
      } else if (module.mount) {
        module.mount(mountPoint, { services });
      }
      
      console.log('✅ MFE mounted with dev container services');
    }).catch(error => {
      console.error('Failed to load MFE:', error);
      document.getElementById('mfe-root').innerHTML = \`
        <div class="flex items-center justify-center min-h-screen">
          <div class="text-center">
            <div class="text-red-500 text-4xl mb-4">⚠️</div>
            <h2 class="text-xl font-semibold mb-2">Failed to load MFE</h2>
            <p class="text-gray-600 dark:text-gray-400 mb-4">Check the console for errors</p>
            <pre class="text-xs text-left bg-gray-100 dark:bg-gray-800 p-4 rounded">\${error.message}</pre>
          </div>
        </div>
      \`;
    });
  </script>
  
  ${this.config.hot ? this.generateHotReloadScript() : ''}
</body>
</html>`;
  }

  private generateServicesUI(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Services UI - ${this.config.mfeConfig.name}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 dark:bg-gray-900">
  <div class="max-w-4xl mx-auto p-6">
    <h1 class="text-2xl font-bold mb-6">MFE Services Tester</h1>
    
    <div class="grid gap-6">
      <!-- Modal Service -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold mb-4">Modal Service</h2>
        <div class="grid grid-cols-2 gap-2">
          <button onclick="testModal('info')" class="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Info Modal
          </button>
          <button onclick="testModal('confirm')" class="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600">
            Confirm Modal
          </button>
        </div>
      </div>
      
      <!-- Notification Service -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold mb-4">Notification Service</h2>
        <div class="grid grid-cols-2 gap-2">
          <button onclick="testNotification('success')" class="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600">
            Success
          </button>
          <button onclick="testNotification('error')" class="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600">
            Error
          </button>
          <button onclick="testNotification('warning')" class="px-3 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">
            Warning
          </button>
          <button onclick="testNotification('info')" class="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Info
          </button>
        </div>
      </div>
      
      <!-- Event Bus -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold mb-4">Event Bus</h2>
        <div class="space-y-2">
          <input type="text" id="event-name" placeholder="Event name" class="w-full px-3 py-2 border rounded">
          <input type="text" id="event-data" placeholder="Event data (JSON)" class="w-full px-3 py-2 border rounded">
          <button onclick="testEventBus()" class="px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600">
            Emit Event
          </button>
        </div>
        <div id="event-log" class="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono"></div>
      </div>
    </div>
  </div>
  
  <script>
    // Service testing functions will be injected here
  </script>
</body>
</html>`;
  }

  private generateHotReloadScript(): string {
    return `
    <script>
      // Hot reload via WebSocket
      const ws = new WebSocket('ws://localhost:${this.config.port}/ws');
      ws.onmessage = (event) => {
        if (event.data === 'reload') {
          console.log('🔄 Hot reloading...');
          window.location.reload();
        }
      };
    </script>`;
  }

  private setupWebSocket(): void {
    if (!this.config.hot) return;

    this.wss = new WebSocketServer({ server: this.server });

    this.wss.on('connection', (ws) => {
      console.log(chalk.gray('WebSocket client connected'));

      ws.on('error', (error) => {
        console.error(chalk.red('WebSocket error:'), error);
      });
    });
  }

  public notifyReload(): void {
    if (!this.wss) return;

    this.wss.clients.forEach((client) => {
      if (client.readyState === 1) {
        // WebSocket.OPEN
        client.send('reload');
      }
    });
  }

  public async start(): Promise<void> {
    const port = this.config.port || 3333;

    return new Promise((resolve, reject) => {
      this.server = createServer(this.app);

      this.server.listen(port, () => {
        console.log(chalk.green(`\n✨ MFE Dev Container started!`));
        console.log(
          chalk.cyan(`\n  MFE: ${this.config.mfeConfig.displayName || this.config.mfeConfig.name}`)
        );
        console.log(chalk.cyan(`  URL: http://localhost:${port}`));

        if (this.config.servicesUI) {
          console.log(chalk.cyan(`  Services UI: http://localhost:${port}/services-ui`));
        }

        if (this.config.hot) {
          console.log(chalk.yellow(`  Hot reload: enabled`));
          this.setupWebSocket();
        }

        console.log(chalk.gray(`\n  Press Ctrl+C to stop\n`));

        resolve();
      });

      this.server.on('error', reject);
    });
  }

  public stop(): void {
    if (this.wss) {
      this.wss.close();
    }
    if (this.server) {
      this.server.close();
    }
  }
}
