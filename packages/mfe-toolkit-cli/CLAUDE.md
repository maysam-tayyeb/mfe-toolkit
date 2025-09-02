# packages/mfe-toolkit-cli/CLAUDE.md

This file provides guidance for working with the @mfe-toolkit/cli package.

## CLI Architecture

### Template System
- Templates are now separated files with a template engine
- Located in `src/templates/[framework]/files/`
- Uses Handlebars-style placeholders: `{{name}}`, `{{description}}`

### Supported Frameworks
- React (17, 18, 19)
- Vue 3
- Solid.js
- Vanilla TypeScript

## CLI Commands

### Create MFE
```bash
npx @mfe-toolkit/cli create mfe-name

# With options
npx @mfe-toolkit/cli create mfe-name \
  --framework react \
  --path ./apps/service-demos \
  --registry ./apps/container-react/public/mfe-registry.json
```

### Registry Management
```bash
# Add MFE to registry
npx @mfe-toolkit/cli registry add \
  --name mfe-name \
  --url http://localhost:8080/mfe-name.js \
  --registry ./public/mfe-registry.json

# Remove from registry
npx @mfe-toolkit/cli registry remove mfe-name \
  --registry ./public/mfe-registry.json

# Update registry entry
npx @mfe-toolkit/cli registry update mfe-name \
  --url http://localhost:8080/new-path.js \
  --registry ./public/mfe-registry.json

# List all MFEs
npx @mfe-toolkit/cli registry list \
  --registry ./public/mfe-registry.json
```

### Manifest Commands
```bash
# Validate manifest
npx @mfe-toolkit/cli manifest validate ./manifest.json

# Migrate to v2
npx @mfe-toolkit/cli manifest migrate ./manifest.json
```

## Template Structure

Each template includes:
- `manifest.json` - MFE configuration
- `package.json` - Dependencies and scripts
- `src/main.[ext]` - Entry point with MFEModule export
- `build.js` - Build configuration using buildMFE
- Framework-specific files (tsconfig, etc.)

## Adding New Templates

1. Create directory: `src/templates/[framework]/files/`
2. Add template files with placeholders
3. Update `src/templates/[framework]/index.ts`
4. Add to framework choices in `create.ts`

## Testing

```bash
# Run tests
pnpm test

# Watch mode
pnpm test:watch

# Manual testing
pnpm build
node dist/index.js create test-mfe
```

Current status: 36 tests passing with comprehensive coverage.

## Implementation Details

### Auto-Registry Update
The create command automatically adds new MFEs to the registry if `--registry` is provided.

### Template Engine
Uses a simple string replacement system:
```typescript
content.replace(/{{(\w+)}}/g, (match, key) => {
  return variables[key] || match;
});
```

### Framework Detection
Automatically detects framework from manifest.json dependencies.

## Best Practices

- Always validate manifests before deployment
- Use registry commands instead of manual JSON editing
- Keep templates minimal and focused
- Test templates with actual builds after changes