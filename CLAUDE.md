# MFE Monorepo Setup Instructions for Claude Code

## 🔄 IMPORTANT: Development Workflow

When working on any task in this codebase, ALWAYS follow this workflow:

1. **📊 ANALYZE** - First understand the current state
   - Read relevant files
   - Search for related code
   - Understand dependencies and impacts

2. **📝 PLAN** - Present a clear plan before making changes
   - List specific files to be modified
   - Describe the changes to be made
   - Identify potential impacts

3. **⚡ ACTION** - Execute the planned changes
   - Make the modifications
   - Test if applicable
   - Verify the changes work

4. **✅ QUALITY CHECK** - Before review, always run:
   - `pnpm format` - Format code with Prettier
   - `pnpm lint` - Check code with ESLint
   - `pnpm test` - Run tests if applicable
   - `pnpm type-check` - Verify TypeScript types

5. **⏸️ WAIT FOR REVIEW** - DO NOT commit or push
   - Present the completed changes
   - Show results of quality checks
   - Wait for user review and approval
   - Only commit/push when explicitly asked

## Project Overview
This is a monorepo using pnpm workspaces for a microfrontend (MFE) architecture with a container app that dynamically loads MFEs. The container app shares React 19, Redux Toolkit, TailwindCSS, and ShadCN components with MFEs to reduce bundle sizes.

## ✅ Implementation Status
The monorepo has been successfully created with all requested features implemented and working.

## Technology Stack
- **Package Manager**: pnpm with workspaces
- **Build Tool**: Vite
- **Testing**: Vitest
- **Code Formatting**: Prettier
- **Linting**: ESLint with TypeScript support
- **Frontend**: React 19, TypeScript
- **Styling**: TailwindCSS, ShadCN UI components
- **State Management**: Redux Toolkit with React-Redux
- **Routing**: React Router DOM
- **Module Federation**: Custom MFE loading system

## Quick Start Guide

### Prerequisites
- Node.js >= 18
- pnpm >= 8 (will be installed automatically if not present)

### Installation & Development
```bash
# Install dependencies
pnpm install

# Build all packages (required first time)
pnpm -r build

# Start all apps in parallel (development mode)
pnpm dev

# Or start individual apps (development mode)
pnpm dev:container   # Container app on http://localhost:3000
pnpm dev:mfe        # Example MFE on http://localhost:3001 (Vite dev server)
```

### Testing the MFE Integration
1. Start both apps with `pnpm dev`
2. Navigate to http://localhost:3000
3. Click on "Example MFE" in the navigation or go to http://localhost:3000/mfe/example
4. The example MFE will be dynamically loaded and you can test all the services

### Production Deployment
**Important**: In production, MFEs should be:
1. Built using `pnpm build` to create UMD bundles
2. Served from a separate web server (e.g., nginx, Apache, CDN)
3. NOT served via Vite dev server

The Vite dev server (port 3001) is only for development. In production, update the MFE registry URLs to point to your web server.

## Project Structure

### Root Level ✅
- ✅ pnpm workspace configuration (`pnpm-workspace.yaml`)
- ✅ Shared Vite, TailwindCSS, and TypeScript configs
- ✅ Monorepo package.json with scripts for parallel development
- ✅ Global dependencies and build tools

### Apps Directory ✅

#### Container App (`apps/container/`) ✅
- **Purpose**: Main shell application with navigation and MFE loading
- **Port**: 3000
- **Features**:
  - ✅ Top navigation bar with logo on left and nav items on right
  - ✅ React Router setup for routing between pages and MFEs
  - ✅ Redux store configuration with auth, modal, and notification slices
  - ✅ Layout component with navigation, modal, and notification systems
  - ✅ MFE loading page that uses the dev kit to render MFEs
  - ✅ ShadCN UI components (Button, Dialog, Toast)
  - ✅ Global exposure of React, ReactDOM, and Redux store

#### Example MFE (`apps/mfe-example/`) ✅
- **Purpose**: Demonstration microfrontend
- **Port**: 3001 (development only via Vite)
- **Features**:
  - ✅ Builds as UMD module for dynamic loading
  - ✅ Uses shared React and Redux from container
  - ✅ Demonstrates service usage (modal, notifications, event bus)
  - ✅ Shows auth session integration
  - ✅ Interactive testing interface for all services
  - ✅ Development mode with mock services via Vite dev server
  - ✅ Production build creates static UMD bundle for web server deployment

### Packages Directory ✅

#### MFE Development Kit (`packages/mfe-dev-kit/`) ✅
**Services provided**:
- ✅ **Logger**: Console logging with different levels and prefixes
- ✅ **Auth Service**: Provides current user session and authentication state
- ✅ **Event Bus**: Publish/subscribe system for inter-MFE communication
- ✅ **Modal Service**: Function to trigger modals in container app
- ✅ **Notification Service**: Function to show notifications in container app

**Components provided**:
- ✅ **MFELoader**: React component that dynamically loads MFE scripts
- ✅ **MFERegistry**: Service to manage MFE manifests and loading
- ✅ **MFEPage**: Route component that loads MFEs based on URL parameters

**Types defined**:
- ✅ MFE manifest structure (name, version, URL, dependencies, shared libs)
- ✅ MFE registry format
- ✅ Auth session interface
- ✅ Event payload structure
- ✅ Modal and notification configuration interfaces
- ✅ Complete TypeScript definitions for all services

