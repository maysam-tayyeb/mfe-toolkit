# Container Implementations

This directory contains framework-specific implementations of the MFE container specification.

## Available Containers

### [React Container](./react/)

**Status**: 🚧 Work in Progress

- Built with React 19 and Vite
- Uses React Context for state management
- Implements all required services
- Includes TypeScript support
- Full hot module replacement support

**Key Features**:

- ShadCN UI components
- React Router for navigation
- Tailwind CSS for styling
- Comprehensive error boundaries
- Performance optimizations

### Vue Container

**Status**: 📋 Planned (Phase 0.1)

- Vue 3 with Composition API
- Vite-based build system
- Pinia for state management
- Vue Router for navigation

### Vanilla JavaScript Container

**Status**: 📋 Planned (Phase 0.2)

- Pure TypeScript implementation
- No framework dependencies
- Native web components
- Minimal bundle size

## Container Comparison

| Feature           | React        | Vue        | Vanilla |
| ----------------- | ------------ | ---------- | ------- |
| Status            | 🚧 WIP       | 📋 Planned | 📋 Planned |
| Bundle Size       | ~45KB        | TBD        | TBD     |
| TypeScript        | ✅           | ✅         | ✅      |
| HMR Support       | ✅           | ✅         | ⚠️      |
| Component Library | ShadCN       | TBD        | Custom  |
| State Management  | Context      | Pinia      | Native  |
| Routing           | React Router | Vue Router | Native  |

## Choosing a Container

### Use React Container if:

- Your team is familiar with React
- You want to use React 19 features
- You want extensive component library support
- You prefer JSX syntax

### Use Vue Container if:

- Your team prefers Vue's template syntax
- You want reactive data binding
- You prefer Composition API patterns
- You need smaller bundle sizes

### Use Vanilla Container if:

- You want minimal dependencies
- Bundle size is critical
- You need maximum performance
- You prefer web standards

## Creating a New Container

See [Container Specification](../container-spec/) for requirements and [Creating a Container](../container-spec/creating-containers.md) for implementation guide.
