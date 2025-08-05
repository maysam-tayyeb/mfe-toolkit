# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- React Context-based state management for container app
- AuthContext for authentication state management
- UIContext for modal and notification state management
- ContextBridge component to connect React contexts to MFE services
- KNOWN_ISSUES.md for tracking known issues
- CHANGELOG.md for documenting changes
- Typed event bus system with compile-time type safety
- Standard MFE event map with lifecycle, navigation, user, state, and communication events
- Event bus migration adapter for backward compatibility
- TypedEventDemo component demonstrating typed event usage
- Comprehensive typed event bus migration guide

### Changed

- Migrated container app from Redux Toolkit to React Context API
- Updated all container components to use contexts instead of Redux
- Modified MFE services to use lazy initialization with context bridge
- Updated import map to remove Redux dependencies
- Improved state isolation between container and MFEs
- Event bus now defaults to typed implementation instead of legacy
- All event bus tests updated to work with typed implementation

### Removed

- Redux and react-redux dependencies from container
- Global window assignments:
  - `window.__MFE_SERVICES__` (container and test files)
  - `window.__EVENT_BUS__` (container)
  - `window.__REDUX_STORE__` (container and test files)
  - `window.__MFE_STATE__` (state-demo-react)
  - `window.__MFE_UNIVERSAL_STATE__` (universal state manager)
  - `window.__STATE_MANAGER_IMPL__` (container)
- Redux store implementation (authSlice, modalSlice, notificationSlice)
- Zustand state demo from React 17 MFE (temporarily)
- Deprecated EventBusImpl class (replaced with typed implementation)
- Unused ReactAdapter class from state-demo-react
- Obsolete `global.d.ts` file from mfe-example
- Disabled `App.integration.test.tsx.disabled` file

### Fixed

- React 17 MFE loading error caused by React hooks conflict
- Context bridge initialization timing issues

### Security

- Fully eliminated global window pollution (addresses Architecture Improvement #1)
  - No more exposure of services, state, or debugging interfaces via window object
  - All debugging now uses console logging instead of window exposure
  - Test mocks exported as modules instead of window pollution
  - Maintains Chrome DevTools integration through proper Valtio devtools
- Improved state isolation between MFEs (addresses Architecture Improvement #4)

## [1.0.0] - 2025-01-29

### Initial Release

- Monorepo setup with pnpm workspaces
- Container application with React 19
- Multiple example MFEs (React 19, React 17, Vue 3, Vanilla JS)
- Shared services (Logger, Auth, Event Bus, Modal, Notification)
- Universal state management for cross-framework state sharing
- Dynamic MFE loading with ES modules
- Comprehensive testing setup with Vitest and Playwright
- Full TypeScript support
- Tailwind CSS with dark mode support
- ShadCN UI components
- Event-driven architecture for MFE communication
- MFE registry system for configuration
