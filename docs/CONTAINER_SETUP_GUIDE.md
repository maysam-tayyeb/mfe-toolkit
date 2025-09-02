# Complete Container Setup Guide

This guide walks you through creating a container application from scratch to host your MFEs.

## Table of Contents

1. [What is a Container?](#what-is-a-container)
2. [Creating a New Container Project](#creating-a-new-container-project)
3. [Setting Up MFE Services](#setting-up-mfe-services)
4. [Creating the MFE Loader](#creating-the-mfe-loader)
5. [Registry Configuration](#registry-configuration)
6. [Container UI and Layout](#container-ui-and-layout)
7. [Development Workflow](#development-workflow)
8. [Production Setup](#production-setup)

## What is a Container?

A container application is the host that:
- **Loads and manages MFEs** dynamically
- **Provides shared services** (event bus, logger, auth, etc.)
- **Handles routing** between MFEs
- **Manages shared state** and user sessions
- **Provides common UI** (navigation, layouts, modals)

## Creating a New Container Project

### Step 1: Initialize the Project

> **📁 Or Clone Existing Container:** `apps/container-react/`

```bash
# Create a new directory
mkdir my-container-app
cd my-container-app

# Initialize package.json
npm init -y

# Install core dependencies
npm install react react-dom react-router-dom
npm install @mfe-toolkit/core @mfe-toolkit/react

# Install dev dependencies
npm install -D vite @vitejs/plugin-react typescript @types/react @types/react-dom
```

### Step 2: Project Structure

Create this folder structure:

```
my-container-app/
├── src/
│   ├── components/
│   │   ├── Layout.tsx
│   │   ├── Navigation.tsx
│   │   ├── MFEContainer.tsx
│   │   └── ErrorBoundary.tsx
│   ├── contexts/
│   │   ├── ServicesContext.tsx
│   │   ├── AuthContext.tsx
│   │   └── UIContext.tsx
│   ├── services/
│   │   ├── service-container.ts
│   │   └── registry.ts
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   └── MFEPage.tsx
│   ├── App.tsx
│   └── main.tsx
├── public/
│   ├── mfe-registry.json
│   └── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

### Step 3: Configure Vite

Create `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    cors: true
  },
  build: {
    target: 'esnext',
    minify: 'esbuild'
  }
});
```

### Step 4: TypeScript Configuration

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

## Setting Up MFE Services

### Step 1: Create the Services

> **📁 See Working Example:** `apps/container-react/src/services/service-container.ts`

Create `src/services/service-container.ts`:

```typescript
import {
  ServiceContainer,
  ServiceMap,
  createLogger,
  getErrorReporter,
} from '@mfe-toolkit/core';
import { createPlatformEventBus } from './platform-event-bus';
import { getThemeService } from './theme-service';

// React context values interface
export interface ReactContextValues {
  auth: {
    session: {
      userId: string;
      username: string;
      email: string;
      roles: string[];
      permissions: string[];
      isAuthenticated: boolean;
    } | null;
  };
  ui: {
    openModal: (config: BaseModalConfig) => void;
    closeModal: () => void;
    addNotification: (config: NotificationConfig) => void;
  };
}

/**
 * Unified Service Container - Provides all services to MFEs
 */
export class UnifiedServiceContainer implements ServiceContainer {
  private services = new Map<string, unknown>();
  private contextValues: ReactContextValues | null = null;
  private eventBus = createPlatformEventBus();
  private logger = createLogger('MFE');
  private themeService = getThemeService();

  /**
   * Update React context values for services that need them
   */
  setContextValues(values: ReactContextValues) {
    this.contextValues = values;
  }

  /**
   * Get a service by name
   */
  get<K extends keyof ServiceMap>(name: K): ServiceMap[K] | undefined {
    return this.getOrCreateService(name);
  }

  /**
   * Create service instances that read from React contexts
   */
  private getOrCreateService(name: string): unknown {
    if (this.services.has(name)) {
      return this.services.get(name);
    }

    let service: unknown;

    switch (name) {
      case 'logger':
        service = this.logger;
        break;
      case 'eventBus':
        service = this.eventBus;
        break;
      case 'auth':
        service = this.createAuthService();
        break;
      case 'modal':
        service = this.createModalService();
        break;
      case 'notification':
        service = this.createNotificationService();
        break;
      case 'theme':
        service = this.themeService;
        break;
      // Add more services as needed
    }

    if (service !== undefined) {
      this.services.set(name, service);
    }

    return service;
  }

  // Service creation methods...
  private createAuthService() { /* ... */ }
  private createModalService() { /* ... */ }
  private createNotificationService() { /* ... */ }

  // Other ServiceContainer interface methods...
  require(name: string) { /* ... */ }
  has(name: string) { /* ... */ }
  listAvailable() { /* ... */ }
  getAllServices() { /* ... */ }
  createScoped(overrides: Record<string, unknown>) { /* ... */ }
  async dispose() { /* ... */ }
}

/**
 * Create the service container
 */
export function createServiceContainer(): UnifiedServiceContainer {
  return new UnifiedServiceContainer();
}
```

### Step 2: Create Services Context

> **📁 See Working Example:** `apps/container-react/src/contexts/ServiceContext.tsx`

Create `src/contexts/ServicesContext.tsx`:

```tsx
import React, { createContext, useContext, ReactNode } from 'react';
import { type MFEServices } from '@mfe-toolkit/core';
import { createServiceContainer } from '../services/service-container';

const ServicesContext = createContext<MFEServices | null>(null);

export const ServicesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const services = useMemo(() => createServiceContainer(), []);
  
  return (
    <ServicesContext.Provider value={services}>
      {children}
    </ServicesContext.Provider>
  );
};

export const useServices = () => {
  const context = useContext(ServicesContext);
  if (!context) {
    throw new Error('useServices must be used within ServicesProvider');
  }
  return context;
};
```

### Step 3: Create UI Context for Modals and Notifications

> **📁 See Working Example:** `apps/container-react/src/contexts/UIContext.tsx`

Create `src/contexts/UIContext.tsx`:

```tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useServices } from './ServicesContext';

interface ModalConfig {
  isOpen: boolean;
  title?: string;
  content?: ReactNode;
  onConfirm?: () => void;
  onClose?: () => void;
}

interface NotificationConfig {
  id: string;
  title: string;
  message?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
}

interface UIContextType {
  modal: ModalConfig;
  notifications: NotificationConfig[];
  openModal: (config: Omit<ModalConfig, 'isOpen'>) => void;
  closeModal: () => void;
  addNotification: (config: Omit<NotificationConfig, 'id'>) => void;
  removeNotification: (id: string) => void;
}

const UIContext = createContext<UIContextType | null>(null);

export const UIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const services = useServices();
  const [modal, setModal] = useState<ModalConfig>({ isOpen: false });
  const [notifications, setNotifications] = useState<NotificationConfig[]>([]);

  // Connect to event bus
  useEffect(() => {
    const unsubscribeModal = services.eventBus.on('ui:modal:open', (config) => {
      setModal({ ...config, isOpen: true });
    });

    const unsubscribeModalClose = services.eventBus.on('ui:modal:close', () => {
      setModal({ isOpen: false });
    });

    const unsubscribeNotification = services.eventBus.on('ui:notification:show', (config) => {
      const notification = {
        ...config,
        id: `notification-${Date.now()}`
      };
      setNotifications(prev => [...prev, notification]);

      // Auto-remove after duration
      if (config.duration !== 0) {
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== notification.id));
        }, config.duration || 5000);
      }
    });

    return () => {
      unsubscribeModal();
      unsubscribeModalClose();
      unsubscribeNotification();
    };
  }, [services]);

  const openModal = (config: Omit<ModalConfig, 'isOpen'>) => {
    setModal({ ...config, isOpen: true });
  };

  const closeModal = () => {
    setModal({ isOpen: false });
  };

  const addNotification = (config: Omit<NotificationConfig, 'id'>) => {
    const notification = {
      ...config,
      id: `notification-${Date.now()}`
    };
    setNotifications(prev => [...prev, notification]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <UIContext.Provider value={{
      modal,
      notifications,
      openModal,
      closeModal,
      addNotification,
      removeNotification
    }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within UIProvider');
  }
  return context;
};
```

## Creating the MFE Loader

### Step 1: Basic MFE Container Component

> **📁 See Similar Implementation:** `apps/container-react/src/components/CompatibleMFELoader.tsx`

Create `src/components/MFEContainer.tsx`:

```tsx
import React, { useEffect, useRef, useState } from 'react';
import { useServices } from '../contexts/ServicesContext';
import type { MFEModule } from '@mfe-toolkit/core';

interface MFEContainerProps {
  url: string;
  name?: string;
  fallback?: React.ReactNode;
  onError?: (error: Error) => void;
}

export const MFEContainer: React.FC<MFEContainerProps> = ({
  url,
  name = 'Unknown MFE',
  fallback = <div>Loading MFE...</div>,
  onError
}) => {
  const services = useServices();
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const unmountRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const loadMFE = async () => {
      try {
        setLoading(true);
        setError(null);

        // Dynamically import the MFE
        const module = await import(/* @vite-ignore */ url);
        
        // Get the default export (MFE module)
        const mfeModule: MFEModule = module.default;
        
        if (typeof mfeModule !== 'function') {
          throw new Error(`MFE ${name} does not export a valid module`);
        }

        // Initialize the MFE with services
        const mfe = mfeModule(services);
        
        if (!mfe.mount || typeof mfe.mount !== 'function') {
          throw new Error(`MFE ${name} does not have a mount function`);
        }

        // Mount the MFE
        if (containerRef.current) {
          unmountRef.current = mfe.mount(containerRef.current);
        }

        setLoading(false);
        services.logger.info(`MFE ${name} loaded successfully`);
      } catch (err) {
        const error = err as Error;
        setError(error);
        setLoading(false);
        services.logger.error(`Failed to load MFE ${name}`, error);
        onError?.(error);
      }
    };

    loadMFE();

    // Cleanup
    return () => {
      if (unmountRef.current) {
        unmountRef.current();
        unmountRef.current = null;
      }
    };
  }, [url, name, services, onError]);

  if (loading) {
    return <>{fallback}</>;
  }

  if (error) {
    return (
      <div className="mfe-error">
        <h3>Failed to load {name}</h3>
        <p>{error.message}</p>
        <button onClick={() => window.location.reload()}>Reload</button>
      </div>
    );
  }

  return <div ref={containerRef} className="mfe-container" />;
};
```

### Step 2: Registry-Based MFE Loader

> **📁 See Working Example:** `apps/container-react/src/components/RegistryMFELoader.tsx`

Create `src/components/RegistryMFELoader.tsx`:

```tsx
import React, { useEffect, useState } from 'react';
import { MFEContainer } from './MFEContainer';

