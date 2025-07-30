#!/usr/bin/env node

/**
 * Migration script to help transition from UniversalStateManager to ValtioStateManager
 * 
 * Usage: node scripts/migrate-to-valtio.js [options]
 * 
 * Options:
 *   --check     Check which files use state manager
 *   --update    Update imports to include Valtio types
 *   --rollback  Revert to using only UniversalStateManager
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const args = process.argv.slice(2);
const mode = args[0] || '--check';

console.log('🔄 Valtio Migration Script\n');

function findStateManagerUsage() {
  console.log('📍 Finding files that use StateManager...\n');
  
  try {
    const result = execSync(
      `grep -r "StateManager\\|stateManager" apps/mfe-* --include="*.ts" --include="*.tsx" --include="*.vue" -l | grep -v node_modules`,
      { encoding: 'utf8' }
    );
    
    return result.trim().split('\n').filter(Boolean);
  } catch (error) {
    console.log('No files found using StateManager');
    return [];
  }
}

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  const checks = {
    importsStateManager: content.includes('import') && content.includes('StateManager'),
    usesStateManager: content.includes('stateManager'),
    hasValtioCheck: content.includes('instanceof ValtioStateManager'),
    usesValtioHooks: content.includes('useValtioGlobal'),
  };
  
  return checks;
}

function updateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Add ValtioStateManager to imports if needed
  if (content.includes("from '@mfe/universal-state'") && !content.includes('ValtioStateManager')) {
    content = content.replace(
      /import\s*{\s*([^}]+)\s*}\s*from\s*['"]@mfe\/universal-state['"]/,
      (match, imports) => {
        const importList = imports.split(',').map(i => i.trim());
        if (!importList.includes('ValtioStateManager')) {
          importList.push('ValtioStateManager');
          modified = true;
        }
        return `import { ${importList.join(', ')} } from '@mfe/universal-state'`;
      }
    );
  }
  
  // Add feature detection template
  if (content.includes('stateManager') && !content.includes('instanceof ValtioStateManager')) {
    console.log(`  💡 Consider adding Valtio detection to ${path.basename(filePath)}`);
    console.log(`     Example: if (stateManager instanceof ValtioStateManager) { ... }\n`);
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`  ✅ Updated imports in ${path.basename(filePath)}`);
  }
  
  return modified;
}

async function main() {
  const files = findStateManagerUsage();
  
  if (files.length === 0) {
    console.log('No files found using StateManager.');
    return;
  }
  
  console.log(`Found ${files.length} files using StateManager:\n`);
  
  switch (mode) {
    case '--check':
      console.log('📊 Analysis Results:\n');
      
      let valtioReady = 0;
      let needsUpdate = 0;
      
      files.forEach(file => {
        const checks = checkFile(file);
        const fileName = path.relative(process.cwd(), file);
        
        if (checks.hasValtioCheck || checks.usesValtioHooks) {
          console.log(`✅ ${fileName} - Already supports Valtio`);
          valtioReady++;
        } else if (checks.usesStateManager) {
          console.log(`⚠️  ${fileName} - Needs Valtio support`);
          needsUpdate++;
        }
      });
      
      console.log(`\n📈 Summary:`);
      console.log(`   - ${valtioReady} files already support Valtio`);
      console.log(`   - ${needsUpdate} files need updates`);
      console.log(`   - ${((valtioReady / files.length) * 100).toFixed(1)}% migration complete`);
      
      if (needsUpdate > 0) {
        console.log(`\n💡 Run with --update to add Valtio imports automatically`);
      }
      break;
      
    case '--update':
      console.log('🔧 Updating files...\n');
      
      let updated = 0;
      files.forEach(file => {
        if (updateFile(file)) {
          updated++;
        }
      });
      
      console.log(`\n✅ Updated ${updated} files`);
      console.log('📝 Remember to manually add feature detection where needed');
      break;
      
    case '--rollback':
      console.log('⏪ Rollback mode not implemented yet');
      console.log('   To rollback: set VITE_USE_VALTIO_STATE=false');
      break;
      
    default:
      console.log('❌ Unknown option:', mode);
      console.log('   Use: --check, --update, or --rollback');
  }
  
  console.log('\n🎯 Next Steps:');
  console.log('1. Set VITE_USE_VALTIO_STATE=true in .env.local');
  console.log('2. Update MFEs to use Valtio features for better performance');
  console.log('3. Test thoroughly before production deployment');
  console.log('4. Monitor performance metrics\n');
}

main().catch(console.error);