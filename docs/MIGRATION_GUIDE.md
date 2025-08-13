# MFE Design System Migration Guide

This guide explains how to migrate existing MFEs to use the new design system and development container.

## Overview

The migration involves three key changes:

1. Using design system components instead of inline styles
2. Loading design system via service injection (no global pollution)
3. Configuring the MFE for the development container

## Prerequisites

- Design system packages built: `@mfe/design-system`
- Dev container package available: `@mfe-toolkit/dev-container`
- MFE using tsup for bundling

## Step-by-Step Migration

### Step 1: Create MFE Configuration

Create an `mfe.config.js` file in your MFE root:

```javascript
module.exports = {
  name: 'Your MFE Name',
  framework: 'react19', // or 'react17', 'vue3', 'vanilla'
  entry: './src/main.tsx',

  devContainer: {
    port: 3333,
    servicesUI: true,
    services: {
      designSystem: true, // Enable design system
    },
    sharedDependencies: {
      react: '^19.0.0',
      'react-dom': '^19.0.0',
      '@mfe/design-system': '*',
    },
  },

  build: {
    externals: ['react', 'react-dom', '@mfe/design-system'],
  },
};
```

### Step 2: Update Service Types

Extend the MFEServices type to include design system:

```typescript
interface AppProps {
  services: MFEServices & {
    designSystem?: {
      getReactComponents(): Promise<any>;
      getVueComponents(): Promise<any>;
      getVanillaHelpers(): Promise<any>;
      getTokens(): Promise<any>;
    };
  };
}
```

### Step 3: Load Design System Components

Load components asynchronously in your MFE:

```typescript
function App({ services }: AppProps) {
  const [designSystem, setDesignSystem] = useState<any>(null);

  useEffect(() => {
    const loadDesignSystem = async () => {
      if (services.designSystem) {
        try {
          const components = await services.designSystem.getReactComponents();
          setDesignSystem(components);
        } catch (error) {
          console.warn('Design system not available');
        }
      }
    };
    loadDesignSystem();
  }, [services.designSystem]);

  // Use components
  const { Card, Button } = designSystem || {};

  return (
    <div>
      {Card ? (
        <Card variant="elevated">
          <Button variant="primary">Click me</Button>
        </Card>
      ) : (
        <div className="fallback-card">
          <button className="fallback-button">Click me</button>
        </div>
      )}
    </div>
  );
}
```

### Step 4: Implement Fallback Components

Always provide fallbacks for when design system is unavailable:

```typescript
const FallbackCard: React.FC<any> = ({ children, variant = 'default' }) => {
  const classes = {
    default: 'border rounded-lg p-6 shadow-sm',
    elevated: 'border rounded-lg p-6 shadow-md',
  };

  return <div className={classes[variant]}>{children}</div>;
};

const FallbackButton: React.FC<any> = ({ children, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
    >
      {children}
    </button>
  );
};
```

### Step 5: Update Build Configuration

Update your `tsup.config.js` to mark design system as external:

```javascript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/main.ts'],
  format: ['esm'],
  external: ['react', 'react-dom', '@mfe/design-system', '@mfe-toolkit/core'],
  outDir: 'dist',
});
```

### Step 6: Run with Dev Container

Start your MFE with the development container:

```bash
# In your MFE directory
npx @mfe-toolkit/dev-container

# Or if installed globally
mfe-dev

# With options
mfe-dev --port 3333 --services-ui
```

## Migration Example: Modal Demo

### Before Migration

```typescript
// Direct Tailwind classes, no design system
function App({ services }: AppProps) {
  return (
    <div className="border rounded-lg p-6 shadow-sm">
      <h3 className="text-xl font-semibold mb-2">Modal Demo</h3>
      <button className="px-4 py-2 bg-blue-500 text-white rounded">
        Open Modal
      </button>
    </div>
  );
}
```

### After Migration

```typescript
// Using design system with fallbacks
function App({ services }: AppProps) {
  const [{ Card, Button }, setComponents] = useState<any>({});

  useEffect(() => {
    services.designSystem?.getReactComponents()
      .then(setComponents)
      .catch(() => console.warn('Using fallbacks'));
  }, []);

  const CardComponent = Card || FallbackCard;
  const ButtonComponent = Button || FallbackButton;

  return (
    <CardComponent variant="elevated">
      <h3 className="text-xl font-semibold mb-2">Modal Demo</h3>
      <ButtonComponent variant="primary" onClick={handleModal}>
        Open Modal
      </ButtonComponent>
    </CardComponent>
  );
}
```

## Framework-Specific Considerations

### React (17 & 19)

- Components loaded via `getReactComponents()`
- Use hooks for async loading
- Provide React-based fallbacks

### Vue 3

- Components loaded via `getVueComponents()`
- Use composition API for loading
- Register components locally

### Vanilla TypeScript

- Helpers loaded via `getVanillaHelpers()`
- Use class generators or DOM manipulation
- Apply classes directly to elements

## Testing the Migration

1. **With Design System**: Run with dev container, verify components load
2. **Without Design System**: Remove service, verify fallbacks work
3. **Production Build**: Build MFE, verify externals are handled
4. **Cross-Browser**: Test in different browsers for compatibility

## Common Issues and Solutions

### Issue: Design System Not Loading

**Solution**: Ensure `@mfe/design-system` is built and available

### Issue: TypeScript Errors

**Solution**: Extend MFEServices interface with design system types

### Issue: Bundle Size Too Large

**Solution**: Mark design system as external in build config

### Issue: Styles Not Applied

**Solution**: Ensure Tailwind CSS is available in container

## Benefits of Migration

1. **Consistency**: All MFEs use same components
2. **Maintainability**: Single source of truth for UI
3. **Performance**: Shared dependencies reduce bundle size
4. **Type Safety**: Full TypeScript support
5. **No Global Pollution**: Clean service injection pattern

## Next Steps

After migrating your MFE:

1. Remove old inline styles and custom components
2. Document any MFE-specific UI requirements
3. Contribute new components to design system if needed
4. Test thoroughly with dev container
5. Update CI/CD pipelines to include design system

## Support

For questions or issues:

- Check the [Design System Architecture](./planning/DESIGN_SYSTEM_ARCHITECTURE.md)
- Review the [MFE Dev Container docs](./planning/MFE_DEV_CONTAINER_ARCHITECTURE.md)
- Open an issue in the repository