#### Shared Package (`packages/shared/`) ✅
- ✅ Common utilities and components used across apps
- ✅ TypeScript utility types
- ✅ Shared constants and configurations
- ✅ Helper functions (cn, delay, generateId)

## Key Configuration Status ✅

### Dependency Sharing ✅
- ✅ Container app exposes React, ReactDOM, Redux store globally
- ✅ MFEs configured to use external dependencies instead of bundling them
- ✅ Peer dependencies properly configured to avoid version conflicts

### Build Configuration ✅
- ✅ Container builds as standard SPA
- ✅ MFEs build as UMD modules with external dependencies
- ✅ Proper externalization of shared libraries in Vite configs

### Development Workflow ✅
- ✅ Parallel development scripts to run all apps simultaneously
- ✅ Individual development scripts for focused development
- ✅ Hot reload support for both container and MFEs

### TypeScript Configuration ✅
- ✅ Shared base TypeScript config (`tsconfig.base.json`)
- ✅ Path mapping for workspace packages
- ✅ Proper module resolution for monorepo structure

## Implementation Details ✅

### Navigation Structure ✅
Container app navigation includes:
- ✅ Home page (standard React component)
- ✅ Dashboard page (standard React component)  
- ✅ MFE routes (dynamic loading via `/mfe/:mfeName` pattern)

### MFE Loading Mechanism ✅
1. ✅ MFE registry contains manifest information for each MFE
2. ✅ Container dynamically creates script tags to load MFE bundles
3. ✅ MFEs expose themselves on global window object with predictable naming
4. ✅ Container provides services object on window for MFE consumption
5. ✅ Error handling for failed MFE loads with user-friendly fallbacks

### Service Integration ✅
- ✅ All MFEs receive the same services object containing logger, auth, event bus, modal trigger, and notification trigger
- ✅ Services are injected via global window object when MFE loads
- ✅ Redux store shared and accessible via window.__REDUX_STORE__

### Event Communication ✅
- ✅ Event bus allows MFEs to communicate with each other and container
- ✅ Events include type, payload data, timestamp, and source identification
- ✅ Container can listen to MFE events and vice versa

### Modal and Notification System ✅
- ✅ Container owns modal and notification rendering
- ✅ MFEs trigger modals/notifications via service functions
- ✅ Support for different modal sizes and notification types

## Development Scripts ✅
- ✅ `pnpm dev` - Start all apps in parallel
- ✅ `pnpm dev:container` - Start only container app
- ✅ `pnpm dev:mfe` - Start only example MFE
- ✅ `pnpm build` - Build all packages
- ✅ `pnpm type-check` - TypeScript checking
- ✅ `pnpm format` - Format code with Prettier
- ✅ `pnpm lint` - Run ESLint on all packages
- ✅ `pnpm test` - Run tests with Vitest
- ✅ `pnpm format:check` - Check formatting without fixing
- ✅ `pnpm lint:fix` - Auto-fix ESLint issues

## ShadCN Integration ✅
- ✅ Initialize ShadCN in container app
- ✅ Add button, dialog, and toast components
- ✅ Configure proper Tailwind content paths for monorepo
- ✅ Ensure ShadCN components are shared but not bundled in MFEs

## Working Demonstration ✅
The implementation provides a complete working demonstration where:
1. ✅ Container app runs on port 3000 with navigation
2. ✅ Example MFE runs on port 3001 (dev mode only) and builds as UMD
3. ✅ Navigation in container can route to MFE and load it dynamically
4. ✅ MFE can use container services (modal, notifications, event bus)
5. ✅ Shared dependencies work correctly without duplication
6. ✅ Development workflow allows simultaneous development of container and MFEs

## Production Deployment Architecture
In production:
- Container app is deployed as a standard SPA
- MFEs are built as static UMD bundles and deployed to web servers/CDNs
- MFE registry URLs point to production web server locations (not Vite ports)
- No Vite dev servers are used in production

## Current File Structure
```
mfe-made-easy/
├── pnpm-workspace.yaml
├── package.json
├── tsconfig.base.json
├── vite.config.base.ts
├── tailwind.config.base.js
├── apps/
│   ├── container/              # Main container app (port 3000)
│   │   ├── src/
│   │   │   ├── components/     # Navigation, Layout, Modals, UI
│   │   │   ├── pages/          # Home, Dashboard
│   │   │   ├── store/          # Redux slices (auth, modal, notification)
│   │   │   ├── services/       # MFE services implementation
│   │   │   └── App.tsx
│   │   └── package.json
│   └── mfe-example/            # Example MFE (port 3001)
│       ├── src/
│       │   ├── App.tsx         # Interactive demo of all services
│       │   └── main.tsx        # UMD export and dev mode
│       └── package.json
├── packages/
│   ├── mfe-dev-kit/            # Core MFE development toolkit
│   │   ├── src/
│   │   │   ├── types/          # TypeScript definitions
│   │   │   ├── services/       # Logger, EventBus, Registry
│   │   │   └── components/     # MFELoader, MFEPage
│   │   └── package.json
│   └── shared/                 # Common utilities
│       ├── src/
│       │   ├── utils.ts
│       │   └── constants.ts
│       └── package.json
└── README.md (generated)
```