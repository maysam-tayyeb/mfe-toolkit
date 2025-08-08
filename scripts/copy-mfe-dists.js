#!/usr/bin/env node

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

async function copyMfeDists() {
  console.log('📦 Copying MFE dist folders to root dist...');

  // Create root dist directory if it doesn't exist
  const rootDist = path.join(rootDir, 'dist');
  await fs.mkdir(rootDist, { recursive: true });

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

      // Get all service categories (modal, notification, etc.)
      const serviceCategories = await fs.readdir(serviceDemosDir);

      for (const category of serviceCategories) {
        const categoryPath = path.join(serviceDemosDir, category);
        const categoryStat = await fs.stat(categoryPath);

        if (categoryStat.isDirectory()) {
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
  } catch (err) {
    console.log('⏭️  No service-demos directory found');
  }

  console.log('\n🎉 All MFE dist folders copied to root dist!');
}

// Run the script
copyMfeDists().catch((err) => {
  console.error('❌ Error copying MFE dists:', err);
  process.exit(1);
});
