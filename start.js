#!/usr/bin/env node

// Production start script for deployment
console.log('🏥 Starting Clinic BS Khang Production Server...');

// Set production environment
process.env.NODE_ENV = 'production';

try {
  // Start the Supabase-enabled production server
  require('./server/supabase-server.js');
} catch (error) {
  console.error('❌ Supabase server failed, trying basic production server');
  try {
    require('./server/production-server.js');
  } catch (error2) {
    console.error('❌ All Express servers failed, falling back to simple HTTP server');
    require('./deploy-test.js');
  }
}