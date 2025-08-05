# React Container Documentation

The React container is a production-ready implementation of the MFE container specification using React 19.

## Overview

The React container provides:
- Full implementation of all required services
- React Context-based state management
- Modern React patterns and hooks
- TypeScript support throughout
- Optimized build configuration

## Quick Start

```bash
# Start the React container in development mode
pnpm dev:container-react

# Build for production
pnpm build:container-react

# Preview production build
cd apps/container-react && pnpm preview
```

## Architecture

### [Architecture Decisions](./architecture/decisions.md)

React-specific architectural choices:
- React Context API for state management
- Component-based MFE loaders
- Error boundary strategies
- Performance optimizations

### [State Management](./architecture/state-management.md)

How state is managed in the React container:
- Context providers structure
- Hook-based state access
- Performance considerations
- Integration with Universal State Manager

## Features

### UI Components

Built with ShadCN UI components:
- Consistent design system
- Accessibility built-in
- Dark mode support
- Responsive layouts

### Routing

React Router v6 integration:
- Nested routes for MFEs
- Route guards for authentication
- Lazy loading support
- Navigation state management

### Services Implementation

All services are implemented as React Context providers:

```typescript
// Example: Using services in an MFE
function MyMFE({ services }) {
  const { logger, eventBus, notification } = services;
  
  React.useEffect(() => {
    logger.info('MFE mounted');
    
    const unsubscribe = eventBus.on('user:login', (user) => {
      notification.success(`Welcome ${user.name}!`);
    });
    
    return () => unsubscribe();
  }, []);
}
```

## Configuration

### Environment Variables

```bash
# MFE Registry URL
VITE_MFE_REGISTRY_URL=/mfe-registry.json

# API endpoints
VITE_API_URL=http://localhost:3001

# Feature flags
VITE_ENABLE_DEBUG=true
```

### Build Configuration

The React container uses Vite with optimized settings:
- Tree shaking enabled
- Code splitting for routes
- CSS extraction and minification
- Source map generation

## Development

### Project Structure

```
apps/container-react/
├── src/
│   ├── components/       # UI components
│   ├── contexts/        # React contexts
│   ├── hooks/           # Custom hooks
│   ├── pages/           # Route pages
│   ├── services/        # Service implementations
│   └── main.tsx         # Entry point
├── public/
│   └── mfe-registry.json # MFE configuration
└── package.json
```

### Testing

```bash
# Run unit tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Generate coverage report
pnpm test:coverage
```

## Roadmap

See [React Container Roadmap](./roadmap.md) for planned improvements and features.

## Migration Guide

If you're migrating from the legacy container, see [Migration Guide](./migration.md).