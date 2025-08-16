const express = require('express')
const { drizzle } = require('drizzle-orm/postgres-js')
const { eq, like, or, and, desc, asc } = require('drizzle-orm')
const postgres = require('postgres')
const { patients } = require('../db/schema')
const { authenticateToken } = require('../middleware/auth')

const router = express.Router()
const client = postgres(process.env.DATABASE_URL)
const db = drizzle(client)

// Apply authentication to all routes
router.use(authenticateToken)

// Get all patients with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      search, 
      gender, 
      age, 
      sortBy = 'createdAt', 
      sortOrder = 'desc' 
    } = req.query

    const offset = (parseInt(page) - 1) * parseInt(limit)
    let query = db.select().from(patients)

    // Build where conditions
    const conditions = []

    if (search) {
      conditions.push(
        or(
          like(patients.name, `%${search}%`),
          like(patients.parentName, `%${search}%`),
          like(patients.phone, `%${search}%`),
          like(patients.email, `%${search}%`)
        )
      )
    }

    if (gender && (gender === 'male' || gender === 'female')) {
      conditions.push(eq(patients.gender, gender))
    }

    if (age) {
      const today = new Date()
      let startDate, endDate

      switch (age) {
        case '0-1':
          startDate = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate())
          endDate = today
          break
        case '1-5':
          startDate = new Date(today.getFullYear() - 5, today.getMonth(), today.getDate())
          endDate = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate())
          break
        case '5-12':
          startDate = new Date(today.getFullYear() - 12, today.getMonth(), today.getDate())
          endDate = new Date(today.getFullYear() - 5, today.getMonth(), today.getDate())
          break
        case '12+':
          endDate = new Date(today.getFullYear() - 12, today.getMonth(), today.getDate())
          break
      }

      if (startDate && endDate) {
        conditions.push(and(
          eq(patients.dateOfBirth, '>=', startDate.toISOString().split('T')[0]),
          eq(patients.dateOfBirth, '<=', endDate.toISOString().split('T')[0])
        ))
      } else if (endDate) {
        conditions.push(eq(patients.dateOfBirth, '<=', endDate.toISOString().split('T')[0]))
      }
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions))
    }

    // Apply sorting
    const orderBy = sortOrder === 'asc' ? asc : desc
    switch (sortBy) {
      case 'name':
        query = query.orderBy(orderBy(patients.name))
        break
      case 'dateOfBirth':
        query = query.orderBy(orderBy(patients.dateOfBirth))
        break
      case 'lastVisit':
        query = query.orderBy(orderBy(patients.lastVisit))
        break
      default:
        query = query.orderBy(orderBy(patients.createdAt))
    }

    // Apply pagination
    const results = await query.limit(parseInt(limit)).offset(offset)

    // Get total count for pagination
    const totalQuery = db.select({ count: 'count(*)' }).from(patients)
    if (conditions.length > 0) {
      totalQuery.where(and(...conditions))
    }
    const totalResult = await totalQuery
    const total = parseInt(totalResult[0]?.count || 0)

    res.json({
      data: results,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    })
  } catch (error) {
    console.error('Get patients error:', error)
    res.status(500).json({
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
      .from(patients)
      .where(eq(patients.id, req.params.id))
      .limit(1)

    if (patient.length === 0) {
      return res.status(404).json({
        error: 'Patient not found',
        message: 'Không tìm thấy bệnh nhân'
      })
    }

    res.json({ data: patient[0] })
  } catch (error) {
    console.error('Get patient error:', error)
    res.status(500).json({
      error: 'Failed to fetch patient',
      message: 'Không thể tải thông tin bệnh nhân'
    })
  }
})

