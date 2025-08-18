# @mfe-toolkit/cli

Command-line tools for creating and managing microfrontends.

## Installation

```bash
npm install -g @mfe-toolkit/cli
# or
pnpm add -g @mfe-toolkit/cli
```

## Commands

### create

Create a new microfrontend with scaffolding and templates.

```bash
mfe-toolkit create [name] [options]
```

**Options:**
- `-t, --template <template>` - Template to use (react, react17, react18, react19, vue, solidjs, vanilla-ts)
- `-y, --yes` - Skip prompts and use defaults

**Interactive Mode:**
```bash
mfe-toolkit create
```

The CLI will prompt you for:
1. MFE name
2. Framework choice (React, Vue 3, Solid.js, Vanilla TypeScript)
3. React version (if React is selected)

**Examples:**
```bash
# Interactive mode
mfe-toolkit create

# Create React 18 MFE
mfe-toolkit create my-mfe --template react18

# Create Vue MFE with defaults
mfe-toolkit create my-vue-mfe --template vue --yes
```

### validate

Validate an MFE manifest file.

```bash
mfe-toolkit validate [manifest-path]
```

**Options:**
- `-v, --verbose` - Show detailed validation output

**Examples:**
```bash
# Validate manifest.json in current directory
mfe-toolkit validate

# Validate specific manifest
mfe-toolkit validate ./my-mfe/manifest.json

# Verbose validation
mfe-toolkit validate --verbose
```

### generate

Generate configuration files and boilerplate.

```bash
mfe-toolkit generate <type> [options]
```

**Types:**
- `manifest` - Generate a manifest.json file
- `config` - Generate mfe.config.mjs file
- `build` - Generate build.js file

**Examples:**
```bash
# Generate manifest
mfe-toolkit generate manifest

# Generate config
mfe-toolkit generate config

# Generate build script
mfe-toolkit generate build
```

## Templates

### React Templates

#### React 19 (Latest)
- Server Components ready
- use() hook support
- Optimistic UI capabilities
- Enhanced Suspense

#### React 18 (Stable)
- Concurrent rendering
- Automatic batching
- Suspense improvements
- Transitions API

#### React 17
- Legacy support
- Compatible with older codebases
- Standard hooks

### Vue 3 Template
- Composition API
- Script setup syntax
- TypeScript support
- Reactive state management

### Solid.js Template
- Fine-grained reactivity
- No virtual DOM
- Compiled reactive primitives
- Small bundle size (~7kb)

### Vanilla TypeScript Template
- Zero framework dependencies
- Pure TypeScript
- Minimal bundle size
- Direct DOM manipulation

## Generated Project Structure

```
my-mfe/
├── src/
│   ├── main.tsx         # Entry point
│   └── App.tsx          # Main component
├── dist/                # Build output
├── manifest.json        # MFE manifest
├── build.js            # Build script
├── mfe.config.mjs      # Dev server config
├── package.json        # Dependencies
├── tsconfig.json       # TypeScript config
└── README.md           # Documentation
```

## Standalone Development Support

All generated MFEs include standalone development support:

```json
{
  "scripts": {
    "dev": "mfe-dev",
    "build": "node build.js",
    "build:watch": "node build.js --watch"
  }
}
```

### Starting Development

```bash
cd my-mfe
pnpm install
pnpm dev
```

This starts the standalone dev server with:
- Mock services
- Dev tools panel
- Hot reload
- Event simulator

## Configuration Files

### manifest.json

Describes the MFE's requirements and capabilities:

```json
{
  "name": "my-mfe",
  "version": "1.0.0",
  "url": "http://localhost:8080/my-mfe.js",
  "dependencies": {
    "runtime": {
      "react": "^18.0.0",
      "react-dom": "^18.0.0"
    }
  },
  "capabilities": {
    "emits": ["user:action"],
    "listens": ["app:update"],
    "features": ["responsive", "themeable"]
  },
  "requirements": {
    "services": [
      { "name": "logger", "optional": false },
      { "name": "eventBus", "optional": false }
    ]
  }
}
```

### mfe.config.mjs

Configuration for the standalone dev server:

```javascript
export default {
  dev: {
    styles: [
      '../../packages/design-system/dist/styles.css'
    ],
    viewport: {
      default: 'desktop',
      presets: []
    },
    themes: {
      default: 'light',
      themes: [
        { name: 'light', displayName: 'Light', class: 'light' },
        { name: 'dark', displayName: 'Dark', class: 'dark' }
      ]
    },
    showDevTools: true
  }
};
```

### build.js

Build script using @mfe-toolkit/build:

```javascript
import { buildMFE } from '@mfe-toolkit/build';

await buildMFE({
  entry: 'src/main.tsx',
  outfile: 'dist/my-mfe.js',
  manifestPath: './manifest.json'
});
```

## Service Type Detection

The CLI automatically detects service types based on the MFE name:
- Names containing "modal" → Modal service demo
- Names containing "notification" → Notification service demo
- Names containing "event" → Event bus demo
- Others → General MFE

This affects:
- Required services in manifest
- Event namespaces
- Default capabilities
- Template code

## TypeScript Support

All templates include full TypeScript support:
- Type definitions from @mfe-toolkit/core
- Strict mode enabled
- Framework-specific types
- Service type definitions

## Design System Integration

Templates use the design system CSS classes:
- `ds-*` prefixed classes
- No inline styles
- Responsive utilities
- Theme support

## Best Practices

1. **Use Semantic Names**: Choose descriptive MFE names
2. **Select Appropriate Template**: Match your project requirements
3. **Configure Dev Server**: Customize mfe.config.mjs for your needs
4. **Test Standalone First**: Develop with mock services before integration
5. **Validate Manifests**: Run validation before deployment

## Troubleshooting

### Installation Issues

```bash
# Clear npm cache
npm cache clean --force

# Use specific registry
npm install -g @mfe-toolkit/cli --registry https://registry.npmjs.org
```

### Template Generation Issues

```bash
# Check Node version (requires 18+)
node --version

# Check pnpm installation
pnpm --version

# Use verbose mode for debugging
mfe-toolkit create my-mfe --verbose
```

### Build Issues

```bash
# Ensure dependencies are installed
pnpm install

# Check for TypeScript errors
pnpm type-check

# Build with verbose output
node build.js --verbose
```

## Extending Templates

### Custom Templates

Create custom templates by extending the base classes:

```typescript
import { TemplateGenerator } from '@mfe-toolkit/cli';

export class CustomTemplate implements TemplateGenerator {
  generateMain(): string {
    // Return main entry file content
  }
  
  generateApp(): string {
    // Return app component content
  }
  
  generatePackageJson(): object {
    // Return package.json content
  }
  
  // ... other methods
}
```

### Template Configuration

Templates support configuration through TemplateConfig:

```typescript
interface TemplateConfig {
  name: string;
  framework: Framework;
  projectPath: string;
  serviceType?: ServiceType;
  reactVersion?: ReactVersion;
}
```

## API Reference

See the [CLI API Documentation](./api.md) for detailed API reference.

## Contributing

To contribute to the CLI:

1. Fork the repository
2. Create a feature branch
3. Add/update templates in `src/templates/`
4. Update tests
5. Submit a pull request

## License

MIT