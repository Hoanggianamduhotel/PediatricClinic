const express = require('express')
const path = require('path')
const compression = require('compression')

const app = express()
const PORT = process.env.PORT || 10000

// Basic middleware
app.use(compression())

// Log requests for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`)
  next()
})

// Serve static files from dist
const distPath = path.join(__dirname, '..', 'dist')
console.log(`📁 Serving static files from: ${distPath}`)

app.use(express.static(distPath, {
  index: 'index.html',
  fallthrough: true
}))

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: 'production'
  })
})

// API fallbacks
app.get('/api/*', (req, res) => {
  res.json({
    success: true,
    data: [],
    message: 'API not available in minimal production mode'
  })
})

// SPA fallback - serve index.html for all routes
app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html')
  console.log(`Serving index.html from: ${indexPath}`)
  res.sendFile(indexPath)
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🏥 Minimal Production Server running on http://0.0.0.0:${PORT}`)
  console.log(`📊 Health check: http://0.0.0.0:${PORT}/health`)
  console.log(`📁 Static files: ${distPath}`)
})