# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

### Development
```bash
# Install dependencies (run after cloning)
pnpm install

# Build all packages (required before first run)
pnpm -r build

# Start all applications in parallel (recommended)
pnpm dev

# Start individual applications
pnpm dev:container      # Container app on http://localhost:3000
pnpm dev:mfe           # Example MFE on http://localhost:3001  
pnpm dev:react17       # React 17 MFE on http://localhost:3002
pnpm dev:state-react   # State demo React MFE
pnpm dev:state-vue     # State demo Vue MFE
pnpm dev:state-demos   # All state demo MFEs in parallel
```

### Testing
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

### Code Quality
```bash
# Lint all files
pnpm lint

# Fix lint issues
pnpm lint:fix

# Format code
pnpm format

# Check formatting
pnpm format:check

# Type checking
pnpm type-check

# Run all validations (format, lint, type-check, test)
pnpm validate
```

### Building
```bash
# Build all packages
pnpm build

# Build in dependency order
pnpm -r build

# Preview production build
cd apps/container && pnpm preview
```

## Architecture Overview

This is a **microfrontend (MFE) monorepo** using pnpm workspaces. The architecture consists of:

### Core Components

1. **Container Application** (`apps/container/`)
   - Main shell application that hosts and orchestrates MFEs
   - React 19 + Redux Toolkit + Tailwind CSS + ShadCN UI
   - Provides shared services: auth, modal, notifications, event bus
   - Dynamic MFE loading via ES modules
   - MFE registry system for configuration management

2. **Microfrontends** (`apps/mfe-*/`)
   - `mfe-example`: Demonstrates all MFE services and capabilities
   - `mfe-react17`: Legacy MFE showing cross-version React compatibility
   - `mfe-event-demo`: Event bus communication demo
   - `mfe-state-demo-react`: Universal state management demo (React)
   - `mfe-state-demo-vue`: Universal state management demo (Vue)

3. **Shared Packages** (`packages/`)
   - `mfe-dev-kit`: Core MFE toolkit with types, services, and components
   - `shared`: Common utilities and constants
   - `universal-state`: Cross-framework state management solution

### Key Services

The container exposes these services to all MFEs via `window.__MFE_SERVICES__`:

- **Logger Service**: Centralized logging with levels (debug, info, warn, error)
- **Event Bus**: Inter-MFE communication via pub/sub pattern
- **Modal Service**: Programmatic modal management
- **Notification Service**: Toast notifications system
- **Auth Service**: Authentication state management
- **Redux Store**: Shared Redux store access

### MFE Loading Process

1. Container loads MFE registry from JSON configuration
2. MFEs are loaded dynamically as ES modules
3. Each MFE exports a default function that receives services
4. MFEs mount their React/Vue components with injected services

### Registry System

MFEs are configured via JSON registry files:
- `public/mfe-registry.json` - Default registry
- `public/mfe-registry.{environment}.json` - Environment-specific
- Configurable via `VITE_MFE_REGISTRY_URL` environment variable

## Development Guidelines

### When Creating New MFEs

1. Create new app in `apps/` directory following naming convention `mfe-{name}`
2. Export default function that accepts MFE services
3. Configure Vite to build ES module format
4. Add to container's MFE registry
5. Ensure proper TypeScript types from `@mfe/dev-kit`

### Testing Approach

- Unit tests use Vitest with React Testing Library
- E2E tests use Playwright
- Test files follow `*.test.tsx` or `*.spec.tsx` pattern
- Setup files located in `src/__tests__/setup.ts`
- Coverage thresholds: 80% for all metrics

### Important File Locations

- Container services: `apps/container/src/services/`
- Redux slices: `apps/container/src/store/`
- MFE types: `packages/mfe-dev-kit/src/types/`
- Shared components: `apps/container/src/components/ui/`
- MFE registry: `apps/container/public/mfe-registry.json`

### State Management

- Container uses Redux Toolkit with slices for auth, modal, and notifications
- MFEs can access the Redux store via services
- Universal state package provides cross-framework state sharing
- Event bus enables decoupled communication between MFEs