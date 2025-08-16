const express = require('express')
const { drizzle } = require('drizzle-orm/postgres-js')
const { eq, like, or, desc } = require('drizzle-orm')
const postgres = require('postgres')
const { benhnhan } = require('../db/schema')

const router = express.Router()

// Initialize database connection
let db
try {
  const client = postgres(process.env.DATABASE_URL)
  db = drizzle(client)
  console.log('✅ Database connected successfully')
} catch (error) {
  console.error('❌ Database connection failed:', error.message)
}

// Get all patients with search functionality
router.get('/', async (req, res) => {
  try {
    const { search } = req.query
    
    let query = db.select().from(benhnhan)
    
    if (search) {
      query = query.where(
        like(benhnhan.ho_ten, `%${search}%`)
      )
    }
    
    query = query.orderBy(desc(benhnhan.created_at))
    
    const results = await query
    
    res.json({ 
      success: true,
      data: results 
    })
  } catch (error) {
    console.error('Get benhnhan error:', error)
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
    const patient = await db
      .select()
      .from(benhnhan)
      .where(eq(benhnhan.id, req.params.id))
      .limit(1)
    
    if (patient.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found',
        message: 'Không tìm thấy bệnh nhân'
      })
    }
    
    res.json({ 
      success: true,
      data: patient[0] 
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
    
    const newPatient = await db
      .insert(benhnhan)
      .values({
        ho_ten,
        ngay_sinh: ngay_sinh ? new Date(ngay_sinh) : null,
        gioi_tinh: gioi_tinh || null,
        dia_chi: dia_chi || null,
        so_dien_thoai: so_dien_thoai || null,
        can_nang: can_nang ? parseFloat(can_nang) : null,
        thang_tuoi,
        created_at: new Date()
      })
      .returning()
    
    res.status(201).json({
      success: true,
      message: 'Thêm bệnh nhân thành công',
      data: newPatient[0]
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
    const {
      ho_ten,
      ngay_sinh,
      gioi_tinh,
      dia_chi,
      so_dien_thoai,
      can_nang
    } = req.body
    
    // Check if patient exists
    const existingPatient = await db
      .select()
      .from(benhnhan)
      .where(eq(benhnhan.id, req.params.id))
      .limit(1)
    
    if (existingPatient.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found',
        message: 'Không tìm thấy bệnh nhân'
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
    
    const updateData = {}
    if (ho_ten) updateData.ho_ten = ho_ten
    if (ngay_sinh !== undefined) {
      updateData.ngay_sinh = ngay_sinh ? new Date(ngay_sinh) : null
      updateData.thang_tuoi = thang_tuoi
    }
    if (gioi_tinh !== undefined) updateData.gioi_tinh = gioi_tinh || null
    if (dia_chi !== undefined) updateData.dia_chi = dia_chi || null
    if (so_dien_thoai !== undefined) updateData.so_dien_thoai = so_dien_thoai || null
    if (can_nang !== undefined) updateData.can_nang = can_nang ? parseFloat(can_nang) : null
    
    const updatedPatient = await db
      .update(benhnhan)
      .set(updateData)
      .where(eq(benhnhan.id, req.params.id))
      .returning()
    
    res.json({
      success: true,
      message: 'Cập nhật thông tin bệnh nhân thành công',
      data: updatedPatient[0]
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
    const existingPatient = await db
      .select()
      .from(benhnhan)
      .where(eq(benhnhan.id, req.params.id))
      .limit(1)
    
    if (existingPatient.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found',
        message: 'Không tìm thấy bệnh nhân'
      })
    }
    
    await db
      .delete(benhnhan)
      .where(eq(benhnhan.id, req.params.id))
    
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