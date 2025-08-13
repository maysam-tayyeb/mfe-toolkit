#!/usr/bin/env node

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

async function copyToDist() {
  console.log('📦 Copying build artifacts to root dist...');

  // Create root dist directory if it doesn't exist
  const rootDist = path.join(rootDir, 'dist');
  await fs.mkdir(rootDist, { recursive: true });

  // Copy design-system package
  console.log('\n🎨 Copying design-system...');
  const designSystemSrc = path.join(rootDir, 'packages', 'design-system', 'dist');
  const designSystemDest = path.join(rootDist, 'design-system');
  
  try {
    const stat = await fs.stat(designSystemSrc);
    if (stat.isDirectory()) {
      // Remove existing target directory if it exists
      try {
        await fs.rm(designSystemDest, { recursive: true, force: true });
      } catch (err) {
        // Ignore error if directory doesn't exist
      }
      
      // Copy the dist contents
      await fs.cp(designSystemSrc, designSystemDest, { recursive: true });
      console.log(`✅ Copied packages/design-system/dist → dist/design-system`);
    }
  } catch (err) {
    console.log(`⏭️  Skipping design-system (no dist directory)`);
  }

  console.log('\n📦 Copying MFE dist folders...');

  // Get all MFE directories
  const appsDir = path.join(rootDir, 'apps');
  const appDirs = await fs.readdir(appsDir);

  // Filter for MFE directories
  const mfeDirs = appDirs.filter((dir) => dir.startsWith('mfe-'));

  // Copy regular MFEs
  for (const mfeDir of mfeDirs) {
    const mfePath = path.join(appsDir, mfeDir);
    const mfeDistPath = path.join(mfePath, 'dist');

    // Check if MFE has a dist directory
    try {
      const stat = await fs.stat(mfeDistPath);
      if (stat.isDirectory()) {
        // Copy MFE dist to root dist with MFE name
        const targetPath = path.join(rootDist, mfeDir);

        // Remove existing target directory if it exists
        try {
          await fs.rm(targetPath, { recursive: true, force: true });
        } catch (err) {
          // Ignore error if directory doesn't exist
        }

        // Copy the dist contents
        await fs.cp(mfeDistPath, targetPath, { recursive: true });
        console.log(`✅ Copied ${mfeDir}/dist → dist/${mfeDir}`);
      }
    } catch (err) {
      // MFE doesn't have a dist directory, skip it
      console.log(`⏭️  Skipping ${mfeDir} (no dist directory)`);
    }
  }

  // Copy service demos
  const serviceDemosDir = path.join(appsDir, 'service-demos');
  try {
    const stat = await fs.stat(serviceDemosDir);
    if (stat.isDirectory()) {
      console.log('\n📦 Copying service demo MFEs...');

      // Get all service categories (modal, notification, scenarios, etc.)
      const serviceCategories = await fs.readdir(serviceDemosDir);

      for (const category of serviceCategories) {
        const categoryPath = path.join(serviceDemosDir, category);
        const categoryStat = await fs.stat(categoryPath);

        if (categoryStat.isDirectory()) {
          // Handle event-bus category which may contain scenarios
          if (category === 'event-bus') {
            // Get all items in event-bus directory
            const eventBusItems = await fs.readdir(categoryPath);
            
            for (const item of eventBusItems) {
              const itemPath = path.join(categoryPath, item);
              const itemStat = await fs.stat(itemPath);
              
              if (itemStat.isDirectory()) {
                // Check if this is the scenarios folder
                if (item === 'scenarios') {
                  console.log('\n🎬 Copying event-bus scenario MFEs...');
                  
                  // Get all scenario subdirectories (collaboration, smart-home, trading, etc.)
                  const scenarios = await fs.readdir(itemPath);
                  
                  for (const scenario of scenarios) {
                    const scenarioPath = path.join(itemPath, scenario);
                    const scenarioStat = await fs.stat(scenarioPath);
                    
                    if (scenarioStat.isDirectory()) {
                      // Get all MFEs in this scenario
                      const scenarioMfes = await fs.readdir(scenarioPath);
                      
                      for (const scenarioMfe of scenarioMfes) {
                        const mfePath = path.join(scenarioPath, scenarioMfe);
                        const mfeDistPath = path.join(mfePath, 'dist');
                        
                        try {
                          const distStat = await fs.stat(mfeDistPath);
                          if (distStat.isDirectory()) {
                            // Create nested structure in dist to match the URL path
                            const targetPath = path.join(rootDist, 'event-bus', 'scenarios', scenario);
                            
                            // Ensure parent directories exist
                            await fs.mkdir(targetPath, { recursive: true });
                            
                            // Copy the dist contents directly to the scenario folder
                            const files = await fs.readdir(mfeDistPath);
                            for (const file of files) {
                              const srcFile = path.join(mfeDistPath, file);
                              const destFile = path.join(targetPath, file);
                              await fs.cp(srcFile, destFile, { recursive: true });
                            }
                            
                            console.log(
                              `✅ Copied event-bus/scenarios/${scenario}/${scenarioMfe}/dist → dist/event-bus/scenarios/${scenario}/`
                            );
                          }
                        } catch (err) {
                          // MFE doesn't have a dist directory, skip it
                          console.log(`⏭️  Skipping event-bus/scenarios/${scenario}/${scenarioMfe} (no dist directory)`);
                        }
                      }
                    }
                  }
                } else {
                  // Regular MFE in event-bus folder (not in scenarios)
                  const mfeDistPath = path.join(itemPath, 'dist');
                  
                  try {
                    const distStat = await fs.stat(mfeDistPath);
                    if (distStat.isDirectory()) {
                      const targetPath = path.join(rootDist, 'service-demos', 'event-bus', item);
                      
                      // Remove existing target directory if it exists
                      try {
                        await fs.rm(targetPath, { recursive: true, force: true });
                      } catch (err) {
                        // Ignore error if directory doesn't exist
                      }
                      
                      // Ensure parent directories exist
                      await fs.mkdir(path.dirname(targetPath), { recursive: true });
                      
                      // Copy the dist contents
                      await fs.cp(mfeDistPath, targetPath, { recursive: true });
                      console.log(
                        `✅ Copied service-demos/event-bus/${item}/dist → dist/service-demos/event-bus/${item}`
                      );
                    }
                  } catch (err) {
                    // MFE doesn't have a dist directory, skip it
                    console.log(`⏭️  Skipping event-bus/${item} (no dist directory)`);
                  }
                }
              }
            }
          } else {
            // Regular service demo handling
            // Get all demo MFEs in this category
            const demoMfes = await fs.readdir(categoryPath);

            for (const demoMfe of demoMfes) {
              const demoPath = path.join(categoryPath, demoMfe);
              const demoDistPath = path.join(demoPath, 'dist');

              try {
                const distStat = await fs.stat(demoDistPath);
                if (distStat.isDirectory()) {
                  // Create nested structure in dist to match the URL path
                  const targetPath = path.join(rootDist, 'service-demos', category, demoMfe);

                  // Remove existing target directory if it exists
                  try {
                    await fs.rm(targetPath, { recursive: true, force: true });
                  } catch (err) {
                    // Ignore error if directory doesn't exist
                  }

                  // Ensure parent directories exist
                  await fs.mkdir(path.dirname(targetPath), { recursive: true });

                  // Copy the dist contents
                  await fs.cp(demoDistPath, targetPath, { recursive: true });
                  console.log(
                    `✅ Copied service-demos/${category}/${demoMfe}/dist → dist/service-demos/${category}/${demoMfe}`
                  );
                }
              } catch (err) {
                // Demo doesn't have a dist directory, skip it
                console.log(`⏭️  Skipping ${category}/${demoMfe} (no dist directory)`);
              }
            }
          }
        }
      }
    }
  } catch (err) {
    console.log('⏭️  No service-demos directory found');
  }

  console.log('\n🎉 All MFE dist folders copied to root dist!');
}

// Run the script
copyToDist().catch((err) => {
  console.error('❌ Error copying to dist:', err);
  process.exit(1);
});
