# apps/container-react/CLAUDE.md

This file provides guidance for working with the React container application.

## Container Architecture

- React 19 with React Context for state management
- Tailwind CSS + ShadCN UI for container UI
- Vite for development and production builds
- Provides services to all loaded MFEs

## Important File Locations

### Services
- `src/services/` - Service implementations
  - `ConsoleLoggerService.ts` - Logger implementation
  - `SimpleEventBusService.ts` - Event bus implementation
  - `ConsoleErrorReporterService.ts` - Error reporter
  - `ModalService.ts` - Modal management
  - `NotificationService.ts` - Toast notifications

### Contexts
- `src/contexts/`
  - `AuthContext.tsx` - Authentication state
  - `UIContext.tsx` - UI services (modal, notifications)
  - `RegistryContext.tsx` - MFE registry management

### Components
- `src/components/`
  - `Navigation.tsx` - Top navigation with dropdowns
  - `Layout.tsx` - Page layout wrapper
  - `ui/` - ShadCN UI components
  - `MFELoader.tsx` - MFE loading component

### Pages
- `src/pages/`
  - `HomePage.tsx` - Landing page with hero
  - `DashboardPage.tsx` - Platform overview
  - `services/` - Service demo pages
    - `EventBusPageV3.tsx` - Event bus demo
    - `NotificationsPage.tsx` - Notifications demo
  - `dev/` - Developer tools
    - `MetricsPage.tsx` - Performance metrics
    - `SettingsPage.tsx` - App settings
  - `MFERegistryPage.tsx` - Registry viewer

### Configuration
- `public/mfe-registry.json` - MFE registry
- `index.html` - Import maps for shared dependencies
- `vite.config.ts` - Vite configuration

## State Management

### React Context Usage
```tsx
// Auth context
const { user, login, logout } = useAuth();

// UI context
const { showModal, showNotification } = useUI();

// Registry context
const { registry, loadRegistry } = useRegistry();
```

### Service Container
Services are provided to MFEs via ServiceContainer:
```typescript
const container = new ServiceContainer();
container.register('logger', logger);
container.register('eventBus', eventBus);
container.register('modal', modalService);
```

## MFE Loading

### Loading Process
1. Fetch registry from `public/mfe-registry.json`
2. Dynamic import: `import(/* @vite-ignore */ url)`
3. Mount with service container injection
4. Handle unmount for cleanup

### Registry Format
```json
{
  "mfes": {
    "mfe-name": {
      "url": "http://localhost:8080/mfe-name.js",
      "manifest": {
        "name": "mfe-name",
        "version": "1.0.0",
        "dependencies": {}
      }
    }
  }
}
```

## Import Maps

Shared dependencies configured in `index.html`:
```html
<script type="importmap">
{
  "imports": {
    "react": "...",
    "react-dom": "...",
    "vue": "...",
    "solid-js": "..."
  }
}
</script>
```

## Development

```bash
# Start dev server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage
```

## Testing

- Uses Vitest + React Testing Library
- Setup file: `src/__tests__/setup.ts`
- Test utilities: `src/__tests__/test-utils.tsx`

## Environment Variables

- `VITE_MFE_REGISTRY_URL` - Custom registry URL
- `VITE_API_URL` - Backend API URL

## Best Practices

- Keep service implementations simple and testable
- Use React Context for container-level state
- Lazy load pages with React.lazy()
- Handle MFE loading errors gracefully
- Provide fallback UI for loading states