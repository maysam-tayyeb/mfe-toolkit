# MFE Manifest Validation Guide

This guide explains how to validate MFE manifests during development and in CI/CD pipelines.

## Why Validate Manifests?

Manifest validation helps:

- **Catch errors early** - Before deployment or runtime
- **Ensure compatibility** - Verify container requirements
- **Maintain consistency** - Enforce standards across teams
- **Improve reliability** - Prevent loading failures
- **Document contracts** - Keep manifests accurate

## Validation Methods

### 1. CLI Validation

The easiest way to validate manifests is using the MFE Toolkit CLI:

```bash
# Install the CLI
npm install -g @mfe-toolkit/cli

# Validate a single manifest
mfe-toolkit manifest validate manifest.json

# Validate all manifests in a directory
mfe-toolkit manifest validate --dir ./apps

# Validate with verbose output
mfe-toolkit manifest validate manifest.json --verbose

# Validate and fix auto-fixable issues
mfe-toolkit manifest validate manifest.json --fix
```

### 2. Programmatic Validation

Validate manifests in your build scripts or tests:

```typescript
import { ManifestValidator } from '@mfe-toolkit/core';

const validator = new ManifestValidator();

// Load manifest
const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));

// Validate
const result = validator.validate(manifest);

if (!result.valid) {
  console.error('Manifest validation failed:');
  result.errors.forEach((error) => {
    console.error(`- ${error.path}: ${error.message}`);
  });
  process.exit(1);
}

// Check warnings
if (result.warnings.length > 0) {
  console.warn('Manifest warnings:');
  result.warnings.forEach((warning) => {
    console.warn(`- ${warning.path}: ${warning.message}`);
  });
}
```

### 3. JSON Schema Validation

Use standard JSON schema validators:

```bash
# Using ajv-cli
npm install -g ajv-cli

# Download schema
curl -O https://mfe-made-easy.com/schemas/mfe-manifest-v2.schema.json

# Validate
ajv validate -s mfe-manifest-v2.schema.json -d manifest.json
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Validate MFE Manifests

on:
  pull_request:
    paths:
      - '**/manifest.json'
      - '.github/workflows/validate-manifests.yml'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install MFE Toolkit CLI
        run: npm install -g @mfe-toolkit/cli

      - name: Find all manifests
        id: find-manifests
        run: |
          echo "manifests=$(find . -name 'manifest.json' -type f | jq -R -s -c 'split("\n")[:-1]')" >> $GITHUB_OUTPUT

      - name: Validate manifests
        run: |
          for manifest in ${{ join(fromJson(steps.find-manifests.outputs.manifests), ' ') }}; do
            echo "Validating $manifest"
            mfe-toolkit manifest validate "$manifest" --verbose
          done

      - name: Check manifest versions match package.json
        run: |
          for manifest in ${{ join(fromJson(steps.find-manifests.outputs.manifests), ' ') }}; do
            dir=$(dirname "$manifest")
            if [ -f "$dir/package.json" ]; then
              manifest_version=$(jq -r .version "$manifest")
              package_version=$(jq -r .version "$dir/package.json")
              if [ "$manifest_version" != "$package_version" ]; then
                echo "Version mismatch in $manifest"
                echo "Manifest: $manifest_version"
                echo "Package: $package_version"
                exit 1
              fi
            fi
          done
```

### GitLab CI

```yaml
validate-manifests:
  stage: validate
  image: node:18
  script:
    - npm install -g @mfe-toolkit/cli
    - find . -name 'manifest.json' -type f -exec mfe-toolkit manifest validate {} \;
  only:
    changes:
      - '**/manifest.json'
```

### Jenkins Pipeline

```groovy
pipeline {
  agent any

  stages {
    stage('Validate Manifests') {
      steps {
        sh 'npm install -g @mfe-toolkit/cli'
        sh '''
          for manifest in $(find . -name "manifest.json" -type f); do
            echo "Validating $manifest"
            mfe-toolkit manifest validate "$manifest"
          done
        '''
      }
    }
  }
}
```

## Build-Time Validation

### Vite Plugin

```typescript
// vite-plugin-validate-manifest.ts
import { ManifestValidator } from '@mfe-toolkit/core';
import type { Plugin } from 'vite';

export function validateManifest(): Plugin {
  const validator = new ManifestValidator();

  return {
    name: 'validate-manifest',
    buildStart() {
      try {
        const manifest = JSON.parse(fs.readFileSync('./manifest.json', 'utf8'));

        const result = validator.validate(manifest);

        if (!result.valid) {
          throw new Error(
            'Manifest validation failed:\n' +
              result.errors.map((e) => `- ${e.path}: ${e.message}`).join('\n')
          );
        }

        if (result.warnings.length > 0) {
          console.warn(
            'Manifest warnings:\n' +
              result.warnings.map((w) => `- ${w.path}: ${w.message}`).join('\n')
          );
        }
      } catch (error) {
        throw new Error(`Failed to validate manifest: ${error.message}`);
      }
    },
  };
}

// vite.config.ts
import { validateManifest } from './vite-plugin-validate-manifest';

export default {
  plugins: [validateManifest()],
};
```

### Webpack Plugin

