const express = require('express')
const { drizzle } = require('drizzle-orm/postgres-js')
const { eq, and, gte, lte, like, or, desc } = require('drizzle-orm')
const postgres = require('postgres')
const { medicalRecords, patients, staff, appointments } = require('../db/schema')
const { authenticateToken } = require('../middleware/auth')

const router = express.Router()
const client = postgres(process.env.DATABASE_URL)
const db = drizzle(client)

// Apply authentication to all routes
router.use(authenticateToken)

// Get medical records with filtering
router.get('/', async (req, res) => {
  try {
    const { 
      search,
      patientId,
      doctorId,
      dateFrom,
      dateTo,
      status,
      page = 1,
      limit = 50
    } = req.query

    const offset = (parseInt(page) - 1) * parseInt(limit)

    // Build query with joins
    let query = db
      .select({
        id: medicalRecords.id,
        patientId: medicalRecords.patientId,
        doctorId: medicalRecords.doctorId,
        appointmentId: medicalRecords.appointmentId,
        visitDate: medicalRecords.visitDate,
        weight: medicalRecords.weight,
        height: medicalRecords.height,
        temperature: medicalRecords.temperature,
        bloodPressure: medicalRecords.bloodPressure,
        heartRate: medicalRecords.heartRate,
        symptoms: medicalRecords.symptoms,
        examination: medicalRecords.examination,
        diagnosis: medicalRecords.diagnosis,
        treatment: medicalRecords.treatment,
        prescription: medicalRecords.prescription,
        followUpDate: medicalRecords.followUpDate,
        notes: medicalRecords.notes,
        status: medicalRecords.status,
        createdAt: medicalRecords.createdAt,
        updatedAt: medicalRecords.updatedAt,
        patientName: patients.name,
        patientAge: patients.dateOfBirth,
        patientPhone: patients.phone,
        doctorName: staff.name,
        doctorSpecialization: staff.specialization
      })
      .from(medicalRecords)
      .leftJoin(patients, eq(medicalRecords.patientId, patients.id))
      .leftJoin(staff, eq(medicalRecords.doctorId, staff.id))

    // Build where conditions
    const conditions = []

    if (search) {
      conditions.push(
        or(
          like(patients.name, `%${search}%`),
          like(medicalRecords.diagnosis, `%${search}%`),
          like(medicalRecords.symptoms, `%${search}%`)
        )
      )
    }

    if (patientId) {
      conditions.push(eq(medicalRecords.patientId, patientId))
    }

    if (doctorId) {
      conditions.push(eq(medicalRecords.doctorId, doctorId))
    }

    if (dateFrom) {
      conditions.push(gte(medicalRecords.visitDate, dateFrom))
    }

    if (dateTo) {
      conditions.push(lte(medicalRecords.visitDate, dateTo))
    }

    if (status) {
      conditions.push(eq(medicalRecords.status, status))
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions))
    }

    // Apply sorting
    query = query.orderBy(desc(medicalRecords.visitDate))

    // Apply pagination
    const results = await query.limit(parseInt(limit)).offset(offset)

    res.json({ data: results })
  } catch (error) {
    console.error('Get medical records error:', error)
    res.status(500).json({
      error: 'Failed to fetch medical records',
      message: 'Không thể tải danh sách hồ sơ bệnh án'
    })
  }
})

