const express = require('express')
const router = express.Router()

// In-memory storage for testing (will be replaced with real database)
let patients = []
let patientIdCounter = 1

// Get all patients with search functionality
router.get('/', async (req, res) => {
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

// Get patient by ID
router.get('/:id', async (req, res) => {
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

// Create new patient
router.post('/', async (req, res) => {
  try {
    const {
      ho_ten,
      ngay_sinh,
      gioi_tinh,
      dia_chi,
      so_dien_thoai,
      can_nang
    } = req.body
    
    // Validation
    if (!ho_ten) {
      return res.status(422).json({
        success: false,
        error: 'Validation Error',
        message: 'Họ tên là bắt buộc'
      })
    }
    
    // Calculate age in months if birth date is provided
    let thang_tuoi = null
    if (ngay_sinh) {
      const birthDate = new Date(ngay_sinh)
      const today = new Date()
      const monthsDiff = (today.getFullYear() - birthDate.getFullYear()) * 12 + (today.getMonth() - birthDate.getMonth())
      thang_tuoi = monthsDiff
    }
    
    const newPatient = {
      id: `patient_${patientIdCounter++}`,
      ho_ten: ho_ten.trim(),
      ngay_sinh: ngay_sinh || null,
      gioi_tinh: gioi_tinh || null,
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

// Update patient
router.put('/:id', async (req, res) => {
  try {
    const patientIndex = patients.findIndex(p => p.id === req.params.id)
    
    if (patientIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found',
        message: 'Không tìm thấy bệnh nhân'
      })
    }
    
    const {
      ho_ten,
      ngay_sinh,
      gioi_tinh,
      dia_chi,
      so_dien_thoai,
      can_nang
    } = req.body
    
    // Calculate age in months if birth date is provided
    let thang_tuoi = null
    if (ngay_sinh) {
      const birthDate = new Date(ngay_sinh)
      const today = new Date()
      const monthsDiff = (today.getFullYear() - birthDate.getFullYear()) * 12 + (today.getMonth() - birthDate.getMonth())
      thang_tuoi = monthsDiff
    }
    
    const updatedPatient = {
      ...patients[patientIndex],
      ho_ten: ho_ten || patients[patientIndex].ho_ten,
      ngay_sinh: ngay_sinh !== undefined ? ngay_sinh : patients[patientIndex].ngay_sinh,
      gioi_tinh: gioi_tinh !== undefined ? gioi_tinh : patients[patientIndex].gioi_tinh,
      dia_chi: dia_chi !== undefined ? dia_chi : patients[patientIndex].dia_chi,
      so_dien_thoai: so_dien_thoai !== undefined ? so_dien_thoai : patients[patientIndex].so_dien_thoai,
      can_nang: can_nang !== undefined ? (can_nang ? parseFloat(can_nang) : null) : patients[patientIndex].can_nang,
      thang_tuoi: ngay_sinh !== undefined ? thang_tuoi : patients[patientIndex].thang_tuoi
    }
    
    patients[patientIndex] = updatedPatient
    
    res.json({
      success: true,
      message: 'Cập nhật thông tin bệnh nhân thành công',
      data: updatedPatient
    })
  } catch (error) {
    console.error('Update patient error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update patient',
      message: 'Không thể cập nhật thông tin bệnh nhân'
    })
  }
})

// Delete patient
router.delete('/:id', async (req, res) => {
  try {
    const patientIndex = patients.findIndex(p => p.id === req.params.id)
    
    if (patientIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found',
        message: 'Không tìm thấy bệnh nhân'
      })
    }
    
    patients.splice(patientIndex, 1)
    
    res.json({
      success: true,
      message: 'Xóa bệnh nhân thành công'
    })
  } catch (error) {
    console.error('Delete patient error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to delete patient',
      message: 'Không thể xóa bệnh nhân'
    })
  }
})

module.exports = router