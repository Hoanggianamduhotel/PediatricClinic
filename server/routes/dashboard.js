const express = require('express')
const { drizzle } = require('drizzle-orm/postgres-js')
const { eq, and, gte, lte, count, sum } = require('drizzle-orm')
const postgres = require('postgres')
const { patients, appointments, medicalRecords, invoices, staff } = require('../db/schema')
const { authenticateToken } = require('../middleware/auth')

const router = express.Router()
const client = postgres(process.env.DATABASE_URL)
const db = drizzle(client)

// Apply authentication to all routes
router.use(authenticateToken)

// Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const today = new Date()
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999)

    // Today's patients (appointments)
    const todayAppointments = await db
      .select({ count: count() })
      .from(appointments)
      .where(eq(appointments.date, startOfToday.toISOString().split('T')[0]))

    // Waiting patients (checked-in status)
    const waitingPatients = await db
      .select({ count: count() })
      .from(appointments)
      .where(and(
        eq(appointments.date, startOfToday.toISOString().split('T')[0]),
        eq(appointments.status, 'checked-in')
      ))

    // Today's revenue
    const todayRevenue = await db
      .select({ total: sum(invoices.paidAmount) })
      .from(invoices)
      .where(and(
        eq(invoices.status, 'paid'),
        gte(invoices.paymentDate, startOfToday),
        lte(invoices.paymentDate, endOfToday)
      ))

    // Total patients count
    const totalPatients = await db
      .select({ count: count() })
      .from(patients)

    res.json({
      data: {
        todayPatients: parseInt(todayAppointments[0]?.count || 0),
        todayAppointments: parseInt(todayAppointments[0]?.count || 0),
        waitingPatients: parseInt(waitingPatients[0]?.count || 0),
        todayRevenue: parseFloat(todayRevenue[0]?.total || 0),
        totalPatients: parseInt(totalPatients[0]?.count || 0)
      }
    })
  } catch (error) {
    console.error('Get dashboard stats error:', error)
    res.status(500).json({
      error: 'Failed to fetch dashboard statistics',
      message: 'Không thể tải thống kê tổng quan'
    })
  }
})

// Get today's quick stats for navigation
router.get('/today-stats', async (req, res) => {
  try {
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]

    // Today's appointments
    const todayAppointments = await db
      .select({ count: count() })
      .from(appointments)
      .where(eq(appointments.date, todayStr))

    // Waiting patients
    const waitingPatients = await db
      .select({ count: count() })
      .from(appointments)
      .where(and(
        eq(appointments.date, todayStr),
        eq(appointments.status, 'checked-in')
      ))

    res.json({
      data: {
        appointments: parseInt(todayAppointments[0]?.count || 0),
        waiting: parseInt(waitingPatients[0]?.count || 0)
      }
    })
  } catch (error) {
    console.error('Get today stats error:', error)
    res.status(500).json({
      error: 'Failed to fetch today statistics',
      message: 'Không thể tải thống kê hôm nay'
    })
  }
})

// Get monthly statistics
router.get('/monthly-stats', async (req, res) => {
  try {
    const today = new Date()
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999)

    // Monthly appointments
    const monthlyAppointments = await db
      .select({ count: count() })
      .from(appointments)
      .where(and(
        gte(appointments.date, startOfMonth.toISOString().split('T')[0]),
        lte(appointments.date, endOfMonth.toISOString().split('T')[0])
      ))

    // Monthly revenue
    const monthlyRevenue = await db
      .select({ total: sum(invoices.paidAmount) })
      .from(invoices)
      .where(and(
        eq(invoices.status, 'paid'),
        gte(invoices.paymentDate, startOfMonth),
        lte(invoices.paymentDate, endOfMonth)
      ))

    // New patients this month
    const newPatients = await db
      .select({ count: count() })
      .from(patients)
      .where(and(
        gte(patients.createdAt, startOfMonth),
        lte(patients.createdAt, endOfMonth)
      ))

    // Medical records this month
    const monthlyRecords = await db
      .select({ count: count() })
      .from(medicalRecords)
      .where(and(
        gte(medicalRecords.visitDate, startOfMonth.toISOString().split('T')[0]),
        lte(medicalRecords.visitDate, endOfMonth.toISOString().split('T')[0])
      ))

    res.json({
      data: {
        appointments: parseInt(monthlyAppointments[0]?.count || 0),
        revenue: parseFloat(monthlyRevenue[0]?.total || 0),
        newPatients: parseInt(newPatients[0]?.count || 0),
        medicalRecords: parseInt(monthlyRecords[0]?.count || 0)
      }
    })
  } catch (error) {
    console.error('Get monthly stats error:', error)
    res.status(500).json({
      error: 'Failed to fetch monthly statistics',
      message: 'Không thể tải thống kê tháng'
    })
  }
})