// Get medical record by ID
router.get('/:id', async (req, res) => {
  try {
    const record = await db
      .select({
        id: medicalRecords.id,
        patientId: medicalRecords.patientId,
        doctorId: medicalRecords.doctorId,
        appointmentId: medicalRecords.appointmentId,
        visitDate: medicalRecords.visitDate,
        weight: medicalRecords.weight,
        height: medicalRecords.height,
        temperature: medicalRecords.temperature,
        bloodPressure: medicalRecords.bloodPressure,
        heartRate: medicalRecords.heartRate,
        symptoms: medicalRecords.symptoms,
        examination: medicalRecords.examination,
        diagnosis: medicalRecords.diagnosis,
        treatment: medicalRecords.treatment,
        prescription: medicalRecords.prescription,
        followUpDate: medicalRecords.followUpDate,
        notes: medicalRecords.notes,
        status: medicalRecords.status,
        createdAt: medicalRecords.createdAt,
        updatedAt: medicalRecords.updatedAt,
        patientName: patients.name,
        patientDateOfBirth: patients.dateOfBirth,
        patientGender: patients.gender,
        patientPhone: patients.phone,
        patientEmail: patients.email,
        patientMedicalHistory: patients.medicalHistory,
        doctorName: staff.name,
        doctorSpecialization: staff.specialization
      })
      .from(medicalRecords)
      .leftJoin(patients, eq(medicalRecords.patientId, patients.id))
      .leftJoin(staff, eq(medicalRecords.doctorId, staff.id))
      .where(eq(medicalRecords.id, req.params.id))
      .limit(1)

    if (record.length === 0) {
      return res.status(404).json({
        error: 'Medical record not found',
        message: 'Không tìm thấy hồ sơ bệnh án'
      })
    }

    res.json({ data: record[0] })
  } catch (error) {
    console.error('Get medical record error:', error)
    res.status(500).json({
      error: 'Failed to fetch medical record',
      message: 'Không thể tải thông tin hồ sơ bệnh án'
    })
  }
})

