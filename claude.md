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

### Supported Frameworks

- **React 19**: Primary framework for container and many MFEs
- **Vue 3**: Full support with shared dependencies via import map
- **Vanilla JavaScript/TypeScript**: Zero-dependency MFEs
- **Solid.js**: Reactive framework with fine-grained reactivity for high-performance MFEs

### UI/UX Design Principles

- **Zero-Pollution Design System**: CSS-first approach with `ds-*` prefixed classes
- **500+ Utility Classes**: Comprehensive set including complete component systems:
  - Button system (primary, secondary, outline, ghost, danger, success, warning)
  - Modal system (backdrop, header, body, footer)
  - Form components (inputs, selects, checkboxes, switches, file uploads)
  - Navigation system (nav containers, dropdowns, breadcrumbs)
  - Toast notifications with animations
  - Alert and badge components
  - Layout utilities (flexbox, grid with responsive breakpoints)
  - Typography system with font weights, line heights, letter spacing
  - Complete spacing system (margin, padding, gap utilities)
  - Position and display utilities
  - Border, shadow, and visual effects
- **Modern Blue & Slate Palette**: Professional color scheme with semantic variants
- **Top Navigation Bar**: Dropdown menus with hover interactions
- **Centered Layouts**: Content centered with max-width for optimal readability
- **Responsive Design**: Mobile-first with `ds-sm:*`, `ds-md:*`, `ds-lg:*` breakpoints
- **Component Patterns**: Heroes, metrics, features, empty states, loading states, error boundaries
- **Visual Hierarchy**: Consistent typography scale and semantic spacing
- **Cross-Framework Ready**: Designed for React, Vue, and Vanilla JS container compatibility

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

### 🔴 CRITICAL DESIGN SYSTEM RULES - READ THIS FIRST!

**ABSOLUTELY NO UI CHANGES WITHOUT DESIGN SYSTEM UPDATE**

1. **ALL UI changes MUST go through the design system FIRST**
   - NEVER add inline styles
   - NEVER create ad-hoc CSS classes
   - NEVER modify styles directly in components
   - ALWAYS update the design system packages first

2. **Before ANY UI work:**
   - Check if `@mfe/design-system` has the utility you need
   - If not, ADD IT TO THE DESIGN SYSTEM FIRST
   - Build the design system: `pnpm --filter @mfe/design-system build`
   - Only then use the new classes in your component

3. **What NOT to do (FORBIDDEN):**

   ```tsx
   // ❌ NEVER DO THIS - Inline styles
   <div style={{ margin: '10px', padding: '20px' }}>

   // ❌ NEVER DO THIS - Custom CSS classes
   <div className="my-custom-class">

   // ❌ NEVER DO THIS - Tailwind classes not from design system
   <div className="bg-blue-500 p-4">

   // ✅ ALWAYS DO THIS - Use design system classes
   <div className="ds-card ds-p-4 ds-bg-accent-primary-soft">
   ```

4. **Design System Workflow (MANDATORY):**
   - Step 1: Identify UI requirement
   - Step 2: Check design system for existing utilities
   - Step 3: If missing, update `packages/design-system/src/styles/index.css`
   - Step 4: Build design system: `pnpm build:packages`
   - Step 5: Use the new `ds-*` classes in your component
   - Step 6: Test that styles work correctly
   - Step 7: Commit both design system and component changes together

**I understand that ANY change of layout and style MUST be done through the design system. Any new UI must first update the design system. This is non-negotiable.**

### When Creating New MFEs

1. Create new app in `apps/` directory following naming convention `mfe-{name}`
2. Export default function that accepts MFE services
3. **Important**: MFEs use esbuild for building (not Vite)
4. Add to container's MFE registry
5. Ensure proper TypeScript types from `@mfe-toolkit/core`
6. **Framework Options**: React, Vue, Vanilla JS, or Solid.js
   - All frameworks use shared dependencies via import map
   - Mark framework dependencies as external in build config

### Testing Approach

- Unit tests use Vitest with React Testing Library
- E2E tests use Playwright
- Test files follow `*.test.tsx` or `*.spec.tsx` pattern
- Setup files located in `src/__tests__/setup.ts`
- Coverage thresholds: 80% for all metrics

#### Test Commands

```bash
# Run all tests (packages + container)
pnpm test

# Run tests for packages only
pnpm test:packages

# Run tests for container only
pnpm test:container

# Run tests for specific package with watch
pnpm --filter @mfe-toolkit/core test:watch

# Run coverage for specific package
pnpm --filter @mfe/container-react test:coverage

# Run single test file
cd apps/container-react && pnpm vitest src/App.test.tsx

# Run all validations before commit
pnpm validate  # Runs format, lint, type-check, and test
```

### Important File Locations

- Container services: `apps/container-react/src/services/`
- React contexts: `apps/container-react/src/contexts/` (AuthContext, UIContext, RegistryContext)
- MFE types: `packages/mfe-toolkit-core/src/types/`
- UI components: `apps/container-react/src/components/ui/`
- Design system styles: `packages/design-system/src/styles/index.css` (500+ utility classes)
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

### Key CSS Classes (500+ available)

**Layout & Containers:**

- `ds-page`: Centered page container
- `ds-card`, `ds-card-padded`, `ds-card-compact`: Card variants
- `ds-hero`, `ds-hero-gradient`: Hero sections
- `ds-metric-card`: Metric display cards
- `ds-grid`, `ds-grid-cols-[1-6]`: Grid system
- `ds-flex`, `ds-flex-row`, `ds-flex-col`: Flexbox utilities

**Typography:**

