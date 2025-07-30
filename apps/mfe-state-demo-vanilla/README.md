# Vanilla TypeScript State Demo MFE

A vanilla TypeScript microfrontend demonstrating framework-agnostic state management using the universal state system.

## Features

- **Pure TypeScript**: No framework dependencies, just vanilla TypeScript
- **Type Safety**: Full TypeScript support with proper types
- **State Management**: Uses the universal state management system
- **Responsive UI**: Tailwind CSS styling with dark mode support
- **Event Handling**: Native DOM event handling with proper cleanup

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Type check
pnpm type-check
```

## TypeScript Features

- Strict type checking enabled
- Proper type imports from shared packages
- Type-safe DOM manipulation
- Interface definitions for better code organization

## Architecture

The MFE exports a simple interface with `mount` and `unmount` methods:

```typescript
interface VanillaMFE {
  mount: (element: HTMLElement, services: MFEServices) => void;
  unmount: (element: HTMLElement) => void;
}
```

This makes it easy to integrate with the container application while maintaining full type safety.