// Create new medical record
router.post('/', async (req, res) => {
  try {
    const {
      patientId,
      doctorId,
      appointmentId,
      visitDate,
      weight,
      height,
      temperature,
      bloodPressure,
      heartRate,
      symptoms,
      examination,
      diagnosis,
      treatment,
      prescription,
      followUpDate,
      notes,
      status = 'draft'
    } = req.body

    // Validation
    if (!patientId || !doctorId || !visitDate || !symptoms || !diagnosis) {
      return res.status(422).json({
        error: 'Validation Error',
        message: 'Bệnh nhân, bác sĩ, ngày khám, triệu chứng và chẩn đoán là bắt buộc'
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

    const newRecord = await db
      .insert(medicalRecords)
      .values({
        patientId,
        doctorId,
        appointmentId: appointmentId || null,
        visitDate: new Date(visitDate),
        weight: weight ? parseFloat(weight) : null,
        height: height ? parseFloat(height) : null,
        temperature: temperature ? parseFloat(temperature) : null,
        bloodPressure: bloodPressure || null,
        heartRate: heartRate ? parseInt(heartRate) : null,
        symptoms,
        examination: examination || null,
        diagnosis,
        treatment: treatment || null,
        prescription: prescription || null,
        followUpDate: followUpDate ? new Date(followUpDate) : null,
        notes: notes || null,
        status
      })
      .returning()

    // Update patient's last visit
    await db
      .update(patients)
      .set({ lastVisit: new Date() })
      .where(eq(patients.id, patientId))

    // If linked to appointment, mark as completed
    if (appointmentId) {
      await db
        .update(appointments)
        .set({ 
          status: 'completed',
          completedAt: new Date()
        })
        .where(eq(appointments.id, appointmentId))
    }

    res.status(201).json({
      message: 'Tạo hồ sơ bệnh án thành công',
      data: newRecord[0]
    })
  } catch (error) {
    console.error('Create medical record error:', error)
    res.status(500).json({
      error: 'Failed to create medical record',
      message: 'Không thể tạo hồ sơ bệnh án'
    })
  }
})

// Update medical record
router.put('/:id', async (req, res) => {
  try {
    const {
      patientId,
      doctorId,
      appointmentId,
      visitDate,
      weight,
      height,
      temperature,
      bloodPressure,
      heartRate,
      symptoms,
      examination,
      diagnosis,
      treatment,
      prescription,
      followUpDate,
      notes,
      status
    } = req.body

    // Check if record exists
    const existingRecord = await db
      .select()
      .from(medicalRecords)
      .where(eq(medicalRecords.id, req.params.id))
      .limit(1)

    if (existingRecord.length === 0) {
      return res.status(404).json({
        error: 'Medical record not found',
        message: 'Không tìm thấy hồ sơ bệnh án'
      })
    }

    const updateData = {
      updatedAt: new Date()
    }

    if (patientId) updateData.patientId = patientId
    if (doctorId) updateData.doctorId = doctorId
    if (appointmentId !== undefined) updateData.appointmentId = appointmentId
    if (visitDate) updateData.visitDate = new Date(visitDate)
    if (weight !== undefined) updateData.weight = weight ? parseFloat(weight) : null
    if (height !== undefined) updateData.height = height ? parseFloat(height) : null
    if (temperature !== undefined) updateData.temperature = temperature ? parseFloat(temperature) : null
    if (bloodPressure !== undefined) updateData.bloodPressure = bloodPressure || null
    if (heartRate !== undefined) updateData.heartRate = heartRate ? parseInt(heartRate) : null
    if (symptoms) updateData.symptoms = symptoms
    if (examination !== undefined) updateData.examination = examination || null
    if (diagnosis) updateData.diagnosis = diagnosis
    if (treatment !== undefined) updateData.treatment = treatment || null
    if (prescription !== undefined) updateData.prescription = prescription || null
    if (followUpDate !== undefined) updateData.followUpDate = followUpDate ? new Date(followUpDate) : null
    if (notes !== undefined) updateData.notes = notes || null
    if (status) updateData.status = status

    const updatedRecord = await db
      .update(medicalRecords)
      .set(updateData)
      .where(eq(medicalRecords.id, req.params.id))
      .returning()

    res.json({
      message: 'Cập nhật hồ sơ bệnh án thành công',
      data: updatedRecord[0]
    })
  } catch (error) {
    console.error('Update medical record error:', error)
    res.status(500).json({
      error: 'Failed to update medical record',
      message: 'Không thể cập nhật hồ sơ bệnh án'
    })
  }
})

// Delete medical record
router.delete('/:id', async (req, res) => {
  try {
    const existingRecord = await db
      .select()
      .from(medicalRecords)
      .where(eq(medicalRecords.id, req.params.id))
      .limit(1)

    if (existingRecord.length === 0) {
      return res.status(404).json({
        error: 'Medical record not found',
        message: 'Không tìm thấy hồ sơ bệnh án'
      })
    }

    await db
      .delete(medicalRecords)
      .where(eq(medicalRecords.id, req.params.id))

    res.json({
      message: 'Xóa hồ sơ bệnh án thành công'
    })
  } catch (error) {
    console.error('Delete medical record error:', error)
    res.status(500).json({
      error: 'Failed to delete medical record',
      message: 'Không thể xóa hồ sơ bệnh án'
    })
  }
})

// Get patient's medical history
router.get('/patient/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params
    const { limit = 10, page = 1 } = req.query

    const offset = (parseInt(page) - 1) * parseInt(limit)

    const records = await db
      .select({
        id: medicalRecords.id,
        visitDate: medicalRecords.visitDate,
        diagnosis: medicalRecords.diagnosis,
        treatment: medicalRecords.treatment,
        prescription: medicalRecords.prescription,
        followUpDate: medicalRecords.followUpDate,
        status: medicalRecords.status,
        doctorName: staff.name,
        doctorSpecialization: staff.specialization
      })
      .from(medicalRecords)
      .leftJoin(staff, eq(medicalRecords.doctorId, staff.id))
      .where(eq(medicalRecords.patientId, patientId))
      .orderBy(desc(medicalRecords.visitDate))
      .limit(parseInt(limit))
      .offset(offset)

    res.json({ data: records })
  } catch (error) {
    console.error('Get patient medical history error:', error)
    res.status(500).json({
      error: 'Failed to fetch medical history',
      message: 'Không thể tải lịch sử khám bệnh'
    })
  }
})

module.exports = router
