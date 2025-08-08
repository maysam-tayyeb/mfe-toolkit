# MFE Toolkit - Enterprise Microfrontend Development Platform

A comprehensive toolkit and reference architecture for building production-ready microfrontends. Features framework-agnostic core, framework-specific adapters, CLI tools, and cross-framework state management.

## ✨ Key Features

- 🚀 **Dynamic MFE Loading** - Load microfrontends on-demand with ES modules
- 📡 **Inter-MFE Communication** - Real-time event bus for MFE-to-MFE messaging ([see guide](./docs/guides/mfe-communication-guide.md))
- 🎯 **Shared Services** - Modal, notification, auth, and logging services ([see demos](./docs/service-demos.md))
- 📦 **Optimized Bundles** - 96% smaller with import maps (576KB → 14KB)
- 🔄 **Cross-Framework Support** - React, Vue, and Vanilla JS MFEs work together ([see demos](./docs/service-demos.md))
- 🛠️ **Modern Tooling** - Vite, TypeScript, pnpm workspaces, and ESBuild
- 🔧 **Universal State Manager** - Cross-framework state management (React, Vue, Vanilla JS) with proxy-based reactivity and middleware support
- 🎨 **Zero-Pollution Design System** - Framework-agnostic CSS-first design system with Modern Blue & Slate palette
- 📐 **Professional UI/UX** - Hero sections, metric cards, tabs, semantic colors, and responsive layouts
- 🚫 **No Global Pollution** - Clean architecture with service injection, no window/global variables
- 📱 **Mobile-Responsive** - Adaptive layouts that work across all device sizes

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Container Application                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Navigation | Dashboard | Modal Service | Event Bus   │  │
│  │  Error Handling Demo                                  │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Injected Services Layer                │    │
│  │  ┌──────────┐ ┌───────────┐ ┌─────────┐ ┌─────────┐ │    │
│  │  │  Logger  │ │ Event Bus │ │  Modal  │ │ Notify  │ │    │
│  │  └──────────┘ └───────────┘ └─────────┘ └─────────┘ │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │           Container State Management                │    │
│  │    AuthContext  |  UIContext  |  RegistryContext    │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │          MFE Loading Infrastructure                 │    │
│  │     MFELoader Components | Error Boundaries         │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              ↓
                  Dynamic Import (Runtime)
                              ↓
