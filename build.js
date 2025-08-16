#!/usr/bin/env node

// Build script for production deployment
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Building Clinic BS Khang for production...');

try {
  // Build frontend with Vite
  console.log('📦 Building frontend...');
  execSync('npx vite build', { stdio: 'inherit' });
  
  // Check if dist directory was created
  const distPath = path.join(__dirname, 'dist');
  if (fs.existsSync(distPath)) {
    console.log('✅ Frontend build completed successfully');
    console.log('📁 Build output directory: ./dist');
  } else {
    throw new Error('Build failed - dist directory not found');
  }
  
  console.log('🎉 Build process completed successfully!');
  console.log('🚀 Ready for deployment');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}