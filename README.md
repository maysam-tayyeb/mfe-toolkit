# MFE Made Easy - Microfrontend Monorepo

A complete microfrontend (MFE) architecture built with React 19, Redux Toolkit, and pnpm workspaces. This setup demonstrates dynamic MFE loading, shared services, and a development workflow for building scalable frontend applications.

## ✨ Key Features

- 🚀 **Dynamic MFE Loading** - Load microfrontends on-demand with ES modules
- 📡 **Inter-MFE Communication** - Real-time event bus for MFE-to-MFE messaging ([see guide](./docs/mfe-communication-guide.md))
- 🎯 **Shared Services** - Modal, notification, auth, and logging services
- 📦 **Optimized Bundles** - 96% smaller with import maps (576KB → 14KB)
- 🔄 **Cross-Version Support** - React 17 MFEs work seamlessly in React 19 container
- 🛠️ **Modern Tooling** - Vite, TypeScript, pnpm workspaces, and ESBuild
- 🔧 **Universal State Manager** - Cross-framework state management (React, Vue, Vanilla JS) with proxy-based reactivity

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                       Container App                         │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Navigation | Dashboard | MFE Communication Center    │  │
│  │  Universal State Demo | Error Boundary Demo           │  │
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
│  │            React Context (State Management)         │    │
│  │      AuthContext  |  UIContext  |  RegistryContext  │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │          MFE Loading Infrastructure                 │    │
│  │    MFELoader | IsolatedMFELoader | ErrorBoundary    │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              ↓
                  Dynamic Import (Runtime)
                              ↓
┌─────────────────────────────────────────────────────────────┐
│         Static File Server (Port 8080)                      │
│         Serves Built MFEs from dist/ directory              │
│  ┌──────────────┐ ┌──────────────┐ ┌─────────────────┐      │
│  │/mfe-example/ │ │/mfe-react17/ │ │/mfe-state-demo-*│      │
│  │.js .js.map   │ │.js .js.map   │ │react|vue|vanilla│      │
│  └──────────────┘ └──────────────┘ └─────────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Microfrontends (MFEs)                    │
│  ┌──────────────┐ ┌──────────────┐ ┌─────────────────┐      │
│  │Example MFE   │ │React17 MFE   │ │State Demo MFEs  │      │
│  │- Services    │ │- Legacy      │ │- React          │      │
│  │- Event Bus   │ │- Zustand     │ │- Vue            │      │
│  │- Modals      │ │- Services    │ │- Vanilla JS     │      │
│  └──────────────┘ └──────────────┘ └─────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### 📚 Architecture Documentation

- [Architecture Decisions](./docs/architecture/ARCHITECTURE_DECISIONS.md) - Key design choices and rationale
- [State Management Architecture](./docs/architecture/STATE_MANAGEMENT_ARCHITECTURE.md) - ContextBridge vs Valtio State Manager
- [MFE Loading Guide](./docs/architecture/MFE_LOADING_GUIDE.md) - How MFEs are loaded and best practices
- [Improvements Status](./docs/architecture/IMPROVEMENTS_STATUS.md) - Completed and planned improvements

## 🚀 Quick Start

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

# Build shared packages (required first time)
pnpm -r build
```

## 🏃‍♂️ Running the Applications

### Development Mode

```bash
# Install dependencies (run after cloning)
pnpm install

# Build all packages (required before first run)
pnpm -r build

# Start all applications in parallel (recommended)
pnpm dev
```

Or start individually:

```bash
# Start individual applications
pnpm dev:container      # Container app on http://localhost:3000
pnpm dev:mfe           # Example MFE on http://localhost:3001
pnpm dev:react17       # React 17 MFE on http://localhost:3002
pnpm dev:state-react   # State demo React MFE
pnpm dev:state-vue     # State demo Vue MFE
pnpm dev:state-demos   # All state demo MFEs in parallel
```

### Production Mode

```bash
# Build everything
pnpm build

# Serve the built MFEs
pnpm serve

# In another terminal, preview the container
cd apps/container && pnpm preview
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

- 📁 Multiple registry files: `mfe-registry.json`, `mfe-registry.{environment}.json`
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
# Run all tests
pnpm test

# Watch mode for tests
pnpm test:watch

# Coverage report
pnpm test:coverage

# Run a single test file
pnpm vitest src/App.test.tsx

