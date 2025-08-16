const express = require('express')
const { drizzle } = require('drizzle-orm/postgres-js')
const { eq, and, gte, lte, desc, asc } = require('drizzle-orm')
const postgres = require('postgres')
const { appointments, patients, staff } = require('../db/schema')
const { authenticateToken } = require('../middleware/auth')

const router = express.Router()
const client = postgres(process.env.DATABASE_URL)
const db = drizzle(client)

// Apply authentication to all routes
router.use(authenticateToken)

// Get appointments with filtering
router.get('/', async (req, res) => {
  try {
    const { 
      date, 
      doctorId, 
      patientId, 
      status, 
      page = 1, 
      limit = 50 
    } = req.query

    const offset = (parseInt(page) - 1) * parseInt(limit)

    // Build query with joins
    let query = db
      .select({
        id: appointments.id,
        patientId: appointments.patientId,
        doctorId: appointments.doctorId,
        date: appointments.date,
        time: appointments.time,
        duration: appointments.duration,
        reason: appointments.reason,
        notes: appointments.notes,
        status: appointments.status,
        checkedInAt: appointments.checkedInAt,
        completedAt: appointments.completedAt,
        createdAt: appointments.createdAt,
        updatedAt: appointments.updatedAt,
        patientName: patients.name,
        patientPhone: patients.phone,
        doctorName: staff.name,
        doctorSpecialization: staff.specialization
      })
      .from(appointments)
      .leftJoin(patients, eq(appointments.patientId, patients.id))
      .leftJoin(staff, eq(appointments.doctorId, staff.id))

    // Build where conditions
    const conditions = []

    if (date) {
      conditions.push(eq(appointments.date, date))
    }

    if (doctorId) {
      conditions.push(eq(appointments.doctorId, doctorId))
    }

    if (patientId) {
      conditions.push(eq(appointments.patientId, patientId))
    }

    if (status) {
      conditions.push(eq(appointments.status, status))
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions))
    }

    // Apply sorting (by date and time)
    query = query.orderBy(appointments.date, appointments.time)

    // Apply pagination
    const results = await query.limit(parseInt(limit)).offset(offset)

    res.json({ data: results })
  } catch (error) {
    console.error('Get appointments error:', error)
    res.status(500).json({
      error: 'Failed to fetch appointments',
      message: 'Không thể tải danh sách lịch hẹn'
    })
  }
})

// Check appointment availability
router.get('/check-availability', async (req, res) => {
  try {
    const { date, time, doctorId, excludeId } = req.query

    if (!date || !time || !doctorId) {
      return res.status(422).json({
        error: 'Validation Error',
        message: 'Ngày, giờ và bác sĩ là bắt buộc'
      })
    }

    let query = db
      .select()
      .from(appointments)
      .where(and(
        eq(appointments.date, date),
        eq(appointments.time, time),
        eq(appointments.doctorId, doctorId),
        eq(appointments.status, '!=', 'cancelled')
      ))

    if (excludeId) {
      query = query.where(and(
        eq(appointments.date, date),
        eq(appointments.time, time),
        eq(appointments.doctorId, doctorId),
        eq(appointments.status, '!=', 'cancelled'),
        eq(appointments.id, '!=', excludeId)
      ))
    }

    const conflicting = await query.limit(1)

    res.json({
      available: conflicting.length === 0,
      conflicting: conflicting[0] || null
    })
  } catch (error) {
    console.error('Check availability error:', error)
    res.status(500).json({
      error: 'Failed to check availability',
      message: 'Không thể kiểm tra tình trạng lịch hẹn'
    })
  }
})

// Get appointment by ID
router.get('/:id', async (req, res) => {
  try {
    const appointment = await db
      .select({
        id: appointments.id,
        patientId: appointments.patientId,
        doctorId: appointments.doctorId,
        date: appointments.date,
        time: appointments.time,
        duration: appointments.duration,
        reason: appointments.reason,
        notes: appointments.notes,
        status: appointments.status,
        checkedInAt: appointments.checkedInAt,
        completedAt: appointments.completedAt,
        createdAt: appointments.createdAt,
        updatedAt: appointments.updatedAt,
        patientName: patients.name,
        patientPhone: patients.phone,
        patientEmail: patients.email,
        doctorName: staff.name,
        doctorSpecialization: staff.specialization
      })
      .from(appointments)
      .leftJoin(patients, eq(appointments.patientId, patients.id))
      .leftJoin(staff, eq(appointments.doctorId, staff.id))
      .where(eq(appointments.id, req.params.id))
      .limit(1)

    if (appointment.length === 0) {
      return res.status(404).json({
        error: 'Appointment not found',
        message: 'Không tìm thấy lịch hẹn'
      })
    }

    res.json({ data: appointment[0] })
  } catch (error) {
    console.error('Get appointment error:', error)
    res.status(500).json({
      error: 'Failed to fetch appointment',
      message: 'Không thể tải thông tin lịch hẹn'
    })
  }
})

