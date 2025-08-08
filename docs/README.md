# MFE Toolkit Documentation

Welcome to the MFE Toolkit documentation. This directory contains comprehensive documentation organized into three main sections:

## 📚 Documentation Structure

### 🎯 [Platform Documentation](./platform/)

Framework-agnostic documentation for the MFE Toolkit platform, including:

- **Architecture**: Core platform decisions and patterns
- **Manifests**: MFE specification and validation documentation
- **Packages**: Documentation for published npm packages (@mfe-toolkit/\*)
- **Roadmap**: Future development plans for toolkit libraries

### 📋 [Container Specification](./container-spec/)

Defines what a container application must provide to host MFEs:

- **Requirements**: Services and capabilities containers must implement
- **Service Contracts**: Detailed API specifications
- **Compliance Testing**: How to verify container compatibility

### 🚀 [Container Implementations](./containers/)

Framework-specific container implementations:

- **[React Container](./containers/react/)**: Production-ready React 19 implementation
- **Vue Container** (coming soon): Vue 3 implementation
- **Vanilla Container** (coming soon): Pure JavaScript implementation

## 🔍 Quick Navigation

### For MFE Developers

- [Getting Started with MFEs](./platform/guides/getting-started-mfe.md)
- [MFE Manifest Quick Start](./platform/manifests/quick-start.md)
- [Available Services](./container-spec/service-contracts.md)
- [State Management Patterns](./platform/architecture/state-patterns.md)

### For Container Developers

- [Container Requirements](./container-spec/requirements.md)
- [React Container Setup](./containers/react/setup.md)
- [Creating a New Container](./container-spec/creating-containers.md)

### For Library Contributors

- [Platform Architecture](./platform/architecture/)
- [Package Development](./platform/packages/)
- [Contributing Guide](../CONTRIBUTING.md)

## 📖 Legacy Documentation

The following documentation is being reorganized:

- [Architecture Decisions](./architecture/architecture-decisions.md) → Being split between platform and container docs
- [Comprehensive Roadmap](./architecture/comprehensive-roadmap.md) → Being split into platform and container roadmaps
- [Guides](./guides/) → Being reorganized by audience

## 📝 Documentation Standards

See [Documentation Style Guide](./style-guide.md) for file naming conventions, formatting guidelines, and best practices.

---

_Last updated: January 2025_
