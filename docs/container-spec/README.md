# Container Specification

This specification defines what a container application must provide to host MFEs in the MFE Toolkit ecosystem.

## Overview

A container is the host application that:

- Loads and manages MFE lifecycles
- Provides core services to MFEs
- Handles routing and navigation
- Manages shared state and communication

## Core Requirements

Every container implementation MUST provide:

### 1. Service Layer

Containers must implement and inject these services into MFEs:

- **Logger Service**: Structured logging with levels
- **Event Bus**: Inter-MFE communication
- **Authentication Service**: User identity and permissions
- **Modal Service**: Programmatic modal management
- **Notification Service**: Toast/alert system
- **Error Reporter**: Centralized error handling

### 2. MFE Loading

Containers must:

- Load MFEs via ES module dynamic imports
- Handle MFE lifecycle (mount/unmount)
- Provide error boundaries
- Support hot module replacement in development

### 3. State Management

Containers must:

- Provide isolated state contexts
- Support the Universal State Manager
- Enable cross-tab synchronization
- Handle state persistence

### 4. Routing

Containers must:

- Support MFE-based routing
- Handle navigation events
- Maintain browser history
- Support deep linking

## Service Contracts

See [Service Contracts](./service-contracts.md) for detailed API specifications.

## Implementation Guide

See [Creating a Container](./creating-containers.md) for step-by-step implementation guidance.

## Compliance Testing

See [Testing Guide](./testing.md) for how to verify your container meets the specification.

## Reference Implementations

- [React Container](../containers/react/) - Production-ready React implementation
- Vue Container (coming soon)
- Vanilla JS Container (coming soon)