interface MFERegistryEntry {
  id: string;
  name: string;
  url: string;
  manifest?: string;
  config?: {
    preload?: boolean;
    singleton?: boolean;
  };
}

interface RegistryMFELoaderProps {
  id: string;
  fallback?: React.ReactNode;
  onError?: (error: Error) => void;
}

export const RegistryMFELoader: React.FC<RegistryMFELoaderProps> = ({
  id,
  fallback,
  onError
}) => {
  const [mfe, setMfe] = useState<MFERegistryEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRegistry = async () => {
      try {
        const response = await fetch('/mfe-registry.json');
        const data = await response.json();
        const foundMfe = data.mfes.find((m: MFERegistryEntry) => m.id === id);
        
        if (foundMfe) {
          setMfe(foundMfe);
        } else {
          throw new Error(`MFE with id ${id} not found in registry`);
        }
      } catch (error) {
        console.error('Failed to load MFE registry:', error);
        onError?.(error as Error);
      } finally {
        setLoading(false);
      }
    };

    loadRegistry();
  }, [id, onError]);

  if (loading) {
    return <>{fallback || <div>Loading registry...</div>}</>;
  }

  if (!mfe) {
    return <div>MFE {id} not found</div>;
  }

  return (
    <MFEContainer
      url={mfe.url}
      name={mfe.name}
      fallback={fallback}
      onError={onError}
    />
  );
};
```

## Registry Configuration

### Step 1: Create Registry File

> **📁 See Working Example:** `apps/container-react/public/mfe-registry.json`

Create `public/mfe-registry.json`:

```json
{
  "version": "1.0.0",
  "updated": "2024-01-15T10:00:00Z",
  "mfes": [
    {
      "id": "header",
      "name": "Header MFE",
      "url": "http://localhost:8080/header-mfe.js",
      "manifest": "http://localhost:8080/header/manifest.json",
      "config": {
        "preload": true,
        "singleton": true,
        "routes": ["/"]
      }
    },
    {
      "id": "dashboard",
      "name": "Dashboard MFE",
      "url": "http://localhost:8080/dashboard-mfe.js",
      "manifest": "http://localhost:8080/dashboard/manifest.json",
      "config": {
        "routes": ["/dashboard/*"]
      }
    },
    {
      "id": "profile",
      "name": "User Profile MFE",
      "url": "http://localhost:8080/profile-mfe.js",
      "manifest": "http://localhost:8080/profile/manifest.json",
      "config": {
        "routes": ["/profile/*"],
        "requiredAuth": true
      }
    }
  ]
}
```

### Step 2: Registry Service

> **📁 See Working Implementation:** `apps/container-react/src/services/registry-singleton.ts`

Create `src/services/registry.ts`:

```typescript
import { type MFEManifest } from '@mfe-toolkit/core';

