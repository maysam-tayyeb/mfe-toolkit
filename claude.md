# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

### Development

```bash
# Install dependencies (run after cloning)
pnpm install

# Build packages and MFEs (required before first run)
pnpm build

# Start container application
pnpm dev:container-react  # React container app on http://localhost:3000

# Serve MFEs (in another terminal)
pnpm serve  # Serves from dist/ on http://localhost:8080
```

### Testing

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
# Build packages and MFEs
pnpm build

# Preview production build
cd apps/container-react && pnpm preview
```

## Architecture Overview

This is a **microfrontend (MFE) monorepo** using pnpm workspaces. The architecture consists of:

### UI/UX Design Principles

- **Zero-Pollution Design System**: CSS-first approach with `ds-*` prefixed classes
- **400+ Utility Classes**: Comprehensive set including complete component systems:
  - Button system (primary, secondary, outline, ghost, danger, success, warning)
  - Modal system (backdrop, header, body, footer)
  - Form components (inputs, selects, checkboxes, switches, file uploads)
  - Navigation system (nav containers, dropdowns, breadcrumbs)
  - Toast notifications with animations
  - Interactive components (accordions, tooltips, pagination, sliders)
  - Layout utilities (flexbox, grid with responsive breakpoints)
  - Typography system with font weights, line heights, letter spacing
- **Modern Blue & Slate Palette**: Professional color scheme with semantic variants
- **Top Navigation Bar**: Dropdown menus with hover interactions
- **Centered Layouts**: Content centered with max-width for optimal readability
- **Responsive Design**: Mobile-first with `ds-sm:*`, `ds-md:*`, `ds-lg:*` breakpoints
- **Component Patterns**: Heroes, metrics, features, empty states, loading states
- **Visual Hierarchy**: Consistent typography scale and semantic spacing
- **Cross-Framework Ready**: Designed for React and Vue container compatibility

### Core Components

1. **Container Application** (`apps/container-react/`)
   - Main shell application that hosts and orchestrates MFEs
   - React 19 + React Context + Tailwind CSS + ShadCN UI
   - Provides shared services: auth, modal, notifications, event bus, logger
   - Dynamic MFE loading via ES modules (no Module Federation)
   - MFE registry system for configuration management
   - Uses React Context for state management (AuthContext, UIContext, RegistryContext)

2. **Microfrontends** (`apps/service-demos/`)
   - `mfe-react19-eventbus-demo`: React 19 Event bus communication demo
   - `mfe-react19-modal-demo`: React 19 Modal service demo
   - `mfe-react17-modal-demo`: React 17 Modal service demo (cross-version compatibility)
   - `mfe-vue3-modal-demo`: Vue 3 Modal service demo
   - `mfe-vanilla-modal-demo`: Vanilla JS Modal service demo

3. **Shared Packages** (`packages/`)
   - `@mfe-toolkit/core`: Framework-agnostic toolkit with types, services, and utilities
   - `@mfe-toolkit/react`: React-specific components and hooks (MFELoader, MFEErrorBoundary)
   - `@mfe-toolkit/cli`: Command-line tools for creating and managing MFEs
   - `@mfe-toolkit/state`: Cross-framework state management solution
   - `@mfe-toolkit/state-middleware-performance`: Performance monitoring middleware for state management
   - `@mfe/shared`: Internal shared utilities for demo apps (private, not published)
   - `@mfe/design-system`: Framework-agnostic CSS-first design system (private, not published)
   - `@mfe/design-system-react`: React 19 component wrappers for design system (private, not published)

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

## Package Structure

### Published NPM Packages

The toolkit is split into several npm packages under the `@mfe-toolkit` organization:

1. **@mfe-toolkit/core** (`packages/mfe-toolkit-core/`)
   - Framework-agnostic core functionality
   - Event bus, logger, error reporter, service container
   - MFE types and interfaces
   - Manifest validation and migration
   - Common utility functions (generateId, delay, debounce, throttle)

2. **@mfe-toolkit/react** (`packages/mfe-toolkit-react/`)
   - React-specific components: MFELoader, MFEErrorBoundary, MFEPage
   - React Context-based dependency injection
   - Zustand-based state management helpers

3. **@mfe-toolkit/cli** (`packages/mfe-toolkit-cli/`)
   - CLI tools for scaffolding new MFEs
   - Support for React, Vue, Vanilla JS/TS templates
   - Manifest generation and validation commands

4. **@mfe-toolkit/state** (`packages/mfe-toolkit-state/`)
   - Framework-agnostic state management
   - Cross-tab synchronization
   - Persistence support

5. **@mfe-toolkit/state-middleware-performance** (`packages/mfe-toolkit-state-middleware-performance/`)
   - Performance monitoring middleware for state management
   - Tracks state update metrics, memory usage, and render counts
   - Identifies slow updates and large objects in state
   - Provides performance summaries and analytics

### Internal Packages

- **@mfe/shared** (`packages/shared/`)
  - Internal utilities for demo apps
  - App-specific constants and configurations
  - Not published to npm (marked as private)

- **@mfe/design-system** (`packages/design-system/`)
  - Framework-agnostic CSS-first design system
  - Provides ds-\* prefixed CSS classes and design tokens
  - No React dependencies, pure CSS + ES modules
  - Not published to npm (marked as private)

- **@mfe/design-system-react** (`packages/design-system-react/`)
  - React 19 components wrapping design system
  - Components: Hero, MetricCard, TabGroup, EmptyState, LoadingState, EventLog
  - Uses container-provided CSS classes (no bundled styles)
  - Not published to npm (marked as private)

## Development Guidelines

### When Creating New MFEs

1. Create new app in `apps/` directory following naming convention `mfe-{name}`
2. Export default function that accepts MFE services
3. **Important**: MFEs use esbuild for building (not Vite)
4. Add to container's MFE registry
5. Ensure proper TypeScript types from `@mfe-toolkit/core`

### Testing Approach

- Unit tests use Vitest with React Testing Library
- E2E tests use Playwright
- Test files follow `*.test.tsx` or `*.spec.tsx` pattern
- Setup files located in `src/__tests__/setup.ts`
- Coverage thresholds: 80% for all metrics

### Important File Locations

- Container services: `apps/container-react/src/services/`
- React contexts: `apps/container-react/src/contexts/` (AuthContext, UIContext, RegistryContext)
- MFE types: `packages/mfe-toolkit-core/src/types/`
- UI components: `apps/container-react/src/components/ui/`
- Design system styles: `packages/design-system/src/styles/index.css` (400+ utility classes)
- Design system tokens: `packages/design-system/src/tokens/index.ts`
- React design components: `packages/design-system-react/src/components/`
- MFE registry: `apps/container-react/public/mfe-registry.json`
- Navigation: `apps/container-react/src/components/Navigation.tsx` (dropdown navigation)
- Layout: `apps/container-react/src/components/Layout.tsx` (responsive container)
- HomePage: `apps/container-react/src/pages/HomePage.tsx` (hero, metrics, features)
- DashboardPage: `apps/container-react/src/pages/DashboardPage.tsx` (platform overview)
- Modal Service Demo: `apps/container-react/src/pages/services/ModalServiceDemoPage.tsx`
- Event Bus Demo: `apps/container-react/src/pages/services/EventBusServiceDemoPage.tsx`
- Error Handling Demo: `apps/container-react/src/pages/ErrorBoundaryDemoPage.tsx`

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
   - Extensible with middleware (performance monitoring, logging, etc.)

**State Middleware Usage:**

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
  middleware: [createPerformanceMiddleware()],
});
```

