# MFE Manifest Specification

The MFE Manifest is a platform-level contract that defines how microfrontends describe themselves to containers. This specification is framework-agnostic and allows any container implementation to understand and load MFEs correctly.

## 📚 Documentation Structure

### Core Documentation
- [**Manifest V2 Specification**](./specification.md) - Complete technical specification
- [**Migration Guide**](./migration-guide.md) - Migrating from V1 to V2
- [**Validation Guide**](./validation-guide.md) - Validating manifests in CI/CD

### Developer Resources
- [**Quick Start Guide**](./quick-start.md) - Get started with manifests
- [**Examples**](./examples.md) - Real-world manifest examples
- [**Best Practices**](./best-practices.md) - Recommendations for manifest design

### Technical Reference
- [**JSON Schema**](./schema-reference.md) - Complete schema documentation
- [**TypeScript Types**](./typescript-types.md) - Type definitions and usage
- [**CLI Reference**](./cli-reference.md) - Manifest CLI tool documentation

## 🎯 Purpose

MFE manifests serve as the single source of truth for:

1. **Dependency Management** - Declaring runtime, peer, and optional dependencies
2. **Service Requirements** - Specifying which container services are needed
3. **Compatibility Checking** - Ensuring MFE works with container version
4. **Capability Discovery** - Advertising what the MFE provides and consumes
5. **Configuration** - Loading behavior, security policies, and runtime settings

## 🚀 Quick Example

```json
{
  "$schema": "https://mfe-made-easy.com/schemas/mfe-manifest-v2.schema.json",
  "name": "checkout-mfe",
  "version": "2.1.0",
  "url": "https://cdn.example.com/mfes/checkout/2.1.0/bundle.js",
  "dependencies": {
    "peer": {
      "react": "^18.0.0 || ^19.0.0"
    }
  },
  "requirements": {
    "services": [
      { "name": "auth", "version": ">=1.0.0" },
      { "name": "notification", "optional": true }
    ]
  },
  "metadata": {
    "displayName": "Checkout",
    "description": "E-commerce checkout flow",
    "icon": "🛒"
  }
}
```

## 🔧 Container Implementation

Containers use manifests to:

1. **Load MFEs** - Fetch and validate before loading
2. **Check Compatibility** - Ensure version requirements are met
3. **Inject Services** - Provide only required services
4. **Handle Errors** - Show meaningful error messages
5. **Optimize Loading** - Use configuration for performance

## 📦 Supported Frameworks

Manifests work with MFEs built in:
- React (16.8+)
- Vue (3.0+)
- Angular (12+)
- Vanilla JavaScript/TypeScript
- Svelte, SolidJS, and more

## 🔍 Next Steps

- New to manifests? Start with the [Quick Start Guide](./quick-start.md)
- Migrating existing MFEs? See the [Migration Guide](./migration-guide.md)
- Building a container? Read the [Container Integration Guide](../../container-spec/manifest-integration.md)
- Contributing? Check the [Specification](./specification.md)

---

_The MFE Manifest specification is part of the MFE Toolkit platform and is maintained by the community._