export interface RegistryEntry {
  id: string;
  name: string;
  url: string;
  manifest?: string;
  config?: any;
}

export class MFERegistry {
  private entries: Map<string, RegistryEntry> = new Map();
  private manifests: Map<string, MFEManifest> = new Map();

  async loadRegistry(url: string = '/mfe-registry.json'): Promise<void> {
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      for (const entry of data.mfes) {
        this.entries.set(entry.id, entry);
        
        // Preload manifests if specified
        if (entry.manifest) {
          this.loadManifest(entry.id, entry.manifest);
        }
      }
    } catch (error) {
      console.error('Failed to load registry:', error);
      throw error;
    }
  }

  private async loadManifest(id: string, url: string): Promise<void> {
    try {
      const response = await fetch(url);
      const manifest = await response.json();
      this.manifests.set(id, manifest);
    } catch (error) {
      console.error(`Failed to load manifest for ${id}:`, error);
    }
  }

  getEntry(id: string): RegistryEntry | undefined {
    return this.entries.get(id);
  }

  getManifest(id: string): MFEManifest | undefined {
    return this.manifests.get(id);
  }

  getAllEntries(): RegistryEntry[] {
    return Array.from(this.entries.values());
  }

  getEntriesForRoute(route: string): RegistryEntry[] {
    return this.getAllEntries().filter(entry => {
      const routes = entry.config?.routes || [];
      return routes.some((r: string) => {
        if (r.endsWith('*')) {
          return route.startsWith(r.slice(0, -1));
        }
        return route === r;
      });
    });
  }
}