See [State Management Architecture](./docs/architecture/state-management-architecture.md) for detailed documentation.

### Architecture Decisions

- **Dynamic Imports over Module Federation**: Better independence, no build-time coupling
- **React Context over Redux**: Better isolation, simpler state management
- **Service Injection**: No global window pollution, better testability
- **Dual MFE Loaders**: Temporary solution for handling different re-render scenarios

## Design System

### Architecture

- **Zero-Pollution Approach**: CSS-first design system with NO global/window variables
- **CSS Classes**: All styles use `ds-*` prefix (ds-page, ds-card, ds-button, ds-section-title)
- **Optional ES Modules**: Tokens available via explicit imports, not required for basic usage
- **Framework-Agnostic**: Works with React, Vue, and Vanilla JS through CSS classes
- **Modern Blue & Slate Palette**: Professional color scheme with vibrant accents

### Key CSS Classes (400+ available)

**Layout & Containers:**

- `ds-page`: Centered page container
- `ds-card`, `ds-card-padded`, `ds-card-compact`: Card variants
- `ds-hero`: Gradient hero section
- `ds-metric-card`: Metric display cards

**Typography:**

- `ds-page-title`, `ds-section-title`, `ds-card-title`: Heading hierarchy
- `ds-text-muted`, `ds-text-small`, `ds-label`: Text variants
- `ds-font-*`: Font weights (thin to extrabold)
- `ds-leading-*`: Line heights
- `ds-tracking-*`: Letter spacing

