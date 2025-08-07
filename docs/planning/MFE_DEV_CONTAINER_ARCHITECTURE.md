# MFE Development Container Architecture

## Executive Summary

The MFE Development Container is a critical infrastructure component that enables developers to build and test MFEs in isolation without needing the full container application. This document outlines the architecture, implementation strategy, and usage patterns for the universal development container.

## Problem Analysis

### Current Challenges
1. **Dependency on Main Container**: MFEs cannot be developed independently
2. **Service Mocking**: No easy way to test service integrations
3. **Framework Differences**: Each framework might need different setup
4. **Developer Experience**: Complex setup for simple MFE development
5. **Testing Services**: No UI for testing modal, notification, event services

### Requirements
- Framework agnostic (React 17/19, Vue 3, Vanilla JS/TS)
- All container services available
- Hot reload support
- Service testing UI
- Minimal configuration
- TypeScript support
- Production parity

## Architecture Decision

### Option Analysis

#### Option A: Universal Dev Container (Recommended ✅)
**Pros:**
- Single implementation to maintain
- Consistent experience across frameworks
- Smaller package size overall
- Easier to keep in sync with production container

**Cons:**
- Might need framework-specific adapters
- More complex initial implementation

#### Option B: Framework-Specific Containers
**Pros:**
- Optimized for each framework
- Framework-specific tooling integration

**Cons:**
- Multiple implementations to maintain
- Inconsistency risks
- Larger overall package size
- More documentation needed

#### Option C: Extend Main Container
**Pros:**
- Reuses existing code
- Guaranteed parity

**Cons:**
- Too heavy for development
- Includes unnecessary features
- Slower startup time

**Decision: Option A - Universal Dev Container**

## Technical Architecture

### Package Structure
```
packages/mfe-toolkit-dev-container/
├── src/
│   ├── index.ts                 # Main entry point
│   ├── server/
│   │   ├── dev-server.ts        # Development server
│   │   ├── middleware.ts        # HMR, proxy middleware
│   │   └── static-server.ts     # Static file serving
│   ├── services/
│   │   ├── index.ts             # Service initialization
│   │   ├── modal-service.ts     # Modal implementation
│   │   ├── notification-service.ts
│   │   ├── event-bus-service.ts
│   │   ├── logger-service.ts
│   │   ├── auth-service.ts
│   │   ├── theme-service.ts
│   │   └── state-service.ts
│   ├── ui/
│   │   ├── dev-panel.ts         # Service tester panel
│   │   ├── components/          # UI components
│   │   └── styles/              # Panel styles
│   ├── templates/
│   │   ├── index.html           # Container HTML
│   │   └── loader.js            # MFE loader script
│   └── cli.ts                   # CLI interface
├── dist/
├── package.json
└── README.md
```

### Core Components

#### 1. Development Server
```typescript
export class DevServer {
  private app: Express;
  private services: MFEServices;
  private mfeWatcher: FSWatcher;
  
  constructor(options: DevServerOptions) {
    this.app = express();
    this.setupMiddleware();
    this.setupServices();
    this.setupRoutes();
  }
  
  private setupMiddleware() {
    // CORS for cross-origin MFE loading
    this.app.use(cors());
    
    // HMR middleware
    if (this.options.hot) {
      this.app.use(hmrMiddleware());
    }
    
    // Proxy middleware for API calls
    if (this.options.proxy) {
      this.app.use(proxyMiddleware(this.options.proxy));
    }
  }
  
  private setupServices() {
    this.services = {
      modal: new ModalService(),
      notification: new NotificationService(),
      eventBus: new EventBusService(),
      logger: new LoggerService(),
      auth: new AuthService(this.options.mockAuth),
      theme: new ThemeService(),
      state: new StateService(),
    };
  }
  
  async start() {
    const port = this.options.port || 3333;
    this.app.listen(port, () => {
      console.log(`🚀 MFE Dev Container running at http://localhost:${port}`);
    });
  }
}
```

#### 2. Service Implementations
```typescript
// Modal Service with UI bridge
export class ModalService implements IModalService {
  private modals: Map<string, ModalConfig> = new Map();
  
  open(config: ModalConfig): string {
    const id = generateId();
    this.modals.set(id, config);
    
    // Send to UI via WebSocket
    this.sendToUI('modal:open', { id, config });
    
    // Also render in container
    this.renderModal(config);
    
    return id;
  }
  
  close(id?: string): void {
    if (id) {
      this.modals.delete(id);
      this.sendToUI('modal:close', { id });
    } else {
      this.closeAll();
    }
  }
  
  private renderModal(config: ModalConfig) {
    // Render modal in container UI
    const modalEl = document.createElement('div');
    modalEl.className = 'dev-container-modal';
    modalEl.innerHTML = this.getModalHTML(config);
    document.body.appendChild(modalEl);
  }
}
```

#### 3. Service Tester Panel
```typescript
export class ServiceTesterPanel {
  private container: HTMLElement;
  private services: MFEServices;
  