// Singleton instance
let registryInstance: MFERegistry | null = null;

export function getMFERegistry(): MFERegistry {
  if (!registryInstance) {
    registryInstance = new MFERegistry();
  }
  return registryInstance;
}
```

## Container UI and Layout

### Step 1: Create Layout Component

> **📁 See Working Example:** `apps/container-react/src/components/Layout.tsx`

Create `src/components/Layout.tsx`:

```tsx
import React, { ReactNode } from 'react';
import { Navigation } from './Navigation';
import { ModalManager } from './ModalManager';
import { NotificationManager } from './NotificationManager';
import { useUI } from '../contexts/UIContext';

interface LayoutProps {
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { modal, notifications } = useUI();

  return (
    <div className="app-layout">
      <Navigation />
      
      <main className="main-content">
        {children}
      </main>

      {/* Global UI Components */}
      {modal.isOpen && <ModalManager />}
      {notifications.length > 0 && <NotificationManager />}
    </div>
  );
};
```

### Step 2: Create Navigation Component

> **📁 See Working Example:** `apps/container-react/src/components/Navigation.tsx`

Create `src/components/Navigation.tsx`:

```tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useServices } from '../contexts/ServicesContext';

export const Navigation: React.FC = () => {
  const location = useLocation();
  const services = useServices();

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/profile', label: 'Profile' },
    { path: '/mfes', label: 'MFE Manager' }
  ];

  const handleNavClick = (path: string) => {
    services.eventBus.emit('navigation:change', { path });
    services.logger.info(`Navigating to ${path}`);
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h1>MFE Container</h1>
      </div>
      
      <ul className="navbar-menu">
        {navItems.map(item => (
          <li key={item.path}>
            <Link
              to={item.path}
              className={location.pathname === item.path ? 'active' : ''}
              onClick={() => handleNavClick(item.path)}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>

      <div className="navbar-actions">
        <button onClick={() => services.eventBus.emit('theme:toggle')}>
          🌙 Theme
        </button>
        <button onClick={() => services.eventBus.emit('auth:logout')}>
          Logout
        </button>
      </div>
    </nav>
  );
};
```

### Step 3: Create Modal Manager

> **📁 See Working Example:** `apps/container-react/src/components/ModalManager.tsx`

Create `src/components/ModalManager.tsx`:

```tsx
import React from 'react';
import { useUI } from '../contexts/UIContext';

export const ModalManager: React.FC = () => {
  const { modal, closeModal } = useUI();

  if (!modal.isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={closeModal}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {modal.title && (
          <div className="modal-header">
            <h2>{modal.title}</h2>
            <button onClick={closeModal}>×</button>
          </div>
        )}
        
        <div className="modal-body">
          {modal.content}
        </div>
        
        {(modal.onConfirm || modal.onClose) && (
          <div className="modal-footer">
            {modal.onClose && (
              <button onClick={() => {
                modal.onClose?.();
                closeModal();
              }}>
                Cancel
              </button>
            )}
            {modal.onConfirm && (
              <button onClick={() => {
                modal.onConfirm?.();
                closeModal();
              }}>
                Confirm
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
```

### Step 3.5: Create ContextBridge (Simplified)

> **📁 See Working Example:** `apps/container-react/src/services/context-bridge.tsx`

The ContextBridge is a simple component that syncs React context values to the service container so that services can access them:

```tsx
import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUI } from '@/contexts/UIContext';
import { useServices } from '@/contexts/ServiceContext';
import type { UnifiedServiceContainer } from './service-container';

export function ContextBridge({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const ui = useUI();
  const serviceContainer = useServices() as UnifiedServiceContainer;

  // Sync React context values to service container
  useEffect(() => {
    serviceContainer.setContextValues({
      auth: {
        session: auth.session,
      },
      ui: {
        openModal: ui.openModal,
        closeModal: ui.closeModal,
        addNotification: ui.addNotification,
      },
    });
  }, [auth.session, ui, serviceContainer]);

  return <>{children}</>;
}
```

Services read the context values directly when needed through this clean abstraction.

### Step 4: Create Main App Component

> **📁 See Working Example:** `apps/container-react/src/App.tsx`

Create `src/App.tsx`:

```tsx
import React, { useEffect, useMemo } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ServicesProvider } from './contexts/ServicesContext';
import { AuthProvider } from './contexts/AuthContext';
import { UIProvider } from './contexts/UIContext';
import { ContextBridge } from './services/context-bridge';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { MFEPage } from './pages/MFEPage';
import { ErrorBoundary } from './components/ErrorBoundary';
import { getMFERegistry } from './services/registry';

export const App: React.FC = () => {
  useEffect(() => {
    // Load MFE registry on app start
    const registry = getMFERegistry();
    registry.loadRegistry().catch(console.error);
  }, []);

  return (
    <ErrorBoundary>
      <ServicesProvider>
        <AuthProvider>
          <UIProvider>
            <ContextBridge>
              <BrowserRouter>
                <Layout>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/dashboard/*" element={<MFEPage mfeId="dashboard" />} />
                    <Route path="/profile/*" element={<MFEPage mfeId="profile" />} />
                    <Route path="/mfes" element={<MFEManagerPage />} />
                  </Routes>
                </Layout>
              </BrowserRouter>
            </ContextBridge>
          </UIProvider>
        </AuthProvider>
      </ServicesProvider>
    </ErrorBoundary>
  );
};

// MFE Manager Page - shows all available MFEs
const MFEManagerPage: React.FC = () => {
  const [registry, setRegistry] = React.useState<any[]>([]);

  React.useEffect(() => {
    fetch('/mfe-registry.json')
      .then(res => res.json())
      .then(data => setRegistry(data.mfes));
  }, []);

  return (
    <div className="mfe-manager">
      <h1>Available MFEs</h1>
      <div className="mfe-grid">
        {registry.map(mfe => (
          <div key={mfe.id} className="mfe-card">
            <h3>{mfe.name}</h3>
            <p>ID: {mfe.id}</p>
            <p>URL: {mfe.url}</p>
            <RegistryMFELoader id={mfe.id} />
          </div>
        ))}
      </div>
    </div>
  );
};
```

### Step 5: Create Entry Point

> **📁 See Working Example:** `apps/container-react/src/main.tsx`

Create `src/main.tsx`:

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

## Development Workflow

### Step 1: Package Scripts

Update `package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "serve:mfes": "npx serve ../mfes/dist -p 8080 --cors",
    "dev:all": "concurrently \"npm run dev\" \"npm run serve:mfes\"",
    "type-check": "tsc --noEmit",
    "lint": "eslint src --ext .ts,.tsx"
  }
}
```

### Step 2: Running the Container

```bash
# Start the container in development mode
npm run dev

# In another terminal, serve your MFEs
npm run serve:mfes

# Or run both together
npm run dev:all
```

### Step 3: Adding Styles

> **📁 See Design System:** `packages/design-system/src/styles/index.css`
> **Container Styles:** `apps/container-react/src/index.css`

Create `src/styles/index.css`:

```css
/* Container Layout */
.app-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #1e293b;
  color: white;
}

.navbar-menu {
  display: flex;
  list-style: none;
  gap: 2rem;
  margin: 0;
  padding: 0;
}

.navbar-menu a {
  color: white;
  text-decoration: none;
  transition: opacity 0.2s;
}

.navbar-menu a:hover,
.navbar-menu a.active {
  opacity: 0.8;
  text-decoration: underline;
}

.main-content {
  flex: 1;
  overflow: auto;
  padding: 2rem;
  background: #f8fafc;
}

/* MFE Container */
.mfe-container {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.mfe-error {
  padding: 2rem;
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 8px;
  text-align: center;
}

.mfe-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.mfe-card {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Modal */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-body {
  padding: 1rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1rem;
  border-top: 1px solid #e2e8f0;
}

/* Notifications */
.notifications {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.notification {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 300px;
  animation: slideIn 0.3s ease;
}

.notification.success {
  border-left: 4px solid #10b981;
}

.notification.error {
  border-left: 4px solid #ef4444;
}

.notification.warning {
  border-left: 4px solid #f59e0b;
}

.notification.info {
  border-left: 4px solid #3b82f6;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
```

## Production Setup

### Step 1: Environment Configuration

Create `.env.production`:

```env
VITE_MFE_REGISTRY_URL=https://api.example.com/mfe-registry
VITE_ERROR_REPORTING_URL=https://api.example.com/errors
VITE_API_BASE_URL=https://api.example.com
```

### Step 2: Production Build

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

### Step 3: Static Deployment

Since this is a SPA, you can deploy to any static hosting service:

#### Netlify

```bash
# Build the app
npm run build

# Deploy with Netlify CLI
npx netlify deploy --prod --dir=dist
```

Create `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    Access-Control-Allow-Origin = "*"
```

#### Vercel

```bash
# Deploy with Vercel
npx vercel --prod
```

Create `vercel.json`:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        }
      ]
    }
  ]
}
```

#### GitHub Pages

```bash
# Build the app
npm run build

# Deploy to GitHub Pages
npx gh-pages -d dist
```

#### AWS S3 + CloudFront

```bash
# Build the app
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

#### Serve Locally for Testing

```bash
# Build and preview
npm run build
npm run preview

# Or use any static server
npx serve dist
```

## Next Steps

Now that you have a working container:

1. **Add Authentication**: Implement real auth service
2. **Add Routing**: Set up dynamic routing based on MFE registry
3. **Add State Management**: Implement shared state solution
4. **Add Monitoring**: Add performance and error tracking
5. **Add Testing**: Set up unit and integration tests

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure MFE server has CORS headers
   - Check container allows cross-origin requests

2. **MFE Not Loading**
   - Verify URL is accessible
   - Check browser console for errors
   - Ensure MFE exports correct format

3. **Services Not Available**
   - Ensure ServicesProvider wraps the app
   - Check services are created before MFE loads

4. **Registry Not Loading**
   - Verify registry file exists in public folder
   - Check network tab for 404 errors

## Summary

You now have a complete container application that can:
- ✅ Load MFEs dynamically
- ✅ Provide shared services
- ✅ Handle routing
- ✅ Manage UI state
- ✅ Handle errors gracefully
- ✅ Support development and production environments