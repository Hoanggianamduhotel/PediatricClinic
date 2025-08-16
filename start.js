#!/usr/bin/env node

// Production start script for deployment
console.log('🏥 Starting Clinic BS Khang Production Server...');

// Set production environment
process.env.NODE_ENV = 'production';

try {
  // Start simple production server (no express dependencies)
  require('./server/simple-production.js');
} catch (error) {
  console.error('❌ Simple production server failed, trying fallback');
  require('./deploy-test.js');
}