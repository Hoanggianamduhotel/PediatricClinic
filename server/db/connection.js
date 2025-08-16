require('dotenv').config()
const { drizzle } = require('drizzle-orm/postgres-js')
const postgres = require('postgres')
const { benhnhan } = require('./schema')

// Create database connection
const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.error('❌ DATABASE_URL environment variable is required')
  process.exit(1)
}

const client = postgres(connectionString, {
  max: 10, // Maximum connections in pool
  idle_timeout: 20,
  connect_timeout: 10,
})

const db = drizzle(client, { schema: { benhnhan } })

// Test connection
async function testConnection() {
  try {
    console.log('🔄 Testing database connection...')
    await client`SELECT 1`
    console.log('✅ Database connected successfully')
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
    return false
  }
}

module.exports = {
  db,
  client,
  testConnection,
  benhnhan
}