require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const compression = require('compression')

const app = express()
const PORT = process.env.PORT || 3000

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
}))

// CORS
app.use(cors({
  origin: ['http://localhost:5000', 'http://127.0.0.1:5000', 'http://0.0.0.0:5000'],
  credentials: true
}))

// Body parsing middleware
app.use(compression())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// API Routes (using simple in-memory storage for now)
app.use('/api/benhnhan', require('./simple-routes'))

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: 'Không tìm thấy trang yêu cầu'
  })
})

// Error handler
app.use((error, req, res, next) => {
  console.error('Server error:', error)
  res.status(500).json({
    error: 'Internal server error',
    message: 'Lỗi hệ thống, vui lòng thử lại sau'
  })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🏥 Clinic BS Khang Server running on http://0.0.0.0:${PORT}`)
  console.log(`📊 Health check: http://0.0.0.0:${PORT}/health`)
  console.log(`🎯 Reception API: http://0.0.0.0:${PORT}/api/benhnhan`)
})