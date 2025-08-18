# MFE Toolkit Documentation

Welcome to the MFE Toolkit documentation. This directory contains comprehensive documentation for the microfrontend platform.

## 📚 Documentation Structure

### 🎯 [Unified Roadmap & Planning](./ROADMAP.md)

**Single source of truth** for the platform's current state, active development, and future vision. Consolidates all planning and roadmap documentation.

### 📦 [Platform Documentation](./platform/)

Framework-agnostic documentation for the MFE Toolkit platform:

- **Architecture**: Core platform decisions and patterns
- **Manifests**: MFE specification and validation documentation
- **Packages**: Documentation for published npm packages (@mfe-toolkit/\*)

### 📋 [Container Specification](./container-spec/)

Defines what a container application must provide to host MFEs:

- **Requirements**: Services and capabilities containers must implement
- **Service Contracts**: Detailed API specifications
- **Compliance Testing**: How to verify container compatibility

## 🔍 Quick Navigation

### For MFE Developers

- **[🚀 Complete Getting Started Guide](./GETTING_STARTED.md)** - Start here! 0-100 comprehensive guide with standalone development
- **[🧪 Standalone Development](./GETTING_STARTED.md#quick-start---standalone-development)** - Develop MFEs without a container using @mfe-toolkit/dev
- [MFE Manifest Quick Start](./platform/manifests/quick-start.md)
- [Available Services](./container-spec/service-contracts.md)
- [State Management Patterns](./platform/architecture/state-patterns.md)

### For Container Developers

- [Container Requirements](./container-spec/requirements.md)
- [Creating a New Container](./container-spec/creating-containers.md)

### For Library Contributors

- [Platform Architecture](./platform/architecture/)
- [Package Development](./platform/packages/)
- [Contributing Guide](../CONTRIBUTING.md)

## 📖 Key Documentation

### Planning & Architecture
- **[Unified Roadmap](./ROADMAP.md)** - Consolidated roadmap and planning document
- [Service Demonstrations](./service-demos.md) - Overview of all service demo MFEs
- [Design System Guide](./design-system/) - CSS-first design system documentation
- [Architecture Decisions](./architecture/architecture-decisions.md) - Core platform decisions
- [State Management Architecture](./architecture/state-management-architecture.md) - Dual state management approach

## 📝 Documentation Standards

See [Documentation Style Guide](./style-guide.md) for file naming conventions, formatting guidelines, and best practices.

---

_Last updated: January 2025 - Post-cleanup with consolidated documentation_