  constructor(services: MFEServices) {
    this.services = services;
    this.render();
    this.attachEventListeners();
  }
  
  private render() {
    this.container = document.createElement('div');
    this.container.className = 'mfe-dev-panel';
    this.container.innerHTML = `
      <div class="panel-header">
        <h3>Service Tester</h3>
        <button class="panel-toggle">_</button>
      </div>
      
      <div class="panel-content">
        <!-- Modal Tester -->
        <section class="service-section">
          <h4>Modal Service</h4>
          <button data-action="modal:simple">Simple Modal</button>
          <button data-action="modal:confirm">Confirmation</button>
          <button data-action="modal:form">Form Modal</button>
          <textarea id="modal-content" placeholder="Custom content..."></textarea>
          <button data-action="modal:custom">Custom Modal</button>
        </section>
        
        <!-- Notification Tester -->
        <section class="service-section">
          <h4>Notifications</h4>
          <input id="notif-message" placeholder="Message...">
          <div class="button-group">
            <button data-action="notif:success">Success</button>
            <button data-action="notif:error">Error</button>
            <button data-action="notif:warning">Warning</button>
            <button data-action="notif:info">Info</button>
          </div>
        </section>
        
        <!-- Event Bus Tester -->
        <section class="service-section">
          <h4>Event Bus</h4>
          <input id="event-name" placeholder="Event name...">
          <textarea id="event-data" placeholder="Event data (JSON)..."></textarea>
          <button data-action="event:emit">Emit Event</button>
          <div class="event-log" id="event-log"></div>
        </section>
        
        <!-- Auth Mock -->
        <section class="service-section">
          <h4>Auth State</h4>
          <label>
            <input type="checkbox" id="auth-logged-in"> Logged In
          </label>
          <input id="auth-user" placeholder="Username...">
          <input id="auth-roles" placeholder="Roles (comma-separated)...">
          <button data-action="auth:update">Update Auth</button>
        </section>
        
        <!-- Theme -->
        <section class="service-section">
          <h4>Theme</h4>
          <button data-action="theme:toggle">Toggle Theme</button>
          <select id="theme-select">
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="auto">Auto</option>
          </select>
        </section>
      </div>
    `;
    
    document.body.appendChild(this.container);
  }
  
  private attachEventListeners() {
    this.container.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const action = target.dataset.action;
      
      if (action) {
        this.handleAction(action);
      }
    });
  }
  
  private handleAction(action: string) {
    const [service, method] = action.split(':');
    
    switch (service) {
      case 'modal':
        this.testModalService(method);
        break;
      case 'notif':
        this.testNotificationService(method);
        break;
      case 'event':
        this.testEventBus(method);
        break;
      case 'auth':
        this.testAuthService(method);
        break;
      case 'theme':
        this.testThemeService(method);
        break;
    }
  }
}
```

### HTML Template
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MFE Dev Container</title>
  <style>
    /* Base styles */
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; }
    
    /* Layout */
    .dev-container {
      display: grid;
      grid-template-columns: 300px 1fr;
      grid-template-rows: 60px 1fr 200px;
      height: 100vh;
    }
    
    .dev-header {
      grid-column: 1 / -1;
      background: #1a1a1a;
      color: white;
      display: flex;
      align-items: center;
      padding: 0 20px;
    }
    
    .dev-panel {
      background: #f5f5f5;
      border-right: 1px solid #ddd;
      overflow-y: auto;
      padding: 20px;
    }
    
    .mfe-container {
      background: white;
      padding: 20px;
      overflow: auto;
    }
    
    .dev-console {
      grid-column: 1 / -1;
      background: #2d2d2d;
      color: #f0f0f0;
      padding: 10px;
      overflow-y: auto;
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 12px;
    }
    
    /* Service Tester Styles */
    .service-section {
      margin-bottom: 20px;
      padding-bottom: 20px;
      border-bottom: 1px solid #ddd;
    }
    
    .service-section h4 {
      margin-bottom: 10px;
      color: #333;
    }
    
    .service-section button {
      padding: 6px 12px;
      margin: 4px;
      border: 1px solid #ddd;
      background: white;
      border-radius: 4px;
      cursor: pointer;
    }
    
    .service-section button:hover {
      background: #f0f0f0;
    }
    
    .service-section input,
    .service-section textarea {
      width: 100%;
      padding: 6px;
      margin: 4px 0;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    
    .event-log {
      background: white;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 8px;
      margin-top: 8px;
      max-height: 150px;
      overflow-y: auto;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="dev-container">
    <header class="dev-header">
      <h1>MFE Dev Container</h1>
      <span id="mfe-name"></span>
      <div class="dev-status">
        <span id="connection-status">● Connected</span>
      </div>
    </header>
    
    <aside class="dev-panel" id="service-tester">
      <!-- Service tester panel injected here -->
    </aside>
    
    <main class="mfe-container" id="mfe-mount">
      <!-- MFE mounts here -->
      <div class="loading">Loading MFE...</div>
    </main>
    
    <div class="dev-console" id="console">
      <!-- Console logs appear here -->
    </div>
  </div>
  
  <!-- Service implementations -->
  <script src="/__dev-container/services.js"></script>
  
  <!-- MFE Loader -->
  <script src="/__dev-container/loader.js"></script>
  
  <!-- Dev Panel UI -->
  <script src="/__dev-container/panel.js"></script>
  
  <!-- Initialize -->
  <script>
    window.__DEV_CONTAINER__.init({
      mfeUrl: '{{MFE_URL}}',
      mfeName: '{{MFE_NAME}}',
      hot: {{HOT_RELOAD}},
      services: {{SERVICES_CONFIG}}
    });
  </script>
</body>
</html>
```