# E2E tests with Playwright
pnpm e2e              # Headless mode
pnpm e2e:headed      # Headed mode
pnpm e2e:debug       # Debug mode
pnpm e2e:report      # View test report
```

### Testing the MFE Integration

1. **Open the Container App**: http://localhost:3000
2. **Navigate through the app**:
   - Home page shows the platform overview
   - Dashboard page tests container services
   - MFE Communication page for inter-MFE messaging
   - Universal State Demo for cross-MFE state management
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
│   ├── container/              # Container app (port 3000)
│   │   ├── src/
│   │   │   ├── components/     # Navigation, Layout, UI components
│   │   │   ├── pages/          # Home, Dashboard, MFE Communication
│   │   │   ├── store/          # Redux slices (auth, modal, notification)
│   │   │   └── services/       # MFE services implementation
│   │   └── package.json
│   ├── mfe-example/            # Example MFE - demonstrates all services
│   ├── mfe-react17/            # React 17 compatibility demo
│   ├── mfe-event-demo/         # Event bus communication demo
│   ├── mfe-state-demo-react/   # Universal state demo (React)
│   ├── mfe-state-demo-vue/     # Universal state demo (Vue)
│   └── mfe-state-demo-vanilla/ # Universal state demo (Vanilla JS)
├── packages/
│   ├── mfe-dev-kit/            # Core MFE toolkit
│   │   └── src/
│   │       ├── types/          # TypeScript definitions
│   │       ├── services/       # Logger, EventBus, Registry
│   │       └── components/     # MFELoader, MFEPage
│   ├── shared/                 # Common utilities
│   │   └── src/
│   │       ├── utils.ts        # Helper functions
│   │       └── constants.ts    # Shared constants
│   └── universal-state/        # Cross-framework state management
│       └── src/
│           ├── StateManager.ts # Core state management
│           └── adapters/       # Framework-specific adapters
├── pnpm-workspace.yaml         # Workspace configuration
└── package.json                # Root package with scripts
```

## 🛠️ Available Scripts

### Development

- `pnpm dev` - Start all apps in development mode
- `pnpm dev:container` - Start only container app
- `pnpm dev:mfe` - Start only example MFE
- `pnpm dev:react17` - Start only React 17 MFE
- `pnpm dev:state-react` - Start state demo React MFE
- `pnpm dev:state-vue` - Start state demo Vue MFE
- `pnpm dev:state-demos` - Start all state demo MFEs

### Building & Serving

- `pnpm build` - Build all packages
- `pnpm -r build` - Build in dependency order
- `pnpm preview` - Preview production build (run from apps/container)

### Code Quality

- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix linting issues
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check formatting
- `pnpm type-check` - TypeScript checking
- `pnpm test` - Run tests
- `pnpm test:watch` - Run tests in watch mode
- `pnpm test:coverage` - Generate coverage report
- `pnpm validate` - Run all checks (format, lint, type-check, test)

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
✅ **Container App**: React 19 + React Context + ShadCN UI  
✅ **MFE Dev Kit**: Complete service layer for MFE integration  
✅ **Dynamic Loading**: ES modules loaded at runtime (no Module Federation)  
✅ **Shared Services**: Auth, Modal, Notification, Event Bus, Logger  
✅ **Valtio State Manager**: Cross-framework state synchronization with proxy-based reactivity  
✅ **Dual MFE Loaders**: Standard and Isolated loaders for different scenarios  
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
pnpm dev:container    # Container on :3000
pnpm dev:mfe          # Example MFE on :3001
pnpm dev:react17      # React 17 MFE on :3002

# Code quality checks
pnpm lint             # Run linter
pnpm format           # Format code
pnpm type-check       # Type checking
pnpm test             # Run tests
pnpm validate         # Run all checks
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
cd apps/container && pnpm preview  # Terminal 2: Container

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

1. MFE is properly importing from `@mfe/dev-kit`
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

The container app looks for registry files in the `public` directory:

- `mfe-registry.json` - Default registry
- `mfe-registry.development.json` - Development environment
- `mfe-registry.production.json` - Production environment

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
2. Falls back to `/mfe-registry.json`
3. Falls back to `/mfe-registry.{environment}.json`
4. Uses hardcoded values in development if all fail

#### Registry Features

- ✅ **Remote Loading** - Load registry from any URL
- ✅ **Caching** - 5-minute cache in dev, 30-minute in production
- ✅ **Fallback Support** - Multiple fallback options
- ✅ **Environment-Specific** - Different configs per environment
- ✅ **Hot Reload** - Changes reflected on page refresh

## 📚 Documentation

### Documentation

- **[Architecture Documentation](./docs/architecture/)** - Technical architecture and analysis
- **[State Management Architecture](./docs/architecture/STATE_MANAGEMENT_ARCHITECTURE.md)** - Dual state management approach (ContextBridge vs Universal State)
- **[MFE Loading Guide](./docs/architecture/MFE_LOADING_GUIDE.md)** - How MFEs are loaded and best practices
- **[Architecture Decisions](./docs/architecture/ARCHITECTURE_DECISIONS.md)** - Key design choices and rationale
- **[MFE Communication Guide](./docs/mfe-communication-guide.md)** - Inter-MFE messaging with event bus

### Quick Links

- **[All Documentation](./docs/)** - Browse all documentation
- **[Architecture Analysis](./docs/architecture/architecture-analysis-report.md)** - Comprehensive architecture review
- **[Improvement Roadmap](./docs/architecture/improvement-roadmap.md)** - 7-phase enhancement plan
- **[MFE Development Kit](./packages/mfe-dev-kit/README.md)** - Core services and utilities for MFE development
- **[Shared Utilities](./packages/shared/README.md)** - Common constants and helper functions

## 🚀 Next Steps

- Implement MFE Manifest V2 for better metadata and dependency management
- Add more cross-framework MFE examples
- Enhance Valtio State Manager with more features
- Configure CI/CD pipeline with GitHub Actions
- Improve error boundaries and recovery mechanisms
- Add performance monitoring and optimization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and type checking
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.
