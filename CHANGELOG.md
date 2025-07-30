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

### Changed

- Migrated container app from Redux Toolkit to React Context API
- Updated all container components to use contexts instead of Redux
- Modified MFE services to use lazy initialization with context bridge
- Updated import map to remove Redux dependencies
- Improved state isolation between container and MFEs

### Removed

- Redux and react-redux dependencies from container
- Global window assignments (`__MFE_SERVICES__`, `__EVENT_BUS__`, `__REDUX_STORE__`)
- Redux store implementation (authSlice, modalSlice, notificationSlice)
- Zustand state demo from React 17 MFE (temporarily)

### Fixed

- React 17 MFE loading error caused by React hooks conflict
- Context bridge initialization timing issues

### Security

- Eliminated global window pollution (addresses Architecture Improvement #1)
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
