#!/usr/bin/env tsx

/**
 * Production Build Script
 * 
 * This script:
 * 1. Runs `npm run build` to create a production build
 * 2. Copies all relevant files to `.production` folder
 * 3. Excludes unnecessary files (node_modules, .next cache, etc.)
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const PRODUCTION_DIR = '.production';
const ROOT_DIR = process.cwd();

// Files and folders to exclude from production build
const EXCLUDE_PATTERNS = [
  'node_modules',
  '.git',
  '.production',
  '.env.local',
  '.env.development',
  '.env.test',
  '.DS_Store',
  '*.log',
  'npm-debug.log*',
  'yarn-debug.log*',
  'yarn-error.log*',
  '.pnp',
  '.pnp.js',
  'coverage',
  '.vercel',
  '*.tsbuildinfo',
  'next-env.d.ts',
  'docker-compose.override.yml',
  '.dockerignore',
  'scripts', // Exclude scripts folder (not needed in production)
  '*.md', // Exclude markdown files (documentation)
  'SETUP*.md',
  'DOCKER*.md',
  'ADMIN*.md',
  'LOGIN*.md',
  'NEXTAUTH*.md',
  'PORT*.md',
  'PROJECTS*.md',
  'STEP*.md',
  'BUILD*.md',
  'SERVER*.md',
  'PRODUCTION*.md',
  'DEPLOYMENT*.md',
  'verify-deployment.sh',
  'ecosystem.config.js', // PM2 config - keep this, actually needed
];

// Files and folders to include (even if they match exclude patterns)
const INCLUDE_PATTERNS = [
  '.next', // Include built Next.js output
  'ecosystem.config.js',
  'package.json',
  'package-lock.json',
  '.env.production',
  'public',
  'app',
  'components',
  'lib',
  'hooks',
  'auth.ts',
  'next.config.js',
  'tailwind.config.ts',
  'postcss.config.js',
  'tsconfig.json',
  '.eslintrc.json',
  'docker-compose.yml',
  '.gitignore',
  '.dockerignore',
];

function shouldExclude(filePath: string): boolean {
  const relativePath = path.relative(ROOT_DIR, filePath);
  const fileName = path.basename(filePath);
  
  // Check if file should be included
  for (const pattern of INCLUDE_PATTERNS) {
    if (relativePath === pattern || relativePath.startsWith(pattern + path.sep)) {
      return false;
    }
    if (fileName === pattern) {
      return false;
    }
  }
  
  // Check if file should be excluded
  for (const pattern of EXCLUDE_PATTERNS) {
    if (pattern.includes('*')) {
      // Handle wildcard patterns
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      if (regex.test(fileName) || regex.test(relativePath)) {
        return true;
      }
    } else {
      if (relativePath === pattern || relativePath.startsWith(pattern + path.sep)) {
        return true;
      }
      if (fileName === pattern) {
        return true;
      }
    }
  }
  
  return false;
}

function copyFile(src: string, dest: string): void {
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  fs.copyFileSync(src, dest);
}

function copyDirectory(src: string, dest: string): void {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (shouldExclude(srcPath)) {
      console.log(`  ⏭️  Excluding: ${path.relative(ROOT_DIR, srcPath)}`);
      continue;
    }
    
    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      copyFile(srcPath, destPath);
      console.log(`  ✓ Copied: ${path.relative(ROOT_DIR, srcPath)}`);
    }
  }
}

function main() {
  console.log('🚀 Starting Production Build Process...\n');
  
  // Step 1: Run npm build
  console.log('📦 Step 1: Running npm build...');
  try {
    execSync('npm run build', { stdio: 'inherit', cwd: ROOT_DIR });
    console.log('✅ Build completed successfully!\n');
  } catch (error) {
    console.error('❌ Build failed!');
    process.exit(1);
  }
  
  // Step 2: Clean production directory
  console.log('🧹 Step 2: Cleaning .production directory...');
  if (fs.existsSync(PRODUCTION_DIR)) {
    fs.rmSync(PRODUCTION_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(PRODUCTION_DIR, { recursive: true });
  console.log('✅ Production directory cleaned!\n');
  
  // Step 3: Copy files
  console.log('📋 Step 3: Copying files to .production...');
  
  const entries = fs.readdirSync(ROOT_DIR, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(ROOT_DIR, entry.name);
    const destPath = path.join(PRODUCTION_DIR, entry.name);
    
    // Skip production directory itself
    if (entry.name === PRODUCTION_DIR) {
      continue;
    }
    
    if (shouldExclude(srcPath)) {
      console.log(`  ⏭️  Excluding: ${entry.name}`);
      continue;
    }
    
    if (entry.isDirectory()) {
      console.log(`  📁 Copying directory: ${entry.name}`);
      copyDirectory(srcPath, destPath);
    } else {
      copyFile(srcPath, destPath);
      console.log(`  ✓ Copied: ${entry.name}`);
    }
  }
  
  // Step 4: Create .production/.gitignore
  console.log('\n📝 Step 4: Creating .production/.gitignore...');
  const productionGitignore = `# Production build - do not commit
node_modules
.next
.env.local
.env.development
.env.test
*.log
`;
  fs.writeFileSync(path.join(PRODUCTION_DIR, '.gitignore'), productionGitignore);
  console.log('✅ .gitignore created!\n');
  
  // Step 5: Summary
  console.log('✨ Production build complete!');
  console.log(`📦 Production files are in: ${PRODUCTION_DIR}/`);
  console.log('\n📋 Next steps:');
  console.log('  1. Review the .production folder');
  console.log('  2. Copy .production to your server');
  console.log('  3. On server: cd .production && npm install --production');
  console.log('  4. On server: npm start (or use PM2)');
  console.log('');
}

main();