- `ds-page-title`, `ds-section-title`, `ds-card-title`: Heading hierarchy
- `ds-text-xs`, `ds-text-sm`, `ds-text-lg`, `ds-text-xl`, `ds-text-2xl`, `ds-text-3xl`: Text sizes
- `ds-font-normal`, `ds-font-medium`, `ds-font-semibold`, `ds-font-bold`: Font weights
- `ds-leading-none`, `ds-leading-tight`, `ds-leading-normal`: Line heights
- `ds-text-left`, `ds-text-center`, `ds-text-right`: Text alignment
- `ds-truncate`, `ds-break-words`: Text overflow

**Components:**

- `ds-btn-primary`, `ds-btn-secondary`, `ds-btn-outline`, `ds-btn-ghost`: Button variants
- `ds-btn-danger`, `ds-btn-success`, `ds-btn-warning`: Semantic buttons
- `ds-btn-sm`, `ds-btn-lg`: Size modifiers
- `ds-badge`, `ds-badge-info`, `ds-badge-success`: Badge variants
- `ds-tabs`, `ds-tab-active`: Tab navigation
- `ds-input`, `ds-select`, `ds-textarea`, `ds-checkbox`, `ds-radio`: Form controls
- `ds-modal-*`: Complete modal system (backdrop, content, header, footer)
- `ds-toast-*`: Toast notifications with animations
- `ds-dropdown-*`: Dropdown menus
- `ds-alert-*`: Alert components

**Spacing:**

- `ds-m-[0-4]`, `ds-mt-*`, `ds-mb-*`, `ds-ml-*`, `ds-mr-*`: Margins
- `ds-p-[0-6]`, `ds-px-*`, `ds-py-*`, `ds-pt-*`, `ds-pb-*`: Padding
- `ds-space-x-[1-4]`, `ds-space-y-[1-6]`: Space between utilities
- `ds-gap-[1-8]`: Gap utilities for grid/flex

**Layout Utilities:**

- `ds-w-full`, `ds-w-auto`, `ds-w-[1-16]`, `ds-w-1/2`, `ds-w-1/3`: Width utilities
- `ds-h-full`, `ds-h-screen`, `ds-h-[1-16]`: Height utilities
- `ds-min-h-screen`, `ds-max-h-96`: Min/max height
- `ds-items-start`, `ds-items-center`, `ds-items-end`: Flex alignment
- `ds-justify-start`, `ds-justify-center`, `ds-justify-between`: Flex justification

**Position & Display:**

- `ds-relative`, `ds-absolute`, `ds-fixed`, `ds-sticky`: Position utilities
- `ds-top-0`, `ds-right-0`, `ds-bottom-0`, `ds-left-0`: Position values
- `ds-block`, `ds-inline-block`, `ds-inline`, `ds-hidden`: Display utilities
- `ds-z-[0-50]`: Z-index utilities

**Visual Effects:**

- `ds-border`, `ds-border-2`, `ds-border-t`, `ds-border-b`: Border utilities
- `ds-rounded`, `ds-rounded-md`, `ds-rounded-lg`, `ds-rounded-full`: Border radius
- `ds-shadow-sm`, `ds-shadow`, `ds-shadow-md`, `ds-shadow-lg`: Shadows
- `ds-opacity-[0-100]`: Opacity utilities
- `ds-transition-all`, `ds-transition-colors`: Transitions
- `ds-cursor-pointer`, `ds-cursor-not-allowed`: Cursor utilities

**Responsive Utilities:**

- `ds-sm:*`, `ds-md:*`, `ds-lg:*`: Responsive breakpoints for all utilities
- `ds-sm:grid-cols-2`, `ds-md:grid-cols-3`, `ds-lg:grid-cols-4`: Responsive grids

**Semantic Colors:**

- `ds-accent-primary`, `ds-accent-success`, `ds-accent-warning`, `ds-accent-danger`
- `ds-bg-accent-*-soft`: Soft background variants
- `ds-icon-*`: Icon color utilities
- `ds-text-muted`: Muted text color

**States & Effects:**

- `ds-loading-state`, `ds-empty-state`: State displays
- `ds-hover-scale`, `ds-hover-lift`: Hover effects
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

## 🚨 DESIGN SYSTEM IS LAW

### The Golden Rule

**ANY change of layout and style MUST be done through the design system. Any new UI MUST first update the design system. This is ABSOLUTE.**

### Why This Matters

1. **Consistency**: All MFEs share the same design language
2. **Maintainability**: Changes in one place affect all components
3. **No Pollution**: Zero global styles, zero inline styles
4. **Framework Agnostic**: Works across React, Vue, and Vanilla JS

### Common Violations to Avoid

```tsx
// ❌ VIOLATION: Adding styles directly
const MyComponent = () => <div style={{ marginTop: '20px' }}>Content</div>;

// ❌ VIOLATION: Using non-design-system classes
const MyComponent = () => <div className="mt-5 bg-blue-600">Content</div>;

// ❌ VIOLATION: Creating custom CSS
const styles = {
  container: { padding: '1rem' },
};

// ✅ CORRECT: Using design system
const MyComponent = () => <div className="ds-mt-4 ds-bg-accent-primary ds-p-4">Content</div>;
```

### If You Need a New Style

1. **STOP** - Do not add it to your component
2. **UPDATE** - Add it to `packages/design-system/src/styles/index.css`
3. **BUILD** - Run `pnpm build:packages`
4. **USE** - Now use the new `ds-*` class in your component
5. **COMMIT** - Include both design system and component changes

**Remember: The design system is not optional. It is the ONLY way to style UI components.**
