#!/usr/bin/env tsx

/**
 * Pre-publish checklist to ensure packages are ready for npm publishing
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

interface CheckResult {
  package: string;
  checks: {
    name: string;
    passed: boolean;
    message?: string;
  }[];
}

const PACKAGES_TO_PUBLISH = [
  'mfe-dev-kit', // @mfe-toolkit/core
  'shared',      // @mfe-toolkit/shared
  'universal-state', // @mfe-toolkit/state
  'mfe-toolkit-cli', // @mfe-toolkit/cli
  'mfe-toolkit-react', // @mfe-toolkit/react
];

function checkPackage(packageDir: string): CheckResult {
  const packagePath = join(process.cwd(), 'packages', packageDir);
  const packageJsonPath = join(packagePath, 'package.json');
  
  const result: CheckResult = {
    package: packageDir,
    checks: []
  };

  // Check 1: package.json exists
  if (!existsSync(packageJsonPath)) {
    result.checks.push({
      name: 'package.json exists',
      passed: false,
      message: 'package.json not found'
    });
    return result;
  }

  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

  // Check 2: Has @mfe-toolkit scope
  const hasCorrectScope = packageJson.name?.startsWith('@mfe-toolkit/');
  result.checks.push({
    name: 'Has @mfe-toolkit scope',
    passed: hasCorrectScope,
    message: hasCorrectScope ? packageJson.name : `Invalid name: ${packageJson.name}`
  });

  // Check 3: Has version
  const hasVersion = !!packageJson.version;
  result.checks.push({
    name: 'Has version',
    passed: hasVersion,
    message: packageJson.version || 'No version specified'
  });

  // Check 4: Has description
  const hasDescription = !!packageJson.description;
  result.checks.push({
    name: 'Has description',
    passed: hasDescription,
    message: hasDescription ? '✓' : 'No description'
  });

  // Check 5: Has main/module/types fields
  const hasEntryPoints = !!(packageJson.main || packageJson.module) && !!packageJson.types;
  result.checks.push({
    name: 'Has entry points',
    passed: hasEntryPoints,
    message: hasEntryPoints ? '✓' : 'Missing main/module/types fields'
  });

  // Check 6: Has LICENSE file
  const hasLicense = existsSync(join(packagePath, 'LICENSE'));
  result.checks.push({
    name: 'Has LICENSE file',
    passed: hasLicense,
    message: hasLicense ? '✓' : 'LICENSE file missing'
  });

  // Check 7: Has README.md
  const hasReadme = existsSync(join(packagePath, 'README.md'));
  result.checks.push({
    name: 'Has README.md',
    passed: hasReadme,
    message: hasReadme ? '✓' : 'README.md missing'
  });

  // Check 8: Has files field
  const hasFilesField = !!packageJson.files;
  result.checks.push({
    name: 'Has files field',
    passed: hasFilesField,
    message: hasFilesField ? '✓' : 'No files field specified'
  });

  // Check 9: Has publishConfig
  const hasPublishConfig = !!packageJson.publishConfig?.access;
  result.checks.push({
    name: 'Has publishConfig',
    passed: hasPublishConfig,
    message: hasPublishConfig ? '✓' : 'No publishConfig.access specified'
  });

  // Check 10: Has repository info
  const hasRepository = !!packageJson.repository || !!packageJson.homepage;
  result.checks.push({
    name: 'Has repository info',
    passed: hasRepository,
    message: hasRepository ? '✓' : 'No repository/homepage specified'
  });

  return result;
}

function checkBuildExists(packageDir: string): boolean {
  const distPath = join(process.cwd(), 'packages', packageDir, 'dist');
  return existsSync(distPath);
}

function runChecks() {
  console.log('🔍 Running pre-publish checks...\n');

  const results: CheckResult[] = [];
  let allPassed = true;

  // Check each package
  for (const pkg of PACKAGES_TO_PUBLISH) {
    const result = checkPackage(pkg);
    results.push(result);

    // Check if build exists
    const hasBuild = checkBuildExists(pkg);
    result.checks.push({
      name: 'Has build output',
      passed: hasBuild,
      message: hasBuild ? '✓' : 'No dist folder - run build first'
    });

    // Check if any check failed
    if (result.checks.some(check => !check.passed)) {
      allPassed = false;
    }
  }

  // Display results
  for (const result of results) {
    console.log(`\n📦 ${result.package}`);
    console.log('─'.repeat(40));
    
    for (const check of result.checks) {
      const icon = check.passed ? '✅' : '❌';
      const message = check.message ? ` - ${check.message}` : '';
      console.log(`${icon} ${check.name}${message}`);
    }
  }

  // Check npm login status
  console.log('\n🔐 NPM Authentication');
  console.log('─'.repeat(40));
  try {
    const whoami = execSync('npm whoami', { encoding: 'utf-8' }).trim();
    console.log(`✅ Logged in as: ${whoami}`);
  } catch {
    console.log('❌ Not logged in to npm');
    console.log('   Run: npm login');
    allPassed = false;
  }

  // Summary
  console.log('\n' + '═'.repeat(50));
  if (allPassed) {
    console.log('✅ All checks passed! Ready to publish.');
    console.log('\nNext steps:');
    console.log('1. Run: pnpm build');
    console.log('2. Run: pnpm publish:dry (to test)');
    console.log('3. Run: pnpm publish:alpha (to publish alpha versions)');
  } else {
    console.log('❌ Some checks failed. Please fix the issues above.');
    process.exit(1);
  }
}

// Run the checks
runChecks();