// Create new appointment
router.post('/', async (req, res) => {
  try {
    const {
      patientId,
      doctorId,
      date,
      time,
      duration = 30,
      reason,
      notes,
      status = 'scheduled'
    } = req.body

    // Validation
    if (!patientId || !doctorId || !date || !time || !reason) {
      return res.status(422).json({
        error: 'Validation Error',
        message: 'Bệnh nhân, bác sĩ, ngày, giờ và lý do khám là bắt buộc'
      })
    }

    // Check if patient exists
    const patient = await db
      .select()
      .from(patients)
      .where(eq(patients.id, patientId))
      .limit(1)

    if (patient.length === 0) {
      return res.status(404).json({
        error: 'Patient not found',
        message: 'Không tìm thấy bệnh nhân'
      })
    }

    // Check if doctor exists
    const doctor = await db
      .select()
      .from(staff)
      .where(and(eq(staff.id, doctorId), eq(staff.role, 'doctor')))
      .limit(1)

    if (doctor.length === 0) {
      return res.status(404).json({
        error: 'Doctor not found',
        message: 'Không tìm thấy bác sĩ'
      })
    }

    // Check for conflicts
    const conflicting = await db
      .select()
      .from(appointments)
      .where(and(
        eq(appointments.date, date),
        eq(appointments.time, time),
        eq(appointments.doctorId, doctorId),
        eq(appointments.status, '!=', 'cancelled')
      ))
      .limit(1)

    if (conflicting.length > 0) {
      return res.status(409).json({
        error: 'Time slot conflict',
        message: 'Thời gian này đã có lịch hẹn khác'
      })
    }

    const newAppointment = await db
      .insert(appointments)
      .values({
        patientId,
        doctorId,
        date: new Date(date),
        time,
        duration: parseInt(duration),
        reason,
        notes: notes || null,
        status
      })
      .returning()

    // Update patient's last visit
    await db
      .update(patients)
      .set({ lastVisit: new Date() })
      .where(eq(patients.id, patientId))

    res.status(201).json({
      message: 'Tạo lịch hẹn thành công',
      data: newAppointment[0]
    })
  } catch (error) {
    console.error('Create appointment error:', error)
    res.status(500).json({
      error: 'Failed to create appointment',
      message: 'Không thể tạo lịch hẹn'
    })
  }
})

// Update appointment
router.put('/:id', async (req, res) => {
  try {
    const {
      patientId,
      doctorId,
      date,
      time,
      duration,
      reason,
      notes,
      status
    } = req.body

    // Check if appointment exists
    const existingAppointment = await db
      .select()
      .from(appointments)
      .where(eq(appointments.id, req.params.id))
      .limit(1)

    if (existingAppointment.length === 0) {
      return res.status(404).json({
        error: 'Appointment not found',
        message: 'Không tìm thấy lịch hẹn'
      })
    }

    // If changing time/date/doctor, check for conflicts
    if (date || time || doctorId) {
      const checkDate = date || existingAppointment[0].date
      const checkTime = time || existingAppointment[0].time
      const checkDoctorId = doctorId || existingAppointment[0].doctorId

      const conflicting = await db
        .select()
        .from(appointments)
        .where(and(
          eq(appointments.date, checkDate),
          eq(appointments.time, checkTime),
          eq(appointments.doctorId, checkDoctorId),
          eq(appointments.status, '!=', 'cancelled'),
          eq(appointments.id, '!=', req.params.id)
        ))
        .limit(1)

      if (conflicting.length > 0) {
        return res.status(409).json({
          error: 'Time slot conflict',
          message: 'Thời gian này đã có lịch hẹn khác'
        })
      }
    }

    const updateData = {
      updatedAt: new Date()
    }

    if (patientId) updateData.patientId = patientId
    if (doctorId) updateData.doctorId = doctorId
    if (date) updateData.date = new Date(date)
    if (time) updateData.time = time
    if (duration) updateData.duration = parseInt(duration)
    if (reason) updateData.reason = reason
    if (notes !== undefined) updateData.notes = notes
    if (status) updateData.status = status

    const updatedAppointment = await db
      .update(appointments)
      .set(updateData)
      .where(eq(appointments.id, req.params.id))
      .returning()

    res.json({
      message: 'Cập nhật lịch hẹn thành công',
      data: updatedAppointment[0]
    })
  } catch (error) {
    console.error('Update appointment error:', error)
    res.status(500).json({
      error: 'Failed to update appointment',
      message: 'Không thể cập nhật lịch hẹn'
    })
  }
})

