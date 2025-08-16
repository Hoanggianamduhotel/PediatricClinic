const express = require('express')
const { drizzle } = require('drizzle-orm/postgres-js')
const { eq, and, like, or, desc } = require('drizzle-orm')
const postgres = require('postgres')
const { staff, users } = require('../db/schema')
const { authenticateToken, requireRole } = require('../middleware/auth')

const router = express.Router()
const client = postgres(process.env.DATABASE_URL)
const db = drizzle(client)

// Apply authentication to all routes
router.use(authenticateToken)

// Get all staff with filtering
router.get('/', async (req, res) => {
  try {
    const { 
      role,
      status = 'active',
      search,
      page = 1,
      limit = 50
    } = req.query

    const offset = (parseInt(page) - 1) * parseInt(limit)
    let query = db.select().from(staff)

    // Build where conditions
    const conditions = []

    if (role) {
      conditions.push(eq(staff.role, role))
    }

    if (status) {
      conditions.push(eq(staff.status, status))
    }

    if (search) {
      conditions.push(
        or(
          like(staff.name, `%${search}%`),
          like(staff.email, `%${search}%`),
          like(staff.phone, `%${search}%`),
          like(staff.specialization, `%${search}%`)
        )
      )
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions))
    }

    // Apply sorting
    query = query.orderBy(staff.name)

    // Apply pagination
    const results = await query.limit(parseInt(limit)).offset(offset)

    res.json({ data: results })
  } catch (error) {
    console.error('Get staff error:', error)
    res.status(500).json({
      error: 'Failed to fetch staff',
      message: 'Không thể tải danh sách nhân viên'
    })
  }
})

// Get staff member by ID
router.get('/:id', async (req, res) => {
  try {
    const staffMember = await db
      .select()
      .from(staff)
      .where(eq(staff.id, req.params.id))
      .limit(1)

    if (staffMember.length === 0) {
      return res.status(404).json({
        error: 'Staff member not found',
        message: 'Không tìm thấy nhân viên'
      })
    }

    res.json({ data: staffMember[0] })
  } catch (error) {
    console.error('Get staff member error:', error)
    res.status(500).json({
      error: 'Failed to fetch staff member',
      message: 'Không thể tải thông tin nhân viên'
    })
  }
})

// Create new staff member
router.post('/', requireRole(['admin', 'doctor']), async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      role,
      specialization,
      licenseNumber,
      hireDate,
      salary,
      status = 'active'
    } = req.body

    // Validation
    if (!name || !email || !phone || !role || !hireDate) {
      return res.status(422).json({
        error: 'Validation Error',
        message: 'Tên, email, số điện thoại, vai trò và ngày bắt đầu làm việc là bắt buộc'
      })
    }

    const validRoles = ['doctor', 'nurse', 'receptionist', 'admin']
    if (!validRoles.includes(role)) {
      return res.status(422).json({
        error: 'Validation Error',
        message: 'Vai trò không hợp lệ'
      })
    }

    // Check if email already exists
    const existingStaff = await db
      .select()
      .from(staff)
      .where(eq(staff.email, email))
      .limit(1)

    if (existingStaff.length > 0) {
      return res.status(409).json({
        error: 'Email already exists',
        message: 'Email này đã được sử dụng'
      })
    }

    const newStaffMember = await db
      .insert(staff)
      .values({
        name,
        email,
        phone,
        role,
        specialization: specialization || null,
        licenseNumber: licenseNumber || null,
        hireDate: new Date(hireDate),
        salary: salary ? parseFloat(salary) : null,
        status
      })
      .returning()

    res.status(201).json({
      message: 'Tạo nhân viên mới thành công',
      data: newStaffMember[0]
    })
  } catch (error) {
    console.error('Create staff member error:', error)
    res.status(500).json({
      error: 'Failed to create staff member',
      message: 'Không thể tạo nhân viên mới'
    })
  }
})

