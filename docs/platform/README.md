# MFE Toolkit Platform Documentation

This section contains framework-agnostic documentation for the MFE Toolkit platform.

## Overview

The MFE Toolkit platform provides:

- **Core Libraries**: Framework-agnostic packages for building microfrontends
- **Service Contracts**: Standard interfaces for MFE-container communication
- **State Management**: Cross-framework state synchronization
- **Development Tools**: CLI and build tools for MFE development

## Architecture

### [Platform Architecture Decisions](./architecture/decisions.md)

Key architectural decisions that shape the platform:

- Dynamic ES Module imports for MFE loading
- Service injection pattern for dependency management
- Framework-agnostic state management
- Event-driven communication patterns

### [MFE Loading Architecture](./architecture/mfe-loading.md)

How MFEs are loaded and managed:

- ES module loading strategy
- MFE lifecycle management
- Error handling and recovery
- Performance optimization

### [State Management Patterns](./architecture/state-patterns.md)

Platform-level state management concepts:

- ContextBridge pattern for UI services
- Universal State Manager for application state
- Cross-tab synchronization
- State persistence strategies

## MFE Manifests

### [MFE Manifest Specification](./manifests/)

Platform-level contract for describing microfrontends:

- [Specification](./manifests/specification.md) - Complete V2 manifest format
- [Quick Start](./manifests/quick-start.md) - Getting started with manifests
- [Examples](./manifests/examples.md) - Real-world manifest examples
- [Migration Guide](./manifests/migration-guide.md) - Upgrading from V1 to V2
- [Validation Guide](./manifests/validation-guide.md) - CI/CD validation setup
- [Best Practices](./manifests/best-practices.md) - Recommendations and patterns

## Packages

### [@mfe-toolkit/core](./packages/core/)

Framework-agnostic core functionality:

- TypeScript types and interfaces
- Service implementations
- Event bus
- Logger
- Error handling

### [@mfe-toolkit/state](./packages/state/)

Cross-framework state management:

- State manager creation
- Middleware system
- Framework adapters
- Persistence plugins

### [@mfe-toolkit/cli](./packages/cli/)

Command-line tools for MFE development:

- MFE scaffolding
- Manifest generation
- Development server
- Build optimization

## Roadmap

See [Platform Roadmap](./roadmap.md) for upcoming features and development priorities.

## Contributing

See the [Contributing Guide](../../CONTRIBUTING.md) for information on how to contribute to the platform.