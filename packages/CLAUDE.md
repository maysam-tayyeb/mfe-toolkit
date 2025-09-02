# packages/CLAUDE.md

This file provides package-specific guidance to Claude Code when working with packages in this repository.

## Package Structure

### Published NPM Packages (@mfe-toolkit organization)

1. **@mfe-toolkit/core** - Framework-agnostic types, interfaces, and implementations
2. **@mfe-toolkit/react** - React-specific components and hooks
3. **@mfe-toolkit/cli** - CLI tools for scaffolding and managing MFEs
4. **@mfe-toolkit/state** - Cross-framework state management
5. **@mfe-toolkit/state-middleware-performance** - Performance monitoring middleware
6. **@mfe-toolkit/build** - Build utilities for MFEs
7. **@mfe-toolkit/dev** - Development utilities for standalone MFE development

### Internal Packages (Private)

- **@mfe/shared** - Internal utilities for demo apps
- **@mfe/design-system** - CSS-first design system (see design-system/CLAUDE.md)
- **@mfe/design-system-react** - React component wrappers for design system

## Package Development Guidelines

### Build Process

- **Packages use tsup** for library builds (cleaner output, no .js files in src/)
- Build command: `pnpm build:packages`
- All packages export both ESM and CJS formats
- TypeScript declarations are generated automatically

### Testing Packages

```bash
# Run tests for all packages
pnpm test:packages

# Run tests for specific package
pnpm --filter @mfe-toolkit/core test

# Watch mode for specific package
pnpm --filter @mfe-toolkit/core test:watch

# Coverage for specific package
pnpm --filter @mfe-toolkit/core test:coverage
```

### Publishing Workflow

1. Update version in package.json
2. Run tests: `pnpm test:packages`
3. Build packages: `pnpm build:packages`
4. Publish: `pnpm publish --filter @mfe-toolkit/[package-name]`

### Package Dependencies

- Use workspace protocol for internal dependencies: `"workspace:*"`
- Keep external dependencies minimal
- All packages should be tree-shakable
- Peer dependencies for framework-specific packages

### TypeScript Configuration

- All packages extend `packages/tsconfig.base.json`
- Use `"composite": true` for project references
- Output to `dist/` directory
- Source files in `src/`

### Package Exports

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  }
}
```

## Common Package Tasks

### Creating a New Package

1. Create directory under `packages/`
2. Copy package.json template from similar package
3. Set up tsconfig.json extending base config
4. Add to root pnpm-workspace.yaml if needed
5. Create src/index.ts as entry point
6. Add tests in src/__tests__/

### Package Naming Conventions

- Public packages: `@mfe-toolkit/[name]`
- Private packages: `@mfe/[name]`
- Use kebab-case for package names
- Keep names descriptive but concise

## Quality Checks

Before committing package changes:

```bash
# Type checking
pnpm type-check

# Linting
pnpm lint

# Tests
pnpm test:packages

# Full validation
pnpm validate
```

## Important Notes

- All service interfaces live in `@mfe-toolkit/core`
- Implementations are tree-shakable and live in `core/src/implementations/`
- No global/window pollution - ever
- Follow TypeScript best practices (types over interfaces)
- Maintain backwards compatibility for published packages