// Create new patient
router.post('/', async (req, res) => {
  try {
    const {
      name,
      dateOfBirth,
      gender,
      parentName,
      phone,
      email,
      address,
      medicalHistory,
      notes
    } = req.body

    // Validation
    if (!name || !dateOfBirth || !gender || !parentName || !phone) {
      return res.status(422).json({
        error: 'Validation Error',
        message: 'Tên, ngày sinh, giới tính, tên phụ huynh và số điện thoại là bắt buộc'
      })
    }

    if (!['male', 'female'].includes(gender)) {
      return res.status(422).json({
        error: 'Validation Error',
        message: 'Giới tính phải là nam hoặc nữ'
      })
    }

    // Check if phone number already exists
    const existingPatient = await db
      .select()
      .from(patients)
      .where(eq(patients.phone, phone))
      .limit(1)

    if (existingPatient.length > 0) {
      return res.status(409).json({
        error: 'Patient already exists',
        message: 'Số điện thoại này đã được đăng ký cho bệnh nhân khác'
      })
    }

    const newPatient = await db
      .insert(patients)
      .values({
        name,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        parentName,
        phone,
        email: email || null,
        address: address || null,
        medicalHistory: medicalHistory || null,
        notes: notes || null
      })
      .returning()

    res.status(201).json({
      message: 'Tạo hồ sơ bệnh nhân thành công',
      data: newPatient[0]
    })
  } catch (error) {
    console.error('Create patient error:', error)
    res.status(500).json({
      error: 'Failed to create patient',
      message: 'Không thể tạo hồ sơ bệnh nhân'
    })
  }
})

// Update patient
router.put('/:id', async (req, res) => {
  try {
    const {
      name,
      dateOfBirth,
      gender,
      parentName,
      phone,
      email,
      address,
      medicalHistory,
      notes
    } = req.body

    // Validation
    if (!name || !dateOfBirth || !gender || !parentName || !phone) {
      return res.status(422).json({
        error: 'Validation Error',
        message: 'Tên, ngày sinh, giới tính, tên phụ huynh và số điện thoại là bắt buộc'
      })
    }

    // Check if patient exists
    const existingPatient = await db
      .select()
      .from(patients)
      .where(eq(patients.id, req.params.id))
      .limit(1)

    if (existingPatient.length === 0) {
      return res.status(404).json({
        error: 'Patient not found',
        message: 'Không tìm thấy bệnh nhân'
      })
    }

    // Check if phone number is used by another patient
    const phoneCheck = await db
      .select()
      .from(patients)
      .where(and(
        eq(patients.phone, phone),
        eq(patients.id, '!=', req.params.id)
      ))
      .limit(1)

    if (phoneCheck.length > 0) {
      return res.status(409).json({
        error: 'Phone already exists',
        message: 'Số điện thoại này đã được đăng ký cho bệnh nhân khác'
      })
    }

    const updatedPatient = await db
      .update(patients)
      .set({
        name,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        parentName,
        phone,
        email: email || null,
        address: address || null,
        medicalHistory: medicalHistory || null,
        notes: notes || null,
        updatedAt: new Date()
      })
      .where(eq(patients.id, req.params.id))
      .returning()

    res.json({
      message: 'Cập nhật thông tin bệnh nhân thành công',
      data: updatedPatient[0]
    })
  } catch (error) {
    console.error('Update patient error:', error)
    res.status(500).json({
      error: 'Failed to update patient',
      message: 'Không thể cập nhật thông tin bệnh nhân'
    })
  }
})

// Delete patient
router.delete('/:id', async (req, res) => {
  try {
    // Check if patient exists
    const existingPatient = await db
      .select()
      .from(patients)
      .where(eq(patients.id, req.params.id))
      .limit(1)

    if (existingPatient.length === 0) {
      return res.status(404).json({
        error: 'Patient not found',
        message: 'Không tìm thấy bệnh nhân'
      })
    }

    // TODO: Check if patient has related records (appointments, medical records, etc.)
    // For now, we'll allow deletion

    await db
      .delete(patients)
      .where(eq(patients.id, req.params.id))

    res.json({
      message: 'Xóa bệnh nhân thành công'
    })
  } catch (error) {
    console.error('Delete patient error:', error)
    res.status(500).json({
      error: 'Failed to delete patient',
      message: 'Không thể xóa bệnh nhân'
    })
  }
})

// Search patients (alternative endpoint)
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query

    if (!q || q.trim().length < 2) {
      return res.json({ data: [] })
    }

    const results = await db
      .select()
      .from(patients)
      .where(
        or(
          like(patients.name, `%${q}%`),
          like(patients.parentName, `%${q}%`),
          like(patients.phone, `%${q}%`),
          like(patients.email, `%${q}%`)
        )
      )
      .orderBy(patients.name)
      .limit(20)

    res.json({ data: results })
  } catch (error) {
    console.error('Search patients error:', error)
    res.status(500).json({
      error: 'Failed to search patients',
      message: 'Không thể tìm kiếm bệnh nhân'
    })
  }
})

module.exports = router