// Get appointment statistics by status
router.get('/appointment-stats', async (req, res) => {
  try {
    const { period = 'today' } = req.query
    const today = new Date()
    let startDate, endDate

    switch (period) {
      case 'today':
        startDate = endDate = today.toISOString().split('T')[0]
        break
      case 'week':
        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()))
        const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6))
        startDate = startOfWeek.toISOString().split('T')[0]
        endDate = endOfWeek.toISOString().split('T')[0]
        break
      case 'month':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0]
        break
      default:
        startDate = endDate = new Date().toISOString().split('T')[0]
    }

    const stats = await db
      .select({
        status: appointments.status,
        count: count()
      })
      .from(appointments)
      .where(and(
        gte(appointments.date, startDate),
        lte(appointments.date, endDate)
      ))
      .groupBy(appointments.status)

    res.json({ data: stats })
  } catch (error) {
    console.error('Get appointment stats error:', error)
    res.status(500).json({
      error: 'Failed to fetch appointment statistics',
      message: 'Không thể tải thống kê lịch hẹn'
    })
  }
})

// Get recent activities
router.get('/recent-activities', async (req, res) => {
  try {
    const { limit = 10 } = req.query

    // Recent appointments
    const recentAppointments = await db
      .select({
        id: appointments.id,
        type: 'appointment',
        patientName: patients.name,
        doctorName: staff.name,
        date: appointments.date,
        time: appointments.time,
        status: appointments.status,
        createdAt: appointments.createdAt
      })
      .from(appointments)
      .leftJoin(patients, eq(appointments.patientId, patients.id))
      .leftJoin(staff, eq(appointments.doctorId, staff.id))
      .orderBy(appointments.createdAt)
      .limit(parseInt(limit))

    // Recent medical records
    const recentRecords = await db
      .select({
        id: medicalRecords.id,
        type: 'medical_record',
        patientName: patients.name,
        doctorName: staff.name,
        visitDate: medicalRecords.visitDate,
        diagnosis: medicalRecords.diagnosis,
        createdAt: medicalRecords.createdAt
      })
      .from(medicalRecords)
      .leftJoin(patients, eq(medicalRecords.patientId, patients.id))
      .leftJoin(staff, eq(medicalRecords.doctorId, staff.id))
      .orderBy(medicalRecords.createdAt)
      .limit(parseInt(limit))

    const activities = [
      ...recentAppointments.map(apt => ({
        ...apt,
        message: `Lịch hẹn mới: ${apt.patientName} với ${apt.doctorName}`
      })),
      ...recentRecords.map(record => ({
        ...record,
        message: `Hồ sơ mới: ${record.patientName} - ${record.diagnosis}`
      }))
    ]

    // Sort by createdAt and limit
    activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    res.json({ 
      data: activities.slice(0, parseInt(limit)) 
    })
  } catch (error) {
    console.error('Get recent activities error:', error)
    res.status(500).json({
      error: 'Failed to fetch recent activities',
      message: 'Không thể tải hoạt động gần đây'
    })
  }
})

// Get patient demographics
router.get('/patient-demographics', async (req, res) => {
  try {
    // Age distribution
    const ageGroups = await db
      .select({
        ageGroup: 'CASE ' +
          'WHEN EXTRACT(YEAR FROM AGE(date_of_birth)) < 1 THEN "0-1" ' +
          'WHEN EXTRACT(YEAR FROM AGE(date_of_birth)) < 5 THEN "1-5" ' +
          'WHEN EXTRACT(YEAR FROM AGE(date_of_birth)) < 12 THEN "5-12" ' +
          'ELSE "12+" END',
        count: count()
      })
      .from(patients)
      .groupBy('ageGroup')

    // Gender distribution
    const genderDistribution = await db
      .select({
        gender: patients.gender,
        count: count()
      })
      .from(patients)
      .groupBy(patients.gender)

    res.json({
      data: {
        ageGroups,
        genderDistribution
      }
    })
  } catch (error) {
    console.error('Get patient demographics error:', error)
    res.status(500).json({
      error: 'Failed to fetch patient demographics',
      message: 'Không thể tải thống kê bệnh nhân'
    })
  }
})

module.exports = router