```javascript
// webpack-plugin-validate-manifest.js
const { ManifestValidator } = require('@mfe-toolkit/core');

class ValidateManifestPlugin {
  constructor(options = {}) {
    this.validator = new ManifestValidator();
    this.manifestPath = options.manifestPath || './manifest.json';
  }

  apply(compiler) {
    compiler.hooks.beforeCompile.tapAsync('ValidateManifestPlugin', (params, callback) => {
      try {
        const manifest = JSON.parse(fs.readFileSync(this.manifestPath, 'utf8'));

        const result = this.validator.validate(manifest);

        if (!result.valid) {
          callback(
            new Error(
              'Manifest validation failed:\n' +
                result.errors.map((e) => `- ${e.path}: ${e.message}`).join('\n')
            )
          );
          return;
        }

        callback();
      } catch (error) {
        callback(error);
      }
    });
  }
}

// webpack.config.js
module.exports = {
  plugins: [new ValidateManifestPlugin()],
};
```

## Pre-commit Hooks

### Using Husky

```bash
# Install husky
npm install --save-dev husky

# Initialize husky
npx husky-init

# Add pre-commit hook
npx husky add .husky/pre-commit "npm run validate:manifests"
```

```json
// package.json
{
  "scripts": {
    "validate:manifests": "find . -name 'manifest.json' -not -path './node_modules/*' -exec npx @mfe-toolkit/cli manifest validate {} +"
  }
}
```

### Using pre-commit

```yaml
# .pre-commit-config.yaml
repos:
  - repo: local
    hooks:
      - id: validate-manifests
        name: Validate MFE Manifests
        entry: bash -c 'find . -name "manifest.json" -not -path "./node_modules/*" -exec npx @mfe-toolkit/cli manifest validate {} \;'
        language: system
        files: manifest\.json$
```

## Custom Validation Rules

Create custom validation rules for your organization:

```typescript
import { ManifestValidator, ValidationRule } from '@mfe-toolkit/core';

// Custom rule: Ensure all MFEs have a repository URL
const requireRepository: ValidationRule = {
  name: 'require-repository',
  validate: (manifest) => {
    if (!manifest.metadata?.repository) {
      return {
        valid: false,
        errors: [
          {
            path: 'metadata.repository',
            message: 'Repository URL is required by organization policy',
          },
        ],
      };
    }
    return { valid: true, errors: [] };
  },
};

// Custom rule: Enforce naming convention
const namingConvention: ValidationRule = {
  name: 'naming-convention',
  validate: (manifest) => {
    if (!manifest.name.startsWith('org-')) {
      return {
        valid: false,
        errors: [
          {
            path: 'name',
            message: 'MFE name must start with "org-" prefix',
          },
        ],
      };
    }
    return { valid: true, errors: [] };
  },
};

// Use custom validator
const validator = new ManifestValidator({
  customRules: [requireRepository, namingConvention],
});
```

## Validation Rules Reference

### Schema Validation

1. **Required fields** - All required fields must be present
2. **Type checking** - Fields must match expected types
3. **Pattern matching** - Name field must match pattern
4. **Version format** - Must be valid semantic version
5. **URL format** - Must be valid URI

### Semantic Validation

1. **Service availability** - Required services must exist
2. **Version compatibility** - Version ranges must be valid
3. **Dependency conflicts** - No conflicting dependencies
4. **Permission validity** - Permissions must be recognized
5. **Event naming** - Should follow naming conventions

### Best Practice Warnings

1. **Missing metadata** - Warn if optional metadata missing
2. **No fallback URLs** - Suggest alternative URLs
3. **Missing security** - Warn if no CSP directives
4. **Large timeouts** - Warn if timeout > 60 seconds
5. **No documentation** - Suggest adding docs URL

## Troubleshooting Validation Errors

### Common Errors and Solutions

#### "Invalid manifest version"

```json
// ❌ Wrong
"version": "v1.0.0"

// ✅ Correct
"version": "1.0.0"
```

#### "Invalid URL format"

```json
// ❌ Wrong
"url": "my-mfe.js"

// ✅ Correct
"url": "http://localhost:3001/my-mfe.js"
```

#### "Unknown service required"

```json
// ❌ Wrong
"services": [{ "name": "unknownService" }]

// ✅ Correct - Use known services
"services": [{ "name": "logger" }]
```

#### "Invalid dependency version"

```json
// ❌ Wrong
"react": "latest"

// ✅ Correct
"react": "^18.0.0"
```

## Performance Considerations

### Caching Validation Results

```typescript
import { ManifestValidator } from '@mfe-toolkit/core';
import { createHash } from 'crypto';

const cache = new Map();
const validator = new ManifestValidator();

function validateWithCache(manifest: any) {
  const hash = createHash('md5').update(JSON.stringify(manifest)).digest('hex');

  if (cache.has(hash)) {
    return cache.get(hash);
  }

  const result = validator.validate(manifest);
  cache.set(hash, result);

  return result;
}
```

### Parallel Validation

```typescript
import { ManifestValidator } from '@mfe-toolkit/core';
import { glob } from 'glob';

async function validateAllManifests() {
  const validator = new ManifestValidator();
  const files = await glob('**/manifest.json', {
    ignore: '**/node_modules/**',
  });

  const results = await Promise.all(
    files.map(async (file) => {
      const manifest = JSON.parse(await fs.promises.readFile(file, 'utf8'));
      const result = validator.validate(manifest);
      return { file, result };
    })
  );

  const failures = results.filter((r) => !r.result.valid);
  if (failures.length > 0) {
    console.error('Validation failures:', failures);
    process.exit(1);
  }
}
```

## Next Steps

1. **Set up validation** in your development workflow
2. **Add CI/CD checks** to catch issues early
3. **Create custom rules** for your organization
4. **Monitor validation metrics** to improve quality
5. **Document validation requirements** for teams

For more information:

- [Specification](./specification.md) - Complete manifest format
- [Migration Guide](./migration-guide.md) - Upgrading manifests
- [Examples](./examples.md) - Real-world manifests