┌─────────────────────────────────────────────────────────────┐
│         Static File Server (Port 8080)                      │
│         Serves Built MFEs from dist/ directory              │
│  ┌──────────────┐ ┌──────────────┐ ┌─────────────────┐      │
│  │/modal-demos/ │ │/eventbus-demo│ │/state-demos/*  │      │
│  │react|vue|js  │ │.js .js.map   │ │react|vue|vanilla│      │
│  └──────────────┘ └──────────────┘ └─────────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Microfrontends (MFEs)                    │
│  ┌──────────────┐ ┌──────────────┐ ┌─────────────────┐      │
│  │Modal Demos   │ │EventBus Demo │ │State Demo MFEs  │      │
│  │- React 19    │ │- React 19    │ │- React          │      │
│  │- React 17    │ │- Event comm  │ │- Vue            │      │
│  │- Vue 3       │ │- Services    │ │- Vanilla JS     │      │
│  │- Vanilla JS  │ │              │ │                 │      │
│  └──────────────┘ └──────────────┘ └─────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### 📚 Architecture Documentation

- [Architecture Decisions](./docs/architecture/architecture-decisions.md) - Key design choices and rationale
- [State Management Architecture](./docs/architecture/state-management-architecture.md) - ContextBridge vs Universal State Manager
- [MFE Loading Guide](./docs/architecture/mfe-loading-guide.md) - How MFEs are loaded and best practices
- [Service Demonstrations](./docs/service-demos.md) - Interactive demos of all platform services
- [Comprehensive Roadmap](./docs/architecture/comprehensive-roadmap.md) - Complete development roadmap with completed work and future plans

## 📦 NPM Packages

The toolkit is available as modular npm packages under the `@mfe-toolkit` organization:

### Core Packages

| Package                                              | Description                           | Version |
| ---------------------------------------------------- | ------------------------------------- | ------- |
| [`@mfe-toolkit/core`](./packages/mfe-toolkit-core)   | Framework-agnostic core functionality | 0.1.0   |
| [`@mfe-toolkit/react`](./packages/mfe-toolkit-react) | React components and hooks            | 0.1.0   |
| [`@mfe-toolkit/cli`](./packages/mfe-toolkit-cli)     | CLI tools for MFE development         | 0.1.0   |
| [`@mfe-toolkit/state`](./packages/mfe-toolkit-state) | Cross-framework state management      | 0.1.0   |

### Middleware Packages

| Package                                                                                            | Description                                 | Version |
| -------------------------------------------------------------------------------------------------- | ------------------------------------------- | ------- |
| [`@mfe-toolkit/state-middleware-performance`](./packages/mfe-toolkit-state-middleware-performance) | Performance monitoring for state management | 0.1.0   |

### Internal Packages

| Package                                                      | Description                                       | Status   |
| ------------------------------------------------------------ | ------------------------------------------------- | -------- |
| [`@mfe/design-system`](./packages/design-system)             | CSS-first design system with 200+ utility classes | Internal |
| [`@mfe/design-system-react`](./packages/design-system-react) | React components for design system                | Internal |
| [`@mfe/shared`](./packages/shared)                           | Shared utilities and constants                    | Internal |

### Installation

```bash
# Core functionality (required)
npm install @mfe-toolkit/core

# React components (for React apps)
npm install @mfe-toolkit/react

# CLI tools (global installation)
npm install -g @mfe-toolkit/cli

# State management (optional)
npm install @mfe-toolkit/state

# Performance monitoring middleware (optional)
npm install @mfe-toolkit/state-middleware-performance
```

## 🚀 Quick Start

### State Management with Middleware

The toolkit includes a powerful state management solution with optional middleware:

```typescript
import { createStateManager } from '@mfe-toolkit/state';
import {
  createPerformanceMiddleware,
  initStatePerformanceMonitor,
} from '@mfe-toolkit/state-middleware-performance';

// Initialize performance monitoring
initStatePerformanceMonitor('my-app');

// Create state manager with middleware
const stateManager = createStateManager({
  devtools: true,
  persistent: true,
  crossTab: true,
  middleware: [createPerformanceMiddleware()],
});

// Use the state manager
stateManager.set('user', { name: 'John' });
const user = stateManager.get('user');

// Subscribe to changes
stateManager.subscribe('user', (value) => {
  console.log('User changed:', value);
});
```

### Prerequisites

- Node.js (LTS version specified in `.nvmrc`)
- pnpm >= 8 (Follow Quick Setup or see [pnpm.io](https://pnpm.io/installation))

#### Quick Setup

```bash
# Install nvm (if not already installed)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Use the Node version specified in .nvmrc
nvm install
nvm use

# Install pnpm globally
npm install -g pnpm
```

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd mfe-made-easy

# Install dependencies
pnpm install

# Build packages and MFEs (required first time)
pnpm build
```

## 🏃‍♂️ Running the Applications

### Development Mode

```bash
# Install dependencies (run after cloning)
pnpm install

# Build packages and MFEs (required before first run)
pnpm build

# Start the container application
pnpm dev:container-react  # React container app on http://localhost:3000
```

### Service Demonstration MFEs

The platform includes comprehensive service demonstrations across multiple frameworks:

#### Modal Service Demos

- **React 19**: Full modal capabilities with JSX support
- **React 17**: Legacy React with text-only content
- **Vue 3**: Cross-framework integration demo
- **Vanilla TS**: Lightweight implementation (5KB)

#### Event Bus Demo

- **React 19**: Interactive pub/sub demonstration with real-time event log

Access demos at:

- Modal Service: http://localhost:3000/services/modal
- Event Bus: http://localhost:3000/services/event-bus

See [Service Demonstrations](./docs/service-demos.md) for detailed documentation.

### Production Mode

```bash
# Build everything
pnpm build

# Serve the built MFEs
pnpm serve

# In another terminal, preview the container
cd apps/container-react && pnpm preview
```

### How MFEs Are Loaded

The platform uses **dynamic ES module imports** (no Module Federation) for MFE loading:

1. **Development Mode**: MFEs run on their own dev servers (ports 3001, 3002, etc.)
2. **Production Mode**:
   - Build MFEs as ES modules to `dist/` directory
   - Serve via static file server (port 8080)
   - Container loads MFEs dynamically from registry

```bash
# Development URLs:
http://localhost:3001/mfe-example.js      # Example MFE
http://localhost:3002/mfe-react17.js      # React 17 MFE

# Production URLs (after build):
http://localhost:8080/mfe-example/mfe-example.js
http://localhost:8080/mfe-react17/mfe-react17.js
http://localhost:8080/mfe-event-demo/mfe-event-demo.js
```

### MFE Registry Configuration

The container uses a **dynamic registry system** that loads configurations from JSON files:

```json
{
  "mfes": [
    {
      "name": "example",
      "url": "http://localhost:3001/mfe-example.js", // Dev mode
      "metadata": {
        "displayName": "Example MFE",
        "description": "Demonstrates all MFE services",
        "icon": "🎯"
      }
    }
  ]
}
```

**Registry Features:**

- 📁 Single registry file: `mfe-registry.json` (consolidated from multiple files)
- 🔧 Environment variable: `VITE_MFE_REGISTRY_URL`
- 🔄 Hot reload support in development
- 📦 Automatic fallback to hardcoded values if registry fails

> **Note**: For production deployments:
>
> - Update URLs to point to your CDN: `https://cdn.example.com/mfes/`
> - Use environment-specific registry files
> - Configure caching (5 min dev, 30 min prod)

## 🧪 Testing

### Running Tests

```bash
# Run tests for all packages
pnpm test:packages

# Run tests for container app
pnpm test:container

# Run tests for a specific package
pnpm --filter @mfe-toolkit/core test
pnpm --filter @mfe/container-react test

# Watch mode for specific package tests
pnpm --filter @mfe/container-react test:watch

# Coverage report for specific package
pnpm --filter @mfe/container-react test:coverage

# Run a single test file (from within package directory)
cd apps/container-react && pnpm vitest src/App.test.tsx
```

### Testing the MFE Integration

1. **Open the Container Application**: http://localhost:3000
2. **Navigate through the app**:
   - Home page shows the platform overview
   - Dashboard page tests container services
   - MFE Communication page for inter-MFE messaging
   - Universal State Demo for cross-MFE state management with performance monitoring
3. **Load the Example MFE**:
   - Click "Example MFE" in navigation, or
   - Go directly to http://localhost:3000/mfe/example
4. **Test MFE Services**:
   - Click buttons to test modal service
   - Try notifications system
   - Test event bus communication
   - Check authentication integration
   - View logger output in console

### 📡 Testing Inter-MFE Communication

For a comprehensive guide on testing real-time communication between MFEs, see the [MFE Communication Guide](./docs/mfe-communication-guide.md).

## 📁 Project Structure

```
mfe-made-easy/
├── apps/
│   ├── container-react/        # React container app (port 3000)
│   │   ├── src/
│   │   │   ├── components/     # Navigation, Layout, UI components
│   │   │   ├── pages/          # Home, Dashboard, Services pages
│   │   │   ├── contexts/       # React Context (Auth, UI, Registry)
│   │   │   └── services/       # MFE services implementation
│   │   └── package.json
│   └── service-demos/          # MFE demonstrations
│       ├── modal/              # Modal service demos
│       │   ├── mfe-react19-modal-demo/
│       │   ├── mfe-react17-modal-demo/
│       │   ├── mfe-vue3-modal-demo/
│       │   └── mfe-vanilla-modal-demo/
│       └── event-bus/          # Event bus demos
│           └── mfe-react19-eventbus-demo/
├── packages/
│   ├── mfe-toolkit-core/       # Framework-agnostic core
│   │   └── src/
│   │       ├── types/          # TypeScript definitions
│   │       ├── services/       # Logger, EventBus, Registry
│   │       └── utils/          # Common utilities
│   ├── mfe-toolkit-react/      # React-specific components
│   │   └── src/
│   │       └── components/     # MFELoader, MFEPage
│   ├── shared/                 # Internal utilities (private)
│   │   └── src/
│   │       ├── utils.ts        # Helper functions
│   │       └── constants.ts    # Shared constants
│   ├── design-system/          # CSS-first design system
│   │   └── src/
│   │       ├── styles/         # CSS with ds-* classes
│   │       └── tokens/         # Design tokens
│   ├── design-system-react/    # React design components
│   │   └── src/
│   │       └── components/     # Hero, MetricCard, TabGroup
│   ├── mfe-toolkit-state/      # Cross-framework state management
│   │   └── src/
│   │       ├── StateManager.ts # Core state management
│   │       └── adapters/       # Framework-specific adapters
│   └── mfe-toolkit-state-middleware-performance/ # Performance monitoring
│       └── src/
│           └── index.ts        # Performance middleware
├── pnpm-workspace.yaml         # Workspace configuration
└── package.json                # Root package with scripts
```

## 🛠️ Available Scripts

### Development

- `pnpm dev` - Start all apps in development mode
- `pnpm dev:container-react` - Start React container app

### Building & Serving

- `pnpm build` - Build all packages
- `pnpm -r build` - Build in dependency order
- `pnpm preview` - Preview production build (run from apps/container-react)

### Code Quality

- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix linting issues
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check formatting
- `pnpm type-check` - TypeScript checking
- `pnpm test:packages` - Run tests for all packages
- `pnpm test:container` - Run tests for container app

## 🔧 Development Workflow

### Building New MFEs

1. Create new app in `apps/` directory
2. Configure build for ES modules
3. Implement MFE module interface
4. Register in container's MFE registry
5. Build ES modules for deployment

### Key Configuration Files

- `pnpm-workspace.yaml` - Workspace setup
- `tsconfig.base.json` - Shared TypeScript config
- `vite.config.base.ts` - Shared Vite configuration
- `tailwind.config.base.js` - Shared Tailwind setup

## 🎯 Features Implemented

✅ **Monorepo Setup**: pnpm workspaces with shared configurations  
✅ **Container Applications**: Framework-agnostic architecture with React implementation  
✅ **MFE Dev Kit**: Complete service layer for MFE integration  
✅ **Dynamic Loading**: ES modules loaded at runtime (no Module Federation)  
✅ **Shared Services**: Auth, Modal, Notification, Event Bus, Logger  
✅ **Universal State Manager**: Cross-framework state synchronization with proxy-based reactivity  
✅ **Dual MFE Loaders**: Standard and Isolated loaders for different scenarios  
✅ **Zero-Pollution Design System**: CSS-first with 200+ utility classes  
✅ **Professional UI/UX**: Hero sections, metric cards, tabs, semantic colors  
✅ **Development Mode**: Hot reload for both container and MFEs  
✅ **TypeScript**: Full type safety across the monorepo  
✅ **Modern Tooling**: Vite, Tailwind CSS, ESLint, Vitest, Playwright

## 🚀 Quick Command Reference

### Essential Commands

```bash
# Install dependencies
pnpm install

# Install and build (first time setup)
pnpm install
pnpm -r build

# Start all apps (recommended)
pnpm dev

# Start individual apps
pnpm dev:container-react  # React container on :3000
pnpm dev:mfe          # Example MFE on :3001
pnpm dev:react17      # React 17 MFE on :3002

# Code quality checks
pnpm lint             # Run linter
pnpm format           # Format code
pnpm type-check       # Type checking
pnpm test:packages    # Run tests for packages
pnpm test:container   # Run tests for container
```

### Working with MFEs

```bash
# Build a specific MFE
cd apps/mfe-example
pnpm build

# Serve MFE statically (production-like)
pnpm serve:static

# Check bundle size after build
# Look for: "📏 Bundle size: XX KB"
```

## 🐛 Troubleshooting

### MFE Not Loading?

```bash
# 1. Make sure packages are built first
pnpm -r build

# 2. Start all services
pnpm dev  # Should start container + all MFEs

# 3. For production mode, build and serve
pnpm build
pnpm serve  # Terminal 1: Serves MFEs on :8080
cd apps/container-react && pnpm preview  # Terminal 2: React Container

# 4. Check browser console for errors
# Open DevTools > Console
```

### Build or Module Errors?

```bash
# 1. Rebuild all packages
pnpm -r build

# 2. Clean install (if needed)
rm -rf node_modules pnpm-lock.yaml
pnpm install

# 3. Check for TypeScript errors
pnpm type-check
```

### Services Not Available?

Services are injected into MFEs at mount time (no global window pollution). Check:

1. MFE is properly importing from `@mfe-toolkit/core` or `@mfe-toolkit/react`
2. Services are passed to MFE during mount
3. Error boundaries are catching and reporting errors
4. Check the Error Reporter service for detailed error tracking

### Port Already in Use?

```bash
# Kill process on specific port
lsof -ti:3000 | xargs kill -9  # Container
lsof -ti:3001 | xargs kill -9  # Service Explorer MFE
lsof -ti:3002 | xargs kill -9  # React 17 MFE
lsof -ti:8080 | xargs kill -9  # Static file server

# Or use different ports in vite.config.ts
```

### Development Tips

- **Hot Reload**: Changes auto-refresh (HMR enabled)
- **Browser DevTools**: Use React DevTools extension
- **Network Tab**: Monitor MFE loading in DevTools
- **Event Monitoring**: Use MFE Communication page at `/mfe-communication`

## 🔧 Configuration

### MFE Registry System

The MFE platform now uses a **dynamic registry system** that loads MFE configurations from JSON files, making it easy to manage MFE URLs across different environments.

#### Registry Files

The container application looks for registry files in the `public` directory:

- `mfe-registry.json` - Single source of truth for all MFE configurations (V2 Manifest format)

#### Registry JSON Structure

```json
{
  "mfes": [
    {
      "name": "example",
      "version": "1.0.0",
      "url": "http://localhost:3001/mfe-example.js",
      "dependencies": ["react", "react-dom"],
      "sharedLibs": ["@reduxjs/toolkit", "react-redux"],
      "metadata": {
        "displayName": "Example MFE",
        "description": "Demonstrates all MFE services",
        "icon": "🎯"
      }
    }
  ],
  "environment": "development",
  "version": "1.0.0",
  "lastUpdated": "2024-01-20T10:00:00Z"
}
```

#### Environment Variables

Configure the registry URL using environment variables:

```bash
# .env or .env.local
VITE_MFE_REGISTRY_URL=/mfe-registry.json

# For remote registry
VITE_MFE_REGISTRY_URL=https://api.example.com/mfe-registry

# For CDN-hosted registry
VITE_MFE_REGISTRY_URL=https://cdn.example.com/configs/mfe-registry.json
```

#### Loading Order

1. Tries to load from `VITE_MFE_REGISTRY_URL` if set
2. Falls back to `/mfe-registry.json` (default)
3. Uses hardcoded values in development if all fail

#### Registry Features

- ✅ **Remote Loading** - Load registry from any URL
- ✅ **Caching** - 5-minute cache in dev, 30-minute in production
- ✅ **Fallback Support** - Multiple fallback options
- ✅ **Environment-Specific** - Different configs per environment
- ✅ **Hot Reload** - Changes reflected on page refresh

## 📚 Documentation

### Documentation

- **[Architecture Documentation](./docs/architecture/)** - Technical architecture and analysis
- **[State Management Architecture](./docs/architecture/state-management-architecture.md)** - Dual state management approach (ContextBridge vs Universal State)
- **[MFE Loading Guide](./docs/architecture/mfe-loading-guide.md)** - How MFEs are loaded and best practices
- **[Architecture Decisions](./docs/architecture/architecture-decisions.md)** - Key design choices and rationale
- **[MFE Communication Guide](./docs/mfe-communication-guide.md)** - Inter-MFE messaging with event bus

### Quick Links

- **[All Documentation](./docs/)** - Browse all documentation
- **[Architecture Analysis](./docs/architecture/architecture-analysis-report.md)** - Comprehensive architecture review
- **[Comprehensive Roadmap](./docs/architecture/comprehensive-roadmap.md)** - Complete development roadmap
- **[MFE Toolkit Core](./packages/mfe-toolkit-core/README.md)** - Framework-agnostic core services and utilities
- **[MFE Toolkit React](./packages/mfe-toolkit-react/README.md)** - React-specific components and hooks
- **[Shared Utilities](./packages/shared/README.md)** - Common constants and helper functions

## 🚀 Next Steps

- ✅ Implement MFE Manifest V2 for better metadata and dependency management (see [Platform Manifest Docs](./docs/platform/manifests/))
- Add more cross-framework MFE examples
- Enhance Universal State Manager with more features
- Configure CI/CD pipeline with GitHub Actions
- Improve error boundaries and recovery mechanisms
- Add performance monitoring and optimization

See our [Comprehensive Roadmap](./docs/architecture/comprehensive-roadmap.md) for exciting upcoming features including:

- 🔍 DevTools middleware for time-travel debugging
- ✅ Validation middleware for runtime type safety
- 🔄 Sync middleware for backend integration
- 📊 Analytics middleware for usage insights
- 🚀 Framework adapters for Svelte, Angular, SolidJS
- And much more!

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and type checking
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.
