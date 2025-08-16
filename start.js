#!/usr/bin/env node

// Production start script for deployment
console.log('🏥 Starting Clinic BS Khang Production Server...');

// Set production environment
process.env.NODE_ENV = 'production';

try {
  // Start the production server
  require('./server/production-server.js');
} catch (error) {
  console.error('❌ Express server failed, falling back to simple HTTP server');
  require('./deploy-test.js');
}