// Check in patient
router.patch('/:id/checkin', async (req, res) => {
  try {
    // Check if appointment exists
    const existingAppointment = await db
      .select()
      .from(appointments)
      .where(eq(appointments.id, req.params.id))
      .limit(1)

    if (existingAppointment.length === 0) {
      return res.status(404).json({
        error: 'Appointment not found',
        message: 'Không tìm thấy lịch hẹn'
      })
    }

    if (existingAppointment[0].status === 'checked-in') {
      return res.status(400).json({
        error: 'Already checked in',
        message: 'Bệnh nhân đã check-in rồi'
      })
    }

    const updatedAppointment = await db
      .update(appointments)
      .set({
        status: 'checked-in',
        checkedInAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(appointments.id, req.params.id))
      .returning()

    res.json({
      message: 'Check-in thành công',
      data: updatedAppointment[0]
    })
  } catch (error) {
    console.error('Check in error:', error)
    res.status(500).json({
      error: 'Failed to check in',
      message: 'Không thể check-in'
    })
  }
})

// Complete appointment
router.patch('/:id/complete', async (req, res) => {
  try {
    const existingAppointment = await db
      .select()
      .from(appointments)
      .where(eq(appointments.id, req.params.id))
      .limit(1)

    if (existingAppointment.length === 0) {
      return res.status(404).json({
        error: 'Appointment not found',
        message: 'Không tìm thấy lịch hẹn'
      })
    }

    const updatedAppointment = await db
      .update(appointments)
      .set({
        status: 'completed',
        completedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(appointments.id, req.params.id))
      .returning()

    res.json({
      message: 'Hoàn thành lịch hẹn',
      data: updatedAppointment[0]
    })
  } catch (error) {
    console.error('Complete appointment error:', error)
    res.status(500).json({
      error: 'Failed to complete appointment',
      message: 'Không thể hoàn thành lịch hẹn'
    })
  }
})

// Cancel appointment
router.patch('/:id/cancel', async (req, res) => {
  try {
    const { reason } = req.body

    const existingAppointment = await db
      .select()
      .from(appointments)
      .where(eq(appointments.id, req.params.id))
      .limit(1)

    if (existingAppointment.length === 0) {
      return res.status(404).json({
        error: 'Appointment not found',
        message: 'Không tìm thấy lịch hẹn'
      })
    }

    const updatedAppointment = await db
      .update(appointments)
      .set({
        status: 'cancelled',
        notes: reason ? `Lý do hủy: ${reason}` : existingAppointment[0].notes,
        updatedAt: new Date()
      })
      .where(eq(appointments.id, req.params.id))
      .returning()

    res.json({
      message: 'Hủy lịch hẹn thành công',
      data: updatedAppointment[0]
    })
  } catch (error) {
    console.error('Cancel appointment error:', error)
    res.status(500).json({
      error: 'Failed to cancel appointment',
      message: 'Không thể hủy lịch hẹn'
    })
  }
})

// Delete appointment
router.delete('/:id', async (req, res) => {
  try {
    const existingAppointment = await db
      .select()
      .from(appointments)
      .where(eq(appointments.id, req.params.id))
      .limit(1)

    if (existingAppointment.length === 0) {
      return res.status(404).json({
        error: 'Appointment not found',
        message: 'Không tìm thấy lịch hẹn'
      })
    }

    await db
      .delete(appointments)
      .where(eq(appointments.id, req.params.id))

    res.json({
      message: 'Xóa lịch hẹn thành công'
    })
  } catch (error) {
    console.error('Delete appointment error:', error)
    res.status(500).json({
      error: 'Failed to delete appointment',
      message: 'Không thể xóa lịch hẹn'
    })
  }
})

module.exports = router
