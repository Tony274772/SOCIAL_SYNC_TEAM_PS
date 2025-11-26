#!/usr/bin/env node

/**
 * Server Startup Verification Script
 * Checks all dependencies and configuration before starting
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 Verifying Social Sync Configuration...\n');

// Check Node version
const nodeVersion = process.version;
console.log(`✅ Node.js Version: ${nodeVersion}`);

// Check .env file
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('✅ .env file found');
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('   MongoDB URI: ' + (envContent.includes('MONGO_URI') ? '✓ Configured' : '✗ Missing'));
  console.log('   PORT: ' + (envContent.includes('PORT') ? '✓ Configured' : '✗ Missing'));
} else {
  console.log('⚠️  .env file not found - Using defaults');
}

// Check backend structure
const backendFolders = ['config', 'models', 'routes'];
console.log('\n📁 Backend Structure:');
backendFolders.forEach(folder => {
  const folderPath = path.join(__dirname, 'backend', folder);
  if (fs.existsSync(folderPath)) {
    console.log(`  ✅ backend/${folder}`);
  } else {
    console.log(`  ❌ backend/${folder} - MISSING!`);
  }
});

// Check frontend structure
console.log('\n🎨 Frontend Structure:');
const frontendAssets = ['index.html', 'assets/css/style.css', 'assets/js/app.js'];
frontendAssets.forEach(file => {
  const filePath = path.join(__dirname, 'frontend', file);
  if (fs.existsSync(filePath)) {
    console.log(`  ✅ frontend/${file}`);
  } else {
    console.log(`  ❌ frontend/${file} - MISSING!`);
  }
});

// Check key files
console.log('\n📄 Configuration Files:');
const keyFiles = ['backend/server.js', 'package.json', '.env'];
keyFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - MISSING!`);
  }
});

// Check dependencies
console.log('\n📦 Dependencies:');
const requiredPackages = ['express', 'mongoose', 'cors', 'dotenv'];
const packageJsonPath = path.join(__dirname, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = require(packageJsonPath);
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  requiredPackages.forEach(pkg => {
    if (deps[pkg]) {
      console.log(`  ✅ ${pkg} (${deps[pkg]})`);
    } else {
      console.log(`  ❌ ${pkg} - NOT INSTALLED`);
    }
  });
}

console.log('\n🚀 Ready to start!\n');
console.log('Next step: npm start\n');