**Components:**

- `ds-btn-primary`, `ds-btn-secondary`, `ds-btn-outline`, `ds-btn-ghost`: Modern button system
- `ds-btn-danger`, `ds-btn-success`, `ds-btn-warning`: Semantic button variants
- `ds-btn-sm`, `ds-btn-lg`, `ds-btn-icon`: Size modifiers
- `ds-badge`, `ds-badge-info`, `ds-badge-success`: Badge variants
- `ds-tabs`, `ds-tab-active`: Tab navigation
- `ds-input`, `ds-select`, `ds-textarea`, `ds-checkbox`, `ds-radio`: Form controls
- `ds-switch`, `ds-switch-on`: Toggle switches
- `ds-modal-*`: Complete modal system
- `ds-toast-*`: Toast notifications
- `ds-dropdown-*`: Dropdown menus

**Semantic Colors:**

- `ds-accent-primary`, `ds-accent-success`, `ds-accent-warning`, `ds-accent-danger`
- `ds-bg-accent-*-soft`: Soft background variants
- `ds-icon-*`: Icon color utilities

**States & Effects:**

- `ds-loading-state`, `ds-empty-state`: State displays
- `ds-hover-scale`, `ds-hover-bg`: Hover effects
- `ds-spinner`, `ds-spinner-lg`: Loading spinners
- `ds-animate-in`, `ds-fade-in`, `ds-scale-in`: Animations
- `ds-transition`: Smooth transitions

### Usage in MFEs

```html
<!-- Direct CSS class usage (recommended) -->
<div class="ds-page">
  <h1 class="ds-page-title">Page Title</h1>
  <div class="ds-card-padded ds-card-elevated">
    <h2 class="ds-section-title">Section</h2>
    <button class="ds-btn-primary">Primary Action</button>
    <button class="ds-btn-outline">Secondary</button>
  </div>
</div>

<!-- Modal Example -->
<div class="ds-modal-backdrop">
  <div class="ds-modal">
    <div class="ds-modal-header">
      <h2 class="ds-modal-title">Modal Title</h2>
    </div>
    <div class="ds-modal-body">Content</div>
    <div class="ds-modal-footer">
      <button class="ds-btn-secondary">Cancel</button>
      <button class="ds-btn-primary">Confirm</button>
    </div>
  </div>
</div>
```

### Development Guidelines

1. Use CSS classes directly - no component imports needed
2. Classes are provided by container's stylesheet
3. No global pollution or window variables
4. Framework-agnostic approach for maximum compatibility

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
  - Use `pnpm test:packages` or `pnpm test:container` to run relevant tests before pushing
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

## State Management Principles

- **Strictly no global polluting. Only use state management**
- **No window or global object pollution - ever**
- **Design system provided via service injection, not global/window**

## JavaScript Best Practices

- **Do not use deprecated functions like String.prototype.substr()**

## Mental Model

- **Think, analyse, plan, then execute**
- **At no circumstances do hacky work. Always plan and think well, document your tasks and execute.**

## Build Process Notes

- **MFEs only use esbuild to build. Important!!!**

## Updates to Design Changes

- **Ensure applying fundamental design changes only through updating the design system**
