require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')

const app = express()
const PORT = process.env.PORT || 5000

// In-memory storage for patients (temporary)
let patients = []
let patientIdCounter = 1

// CORS
app.use(cors())

// Body parsing middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, '..', 'dist')))

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// API Routes for patients
app.get('/api/benhnhan', (req, res) => {
  try {
    const { search } = req.query
    
    let results = [...patients]
    
    if (search) {
      const searchLower = search.toLowerCase()
      results = patients.filter(patient => 
        patient.ho_ten.toLowerCase().includes(searchLower)
      )
    }
    
    // Sort by creation date (newest first)
    results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    
    res.json({ 
      success: true,
      data: results 
    })
  } catch (error) {
    console.error('Get patients error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch patients',
      message: 'Không thể tải danh sách bệnh nhân'
    })
  }
})

app.post('/api/benhnhan', (req, res) => {
  try {
    const { ho_ten, ngay_sinh, gioi_tinh, dia_chi, so_dien_thoai, can_nang } = req.body
    
    // Validation
    if (!ho_ten || !ngay_sinh || !gioi_tinh) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc'
      })
    }
    
    // Calculate months old
    const birthDate = new Date(ngay_sinh)
    const today = new Date()
    const thang_tuoi = Math.floor((today - birthDate) / (1000 * 60 * 60 * 24 * 30.44))
    
    const newPatient = {
      id: `patient_${patientIdCounter++}`,
      ho_ten,
      ngay_sinh,
      gioi_tinh,
      dia_chi: dia_chi || null,
      so_dien_thoai: so_dien_thoai || null,
      can_nang: can_nang ? parseFloat(can_nang) : null,
      thang_tuoi,
      created_at: new Date().toISOString()
    }
    
    patients.push(newPatient)
    
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
      message: 'Không thể thêm bệnh nhân'
    })
  }
})

app.get('/api/benhnhan/:id', (req, res) => {
  try {
    const patient = patients.find(p => p.id === req.params.id)
    
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
      message: 'Không thể tải thông tin bệnh nhân'
    })
  }
})

// Serve frontend for all other routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'))
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🏥 Clinic BS Khang Production Server running on http://0.0.0.0:${PORT}`)
  console.log(`📊 Health check: http://0.0.0.0:${PORT}/health`)
  console.log(`🎯 Reception API: http://0.0.0.0:${PORT}/api/benhnhan`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'production'}`)
})