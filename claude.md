# CLAUDE.md

This file provides essential guidance to Claude Code when working with this MFE toolkit monorepo.

**Note**: Context-specific CLAUDE.md files exist in subdirectories for detailed guidance:
- `packages/CLAUDE.md` - Package development guidelines
- `apps/CLAUDE.md` - Application and MFE guidelines
- `packages/design-system/CLAUDE.md` - Design system rules (CRITICAL)
- Individual package/app directories may have their own CLAUDE.md files

## Essential Commands

### Development

```bash
# Install dependencies (run after cloning)
pnpm install

# Build packages and MFEs (required before first run)
pnpm build

# Start container application
pnpm dev:container-react  # React container app on http://localhost:3000

# Serve MFEs (in another terminal)
pnpm serve  # Serves from dist/ on http://localhost:8080
```

### Testing

```bash
# Run tests for all packages
pnpm test:packages

# Run tests for container app
pnpm test:container

# Run tests for a specific package
pnpm --filter @mfe-toolkit/core test
pnpm --filter @mfe/container-react test

# Watch mode for specific package tests
pnpm --filter @mfe/container-react test:watch

# Coverage report for specific package
pnpm --filter @mfe/container-react test:coverage

# Run a single test file (from within package directory)
cd apps/container-react && pnpm vitest src/App.test.tsx
```

### Code Quality

```bash
# Lint all files
pnpm lint

# Fix lint issues
pnpm lint:fix

# Format code
pnpm format

# Check formatting
pnpm format:check

# Type checking
pnpm type-check

# Run all validations (format, lint, type-check, test)
pnpm validate
```

### Building

```bash
# Build packages and MFEs
pnpm build

# Preview production build
cd apps/container-react && pnpm preview
```


## Architecture Overview

**Production-ready microfrontend (MFE) monorepo** using pnpm workspaces with enterprise-grade patterns.

### Key Features
- **Multi-Framework Support**: React 17/18/19, Vue 3, Solid.js, Vanilla JS/TS
- **Zero-Pollution Design System**: CSS-first with 500+ `ds-*` prefixed utility classes
- **Service-Oriented Architecture**: Interface-based services with dependency injection
- **Dynamic MFE Loading**: ES modules with runtime URLs (no Module Federation)
- **Framework-Agnostic State**: Cross-framework state management with persistence

### Project Structure
```
mfe-toolkit/
├── apps/                    # Applications (see apps/CLAUDE.md)
│   ├── container-react/     # Main container app
│   └── service-demos/       # Demo MFEs
├── packages/                # Packages (see packages/CLAUDE.md)
│   ├── mfe-toolkit-*/       # Published npm packages
│   └── design-system/       # CSS design system (CRITICAL - see its CLAUDE.md)
└── docs/                    # Documentation
```


## Development Guidelines

### 🔴 CRITICAL: Design System Rules

**See `packages/design-system/CLAUDE.md` for complete design system rules.**

**Key Rule**: ALL UI changes MUST go through the design system FIRST. No inline styles, no custom CSS classes.

### Quick Start for New MFEs

See `apps/CLAUDE.md` for detailed MFE creation guidelines.

```bash
# Create new MFE
npx @mfe-toolkit/cli create mfe-name

# Build and serve
pnpm build
pnpm serve
```



## Commit Guidelines

- **Always test code before commit**
  - Run tests for changed files to ensure they work correctly
  - Use `pnpm test:packages` or `pnpm test:container` to run relevant tests before pushing
  - Never commit untested code
- **Always format code before commit**
  - Use `pnpm format` to ensure consistent code formatting
  - Helps maintain code quality and reduces unnecessary diffs
- **Always run lint before commit**
  - Helps catch and prevent potential code quality issues before they are committed
- **Only lint and format changed code before commit**
  - Focus on optimizing the linting and formatting process for modified files
- **Do not commit untested code**

## Development Best Practices

- **Always create and use named types**
  - Enhances code readability and type safety
  - Makes the codebase more maintainable and self-documenting
- **Do not commit code containing unnamed types**

## Personal Preferences

- I prefer functional coding

## TypeScript Best Practices

- **Use 'type' over 'interface' where possible**

## Code Style Guidance

- **Never use enums**
- **Always use shortened imports**

## State Management Principles

- **Strictly no global polluting. Only use state management**
- **No window or global object pollution - ever**
- **Design system provided via CSS classes, not component libraries**

## JavaScript Best Practices

- **Do not use deprecated functions like String.prototype.substr()**

## Mental Model

- **Think, analyse, plan, then execute**
- **At no circumstances do hacky work. Always plan and think well, document your tasks and execute.**

## Build Architecture

- **MFEs**: esbuild via `buildMFE` utility
- **Container**: Vite for dev/production
- **Packages**: tsup for library builds
- **Dependencies**: Shared via import maps at runtime