// Update staff member
router.put('/:id', requireRole(['admin', 'doctor']), async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      role,
      specialization,
      licenseNumber,
      hireDate,
      salary,
      status
    } = req.body

    // Check if staff member exists
    const existingStaff = await db
      .select()
      .from(staff)
      .where(eq(staff.id, req.params.id))
      .limit(1)

    if (existingStaff.length === 0) {
      return res.status(404).json({
        error: 'Staff member not found',
        message: 'Không tìm thấy nhân viên'
      })
    }

    // Check if email is used by another staff member
    if (email) {
      const emailCheck = await db
        .select()
        .from(staff)
        .where(and(
          eq(staff.email, email),
          eq(staff.id, '!=', req.params.id)
        ))
        .limit(1)

      if (emailCheck.length > 0) {
        return res.status(409).json({
          error: 'Email already exists',
          message: 'Email này đã được sử dụng bởi nhân viên khác'
        })
      }
    }

    const updateData = {
      updatedAt: new Date()
    }

    if (name) updateData.name = name
    if (email) updateData.email = email
    if (phone) updateData.phone = phone
    if (role) updateData.role = role
    if (specialization !== undefined) updateData.specialization = specialization || null
    if (licenseNumber !== undefined) updateData.licenseNumber = licenseNumber || null
    if (hireDate) updateData.hireDate = new Date(hireDate)
    if (salary !== undefined) updateData.salary = salary ? parseFloat(salary) : null
    if (status) updateData.status = status

    const updatedStaff = await db
      .update(staff)
      .set(updateData)
      .where(eq(staff.id, req.params.id))
      .returning()

    res.json({
      message: 'Cập nhật thông tin nhân viên thành công',
      data: updatedStaff[0]
    })
  } catch (error) {
    console.error('Update staff member error:', error)
    res.status(500).json({
      error: 'Failed to update staff member',
      message: 'Không thể cập nhật thông tin nhân viên'
    })
  }
})

// Delete staff member
router.delete('/:id', requireRole(['admin']), async (req, res) => {
  try {
    const existingStaff = await db
      .select()
      .from(staff)
      .where(eq(staff.id, req.params.id))
      .limit(1)

    if (existingStaff.length === 0) {
      return res.status(404).json({
        error: 'Staff member not found',
        message: 'Không tìm thấy nhân viên'
      })
    }

    // TODO: Check if staff member has related records (appointments, medical records, etc.)
    // For now, we'll soft delete by setting status to terminated

    const updatedStaff = await db
      .update(staff)
      .set({
        status: 'terminated',
        updatedAt: new Date()
      })
      .where(eq(staff.id, req.params.id))
      .returning()

    res.json({
      message: 'Xóa nhân viên thành công',
      data: updatedStaff[0]
    })
  } catch (error) {
    console.error('Delete staff member error:', error)
    res.status(500).json({
      error: 'Failed to delete staff member',
      message: 'Không thể xóa nhân viên'
    })
  }
})

// Get doctors only (for appointments)
router.get('/doctors', async (req, res) => {
  try {
    const doctors = await db
      .select({
        id: staff.id,
        name: staff.name,
        specialization: staff.specialization,
        licenseNumber: staff.licenseNumber,
        email: staff.email,
        phone: staff.phone
      })
      .from(staff)
      .where(and(
        eq(staff.role, 'doctor'),
        eq(staff.status, 'active')
      ))
      .orderBy(staff.name)

    res.json({ data: doctors })
  } catch (error) {
    console.error('Get doctors error:', error)
    res.status(500).json({
      error: 'Failed to fetch doctors',
      message: 'Không thể tải danh sách bác sĩ'
    })
  }
})

// Get staff statistics
router.get('/stats', requireRole(['admin', 'doctor']), async (req, res) => {
  try {
    // Count by role
    const roleStats = await db
      .select({
        role: staff.role,
        count: 'count(*)'
      })
      .from(staff)
      .where(eq(staff.status, 'active'))
      .groupBy(staff.role)

    // Count by status
    const statusStats = await db
      .select({
        status: staff.status,
        count: 'count(*)'
      })
      .from(staff)
      .groupBy(staff.status)

    res.json({
      data: {
        byRole: roleStats,
        byStatus: statusStats
      }
    })
  } catch (error) {
    console.error('Get staff stats error:', error)
    res.status(500).json({
      error: 'Failed to fetch staff statistics',
      message: 'Không thể tải thống kê nhân viên'
    })
  }
})

module.exports = router
