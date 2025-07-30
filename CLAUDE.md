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
   - React 19 + React Context + Tailwind CSS + ShadCN UI
   - Provides shared services: auth, modal, notifications, event bus, logger
   - Dynamic MFE loading via ES modules (no Module Federation)
   - MFE registry system for configuration management
   - Uses React Context for state management (AuthContext, UIContext, RegistryContext)

2. **Microfrontends** (`apps/mfe-*/`)
   - `mfe-example`: Demonstrates all MFE services and capabilities
   - `mfe-react17`: Legacy MFE showing cross-version React compatibility
   - `mfe-event-demo`: Event bus communication demo
   - `mfe-state-demo-react`: Universal state management demo (React)
   - `mfe-state-demo-vue`: Universal state management demo (Vue)
   - `mfe-state-demo-vanilla`: Universal state management demo (Vanilla JS)

3. **Shared Packages** (`packages/`)
   - `mfe-dev-kit`: Core MFE toolkit with types, services, components, and error handling
   - `shared`: Common utilities and constants
   - `universal-state`: Cross-framework state management solution

### Key Services

Services are injected into MFEs at mount time (no global window pollution):

- **Logger Service**: Centralized logging with levels (debug, info, warn, error)
- **Event Bus**: Inter-MFE communication via pub/sub pattern
- **Modal Service**: Programmatic modal management
- **Notification Service**: Toast notifications system
- **Auth Service**: Authentication state management
- **Error Reporter**: Comprehensive error tracking and reporting

### MFE Loading Process

1. Container loads MFE registry from JSON configuration
2. MFEs are built and served from static file server (port 8080)
3. Container dynamically imports MFEs at runtime
4. Each MFE exports a default object with mount/unmount functions
5. Services are injected into MFEs during mount (no global dependencies)

### MFE Loading Components

- **MFELoader**: Standard loader with error boundaries and retry mechanisms
- **IsolatedMFELoader**: For pages with frequent re-renders (prevents flickering)
- Both include comprehensive error handling and recovery

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

The platform uses a dual state management approach:

1. **ContextBridge** (Container Services)
   - Provides UI services: auth, modals, notifications
   - Imperative API for MFEs to call container functionality
   - Services injected at MFE mount time

2. **Universal State Manager** (Application State)
   - Shared business/application state between MFEs
   - Cross-tab synchronization and persistence
   - Framework-agnostic (React, Vue, Vanilla JS)
   - Reactive subscriptions for state changes

See [State Management Architecture](./docs/architecture/STATE_MANAGEMENT_ARCHITECTURE.md) for detailed documentation.

### Architecture Decisions

- **Dynamic Imports over Module Federation**: Better independence, no build-time coupling
- **React Context over Redux**: Better isolation, simpler state management
- **Service Injection**: No global window pollution, better testability
- **Dual MFE Loaders**: Temporary solution for handling different re-render scenarios

### After Making Changes

Always run these commands to ensure code quality:

```bash
# Check for lint errors
pnpm lint

# Check for TypeScript errors
pnpm type-check

# Run tests
pnpm test

# Or run all validations at once
pnpm validate
```

If you don't know the correct commands for a project, ask the user and suggest updating this file.

## Commit Guidelines

- **Always test code before commit**
  - Run tests for changed files to ensure they work correctly
  - Use `pnpm test` to run all tests before pushing
  - Never commit untested code
- **Always format code before commit**
  - Use `pnpm format` to ensure consistent code formatting
  - Helps maintain code quality and reduces unnecessary diffs
- **Always run lint before commit**
  - Helps catch and prevent potential code quality issues before they are committed
- **Only lint and format changed code before commit**
  - Focus on optimizing the linting and formatting process for modified files
- **Do not commit untested code**

## Development Best Practices

- **Always create and use named types**
  - Enhances code readability and type safety
  - Makes the codebase more maintainable and self-documenting
- **Do not commit code containing unnamed types**

## Personal Preferences

- I prefer functional coding

## TypeScript Best Practices

- **Use 'type' over 'interface' where possible**

## Code Style Guidance

- **Never use enums**
- **Always use shortened imports**
