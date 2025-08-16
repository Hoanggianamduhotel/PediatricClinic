require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const compression = require('compression')
const rateLimit = require('express-rate-limit')

const app = express()
const PORT = process.env.PORT || 3000

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
})
app.use('/api/', limiter)

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

// API Routes
app.use('/api/benhnhan', require('./routes/benhnhan'))
app.use('/api/auth', require('./routes/auth'))
app.use('/api/patients', require('./routes/patients'))
app.use('/api/staff', require('./routes/staff'))
app.use('/api/appointments', require('./routes/appointments'))
app.use('/api/medical-records', require('./routes/medical-records'))
app.use('/api/billing', require('./routes/billing'))
app.use('/api/dashboard', require('./routes/dashboard'))

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
})