## Usage Patterns

### 1. Basic Usage
```bash
# In an MFE directory with package.json
npx @mfe-toolkit/dev-container

# With options
npx @mfe-toolkit/dev-container --port 4000 --no-ui
```

### 2. Package.json Integration
```json
{
  "name": "my-mfe",
  "scripts": {
    "dev": "mfe-dev-container",
    "dev:mock": "mfe-dev-container --mock-auth --mock-data",
    "build": "esbuild src/main.ts --bundle --format=esm"
  },
  "mfe": {
    "name": "myMFE",
    "entry": "./src/main.ts",
    "devContainer": {
      "port": 3333,
      "mockAuth": true,
      "servicesUI": true
    }
  }
}
```

### 3. Configuration File
```javascript
// mfe.config.js
export default {
  name: 'My MFE',
  entry: './src/main.ts',
  devContainer: {
    port: 3333,
    servicesUI: true,
    mockAuth: {
      user: { id: '123', name: 'Dev User' },
      roles: ['admin', 'user']
    },
    proxy: {
      '/api': 'http://localhost:8080'
    }
  }
};
```

### 4. CLI Commands
```bash
# Create new MFE with dev container
mfe-toolkit create my-mfe --template react19 --with-dev

# Run dev container
mfe-toolkit dev

# Build for production
mfe-toolkit build

# Test with production container
mfe-toolkit test --container production
```

## Integration with Build Tools

### Vite Integration
```javascript
// vite.config.js
import { defineConfig } from 'vite';
import mfeDevContainer from '@mfe-toolkit/vite-plugin-dev-container';

export default defineConfig({
  plugins: [
    mfeDevContainer({
      servicesUI: true,
      mockAuth: true
    })
  ]
});
```

### esbuild Integration
```javascript
// esbuild.config.js
const { devContainerPlugin } = require('@mfe-toolkit/esbuild-plugin-dev-container');

require('esbuild').build({
  entryPoints: ['src/main.ts'],
  bundle: true,
  format: 'esm',
  plugins: [
    devContainerPlugin({
      watch: true,
      servicesUI: true
    })
  ]
});
```

## Service Mock Configurations

### Auth Service Mocking
```typescript
// Predefined auth states
export const authStates = {
  anonymous: {
    isAuthenticated: false,
    user: null,
    roles: [],
    permissions: []
  },
  user: {
    isAuthenticated: true,
    user: { id: '1', name: 'John Doe', email: 'john@example.com' },
    roles: ['user'],
    permissions: ['read']
  },
  admin: {
    isAuthenticated: true,
    user: { id: '2', name: 'Admin User', email: 'admin@example.com' },
    roles: ['admin', 'user'],
    permissions: ['read', 'write', 'delete']
  }
};
```

### Event Bus Patterns
```typescript
// Common test events
export const testEvents = {
  'user:login': { userId: '123', timestamp: Date.now() },
  'user:logout': { userId: '123', timestamp: Date.now() },
  'theme:change': { theme: 'dark' },
  'data:update': { entity: 'user', id: '123', changes: {} },
  'app:ready': { version: '1.0.0' }
};
```

## Benefits

1. **Independence**: Develop MFEs without main container
2. **Consistency**: Same services as production
3. **Testing**: Easy service integration testing
4. **Speed**: Fast development iteration
5. **Debugging**: Built-in debugging tools
6. **Documentation**: Service API exploration

## Migration Path

### For Existing MFEs
1. Add `mfe.config.js` to MFE root
2. Update `package.json` scripts
3. Remove any mock service implementations
4. Use dev container for development

### For New MFEs
1. Use CLI to create with template
2. Dev container pre-configured
3. Start developing immediately

## Next Steps

1. **Implement Core Package** (Priority 1)
   - Basic dev server
   - Service implementations
   - MFE loader

2. **Add Service UI** (Priority 2)
   - Service tester panel
   - Event log
   - State inspector

3. **Build Tool Plugins** (Priority 3)
   - Vite plugin
   - esbuild plugin
   - Webpack plugin

4. **Documentation** (Priority 4)
   - Usage guides
   - API documentation
   - Migration guides

## Conclusion

The MFE Development Container is essential infrastructure that will significantly improve the developer experience and accelerate MFE development. By providing a universal, framework-agnostic solution with comprehensive service testing capabilities, we enable developers to build and test MFEs efficiently while maintaining production parity.