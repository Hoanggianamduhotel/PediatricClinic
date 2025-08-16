require('dotenv').config()
const express = require('express')
const path = require('path')
const compression = require('compression')
const helmet = require('helmet')

const app = express()
const PORT = process.env.PORT || 10000

// Security and performance middleware
app.use(helmet({
  contentSecurityPolicy: false // Allow inline styles for Vuetify
}))
app.use(compression())

// Serve static files with better error handling
const distPath = path.join(__dirname, '..', 'dist')
console.log(`📁 Static files path: ${distPath}`)

app.use(express.static(distPath, {
  maxAge: '1d', // Cache static assets for 1 day
  etag: true,
  fallthrough: true
}))

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  })
})

// API endpoints fallback (return empty data for missing APIs)
app.get('/api/*', (req, res) => {
  res.json({
    success: true,
    data: [],
    message: 'API endpoint not implemented in production server'
  })
})

// SPA fallback - serve index.html for all other routes
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, '..', 'dist', 'index.html')
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Error serving index.html:', err)
      res.status(404).send('Application not found. Please rebuild the application.')
    }
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err)
  res.status(500).json({
    error: 'Internal server error',
    message: 'Đã xảy ra lỗi hệ thống'
  })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🏥 Clinic BS Khang Production Server running on http://0.0.0.0:${PORT}`)
  console.log(`📊 Health check: http://0.0.0.0:${PORT}/health`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'production'}`)
  console.log(`📁 Serving static files from: ${path.join(__dirname, '..', 'dist')}`)
})