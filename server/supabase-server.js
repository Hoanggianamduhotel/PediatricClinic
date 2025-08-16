require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')
const { eq, ilike, desc } = require('drizzle-orm')
const { db, testConnection, benhnhan } = require('./db/connection')

const app = express()
const PORT = process.env.PORT || 10000

// Test database connection on startup
testConnection()

// CORS - Allow all origins for now
app.use(cors())

// Body parsing middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve static files from dist directory for production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'dist')))
}

// Health check with database status
app.get('/health', async (req, res) => {
  try {
    await db.select().from(benhnhan).limit(1)
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: 'connected'
    })
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message
    })
  }
})

// API Routes for patients (benhnhan)

// Get all patients with search
app.get('/api/benhnhan', async (req, res) => {
  try {
    const { search } = req.query
    
    let query = db.select().from(benhnhan)
    
    if (search && search.trim()) {
      // Search by name (case insensitive)
      query = query.where(ilike(benhnhan.ho_ten, `%${search.trim()}%`))
    }
    
    // Order by creation date (newest first)
    const results = await query.orderBy(desc(benhnhan.created_at)).limit(50)
    
    res.json({ 
      success: true,
      data: results,
      count: results.length
    })
  } catch (error) {
    console.error('Get patients error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch patients',
      message: 'Không thể tải danh sách bệnh nhân',
      details: error.message
    })
  }
})

// Create new patient
app.post('/api/benhnhan', async (req, res) => {
  try {
    const { ho_ten, ngay_sinh, gioi_tinh, dia_chi, so_dien_thoai, can_nang } = req.body
    
    // Validation
    if (!ho_ten || !ho_ten.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'Vui lòng nhập họ tên bệnh nhân'
      })
    }

    if (!ngay_sinh) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields', 
        message: 'Vui lòng nhập ngày sinh'
      })
    }

    if (!gioi_tinh) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'Vui lòng chọn giới tính'
      })
    }
    
    // Calculate months old
    const birthDate = new Date(ngay_sinh)
    const today = new Date()
    const thang_tuoi = Math.floor((today - birthDate) / (1000 * 60 * 60 * 24 * 30.44))
    
    const newPatientData = {
      ho_ten: ho_ten.trim(),
      ngay_sinh,
      gioi_tinh,
      dia_chi: dia_chi?.trim() || null,
      so_dien_thoai: so_dien_thoai?.trim() || null,
      can_nang: can_nang ? parseFloat(can_nang) : null,
      thang_tuoi,
      created_at: new Date().toISOString().split('T')[0]
    }
    
    const [newPatient] = await db.insert(benhnhan).values(newPatientData).returning()
    
    res.status(201).json({
      success: true,
      message: 'Thêm bệnh nhân thành công',
      data: newPatient
    })
  } catch (error) {
    console.error('Create patient error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to create patient',
      message: 'Không thể thêm bệnh nhân',
      details: error.message
    })
  }
})

// Get patient by ID
app.get('/api/benhnhan/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    const [patient] = await db.select().from(benhnhan).where(eq(benhnhan.id, id)).limit(1)
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found',
        message: 'Không tìm thấy bệnh nhân'
      })
    }
    
    res.json({ 
      success: true,
      data: patient 
    })
  } catch (error) {
    console.error('Get patient error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch patient',
      message: 'Không thể tải thông tin bệnh nhân',
      details: error.message
    })
  }
})

// Serve frontend for production (catch-all handler)
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'))
  })
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🏥 Clinic BS Khang Server running on http://0.0.0.0:${PORT}`)
  console.log(`📊 Health check: http://0.0.0.0:${PORT}/health`)
  console.log(`🎯 Reception API: http://0.0.0.0:${PORT}/api/benhnhan`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🗄️ Database: ${process.env.DATABASE_URL ? 'Supabase connected' : 'No DATABASE_URL'}`)
})