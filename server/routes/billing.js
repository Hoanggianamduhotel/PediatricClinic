const express = require('express')
const { drizzle } = require('drizzle-orm/postgres-js')
const { eq, and, gte, lte, like, or, desc, sum } = require('drizzle-orm')
const postgres = require('postgres')
const { invoices, invoiceItems, patients, appointments } = require('../db/schema')
const { authenticateToken } = require('../middleware/auth')

const router = express.Router()
const client = postgres(process.env.DATABASE_URL)
const db = drizzle(client)

// Apply authentication to all routes
router.use(authenticateToken)

// Generate invoice number
const generateInvoiceNumber = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const time = String(Date.now()).slice(-6) // Last 6 digits of timestamp
  
  return `INV-${year}${month}${day}-${time}`
}

// Get invoices with filtering
router.get('/', async (req, res) => {
  try {
    const {
      search,
      status,
      dateFrom,
      dateTo,
      patientId,
      page = 1,
      limit = 50
    } = req.query

    const offset = (parseInt(page) - 1) * parseInt(limit)

    // Build query with joins
    let query = db
      .select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        patientId: invoices.patientId,
        appointmentId: invoices.appointmentId,
        issueDate: invoices.issueDate,
        dueDate: invoices.dueDate,
        subtotal: invoices.subtotal,
        tax: invoices.tax,
        discount: invoices.discount,
        totalAmount: invoices.totalAmount,
        paidAmount: invoices.paidAmount,
        status: invoices.status,
        paymentMethod: invoices.paymentMethod,
        paymentDate: invoices.paymentDate,
        notes: invoices.notes,
        createdAt: invoices.createdAt,
        patientName: patients.name,
        patientPhone: patients.phone,
        patientEmail: patients.email
      })
      .from(invoices)
      .leftJoin(patients, eq(invoices.patientId, patients.id))

    // Build where conditions
    const conditions = []

    if (search) {
      conditions.push(
        or(
          like(invoices.invoiceNumber, `%${search}%`),
          like(patients.name, `%${search}%`),
          like(patients.phone, `%${search}%`)
        )
      )
    }

    if (status) {
      conditions.push(eq(invoices.status, status))
    }

    if (dateFrom) {
      conditions.push(gte(invoices.issueDate, dateFrom))
    }

    if (dateTo) {
      conditions.push(lte(invoices.issueDate, dateTo))
    }

    if (patientId) {
      conditions.push(eq(invoices.patientId, patientId))
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions))
    }

    // Apply sorting
    query = query.orderBy(desc(invoices.createdAt))

    // Apply pagination
    const results = await query.limit(parseInt(limit)).offset(offset)

    res.json({ data: results })
  } catch (error) {
    console.error('Get invoices error:', error)
    res.status(500).json({
      error: 'Failed to fetch invoices',
      message: 'Không thể tải danh sách hóa đơn'
    })
  }
})

// Get invoice by ID with items
router.get('/:id', async (req, res) => {
  try {
    // Get invoice with patient info
    const invoice = await db
      .select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        patientId: invoices.patientId,
        appointmentId: invoices.appointmentId,
        medicalRecordId: invoices.medicalRecordId,
        issueDate: invoices.issueDate,
        dueDate: invoices.dueDate,
        subtotal: invoices.subtotal,
        tax: invoices.tax,
        discount: invoices.discount,
        totalAmount: invoices.totalAmount,
        paidAmount: invoices.paidAmount,
        status: invoices.status,
        paymentMethod: invoices.paymentMethod,
        paymentDate: invoices.paymentDate,
        notes: invoices.notes,
        createdAt: invoices.createdAt,
        patientName: patients.name,
        patientPhone: patients.phone,
        patientEmail: patients.email,
        patientAddress: patients.address
      })
      .from(invoices)
      .leftJoin(patients, eq(invoices.patientId, patients.id))
      .where(eq(invoices.id, req.params.id))
      .limit(1)

    if (invoice.length === 0) {
      return res.status(404).json({
        error: 'Invoice not found',
        message: 'Không tìm thấy hóa đơn'
      })
    }

    // Get invoice items
    const items = await db
      .select()
      .from(invoiceItems)
      .where(eq(invoiceItems.invoiceId, req.params.id))
      .orderBy(invoiceItems.createdAt)

    const invoiceData = {
      ...invoice[0],
      items
    }

    res.json({ data: invoiceData })
  } catch (error) {
    console.error('Get invoice error:', error)
    res.status(500).json({
      error: 'Failed to fetch invoice',
      message: 'Không thể tải thông tin hóa đơn'
    })
  }
})

// Create new invoice
router.post('/', async (req, res) => {
  try {
    const {
      patientId,
      appointmentId,
      medicalRecordId,
      items,
      dueDate,
      tax = 0,
      discount = 0,
      notes
    } = req.body

    // Validation
    if (!patientId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(422).json({
        error: 'Validation Error',
        message: 'Bệnh nhân và danh sách dịch vụ là bắt buộc'
      })
    }

    // Validate items
    for (const item of items) {
      if (!item.description || !item.quantity || !item.price) {
        return res.status(422).json({
          error: 'Validation Error',
          message: 'Mỗi dịch vụ phải có mô tả, số lượng và giá'
        })
      }
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

    // Calculate totals
    const subtotal = items.reduce((sum, item) => {
      return sum + (parseFloat(item.quantity) * parseFloat(item.price))
    }, 0)

    const taxAmount = (subtotal * parseFloat(tax)) / 100
    const discountAmount = parseFloat(discount)
    const totalAmount = subtotal + taxAmount - discountAmount

    // Generate invoice number
    const invoiceNumber = generateInvoiceNumber()

    // Create invoice
    const newInvoice = await db
      .insert(invoices)
      .values({
        invoiceNumber,
        patientId,
        appointmentId: appointmentId || null,
        medicalRecordId: medicalRecordId || null,
        issueDate: new Date(),
        dueDate: dueDate ? new Date(dueDate) : null,
        subtotal,
        tax: taxAmount,
        discount: discountAmount,
        totalAmount,
        paidAmount: 0,
        status: 'pending',
        notes: notes || null
      })
      .returning()

    // Create invoice items
    const invoiceItemsData = items.map(item => ({
      invoiceId: newInvoice[0].id,
      description: item.description,
      quantity: parseInt(item.quantity),
      unitPrice: parseFloat(item.price),
      totalPrice: parseFloat(item.quantity) * parseFloat(item.price)
    }))

    await db.insert(invoiceItems).values(invoiceItemsData)

    res.status(201).json({
      message: 'Tạo hóa đơn thành công',
      data: newInvoice[0]
    })
  } catch (error) {
    console.error('Create invoice error:', error)
    res.status(500).json({
      error: 'Failed to create invoice',
      message: 'Không thể tạo hóa đơn'
    })
  }
})

// Update invoice
router.put('/:id', async (req, res) => {
  try {
    const {
      patientId,
      appointmentId,
      medicalRecordId,
      items,
      dueDate,
      tax,
      discount,
      notes,
      status
    } = req.body

    // Check if invoice exists
    const existingInvoice = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, req.params.id))
      .limit(1)

    if (existingInvoice.length === 0) {
      return res.status(404).json({
        error: 'Invoice not found',
        message: 'Không tìm thấy hóa đơn'
      })
    }

    // Don't allow editing paid invoices
    if (existingInvoice[0].status === 'paid') {
      return res.status(400).json({
        error: 'Cannot edit paid invoice',
        message: 'Không thể sửa hóa đơn đã thanh toán'
      })
    }

    const updateData = {
      updatedAt: new Date()
    }

    // If items are provided, recalculate totals
    if (items && Array.isArray(items)) {
      // Delete existing items
      await db
        .delete(invoiceItems)
        .where(eq(invoiceItems.invoiceId, req.params.id))

      // Calculate new totals
      const subtotal = items.reduce((sum, item) => {
        return sum + (parseFloat(item.quantity) * parseFloat(item.price))
      }, 0)

      const taxAmount = tax !== undefined ? (subtotal * parseFloat(tax)) / 100 : existingInvoice[0].tax
      const discountAmount = discount !== undefined ? parseFloat(discount) : existingInvoice[0].discount
      const totalAmount = subtotal + taxAmount - discountAmount

      updateData.subtotal = subtotal
      updateData.tax = taxAmount
      updateData.discount = discountAmount
      updateData.totalAmount = totalAmount

      // Create new items
      const invoiceItemsData = items.map(item => ({
        invoiceId: req.params.id,
        description: item.description,
        quantity: parseInt(item.quantity),
        unitPrice: parseFloat(item.price),
        totalPrice: parseFloat(item.quantity) * parseFloat(item.price)
      }))

      await db.insert(invoiceItems).values(invoiceItemsData)
    }

    if (patientId) updateData.patientId = patientId
    if (appointmentId !== undefined) updateData.appointmentId = appointmentId
    if (medicalRecordId !== undefined) updateData.medicalRecordId = medicalRecordId
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null
    if (notes !== undefined) updateData.notes = notes
    if (status) updateData.status = status

    const updatedInvoice = await db
      .update(invoices)
      .set(updateData)
      .where(eq(invoices.id, req.params.id))
      .returning()

    res.json({
      message: 'Cập nhật hóa đơn thành công',
      data: updatedInvoice[0]
    })
  } catch (error) {
    console.error('Update invoice error:', error)
    res.status(500).json({
      error: 'Failed to update invoice',
      message: 'Không thể cập nhật hóa đơn'
    })
  }
})

// Mark invoice as paid
router.patch('/:id/pay', async (req, res) => {
  try {
    const { paymentMethod = 'cash', paidAmount } = req.body

    const existingInvoice = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, req.params.id))
      .limit(1)

    if (existingInvoice.length === 0) {
      return res.status(404).json({
        error: 'Invoice not found',
        message: 'Không tìm thấy hóa đơn'
      })
    }

    if (existingInvoice[0].status === 'paid') {
      return res.status(400).json({
        error: 'Already paid',
        message: 'Hóa đơn đã được thanh toán rồi'
      })
    }

    const amountToPay = paidAmount || existingInvoice[0].totalAmount

    const updatedInvoice = await db
      .update(invoices)
      .set({
        status: 'paid',
        paymentMethod,
        paidAmount: parseFloat(amountToPay),
        paymentDate: new Date(),
        updatedAt: new Date()
      })
      .where(eq(invoices.id, req.params.id))
      .returning()

    res.json({
      message: 'Thanh toán thành công',
      data: updatedInvoice[0]
    })
  } catch (error) {
    console.error('Mark as paid error:', error)
    res.status(500).json({
      error: 'Failed to mark as paid',
      message: 'Không thể thực hiện thanh toán'
    })
  }
})

// Delete invoice
router.delete('/:id', async (req, res) => {
  try {
    const existingInvoice = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, req.params.id))
      .limit(1)

    if (existingInvoice.length === 0) {
      return res.status(404).json({
        error: 'Invoice not found',
        message: 'Không tìm thấy hóa đơn'
      })
    }

    // Don't allow deleting paid invoices
    if (existingInvoice[0].status === 'paid') {
      return res.status(400).json({
        error: 'Cannot delete paid invoice',
        message: 'Không thể xóa hóa đơn đã thanh toán'
      })
    }

    // Delete invoice items first
    await db
      .delete(invoiceItems)
      .where(eq(invoiceItems.invoiceId, req.params.id))

    // Delete invoice
    await db
      .delete(invoices)
      .where(eq(invoices.id, req.params.id))

    res.json({
      message: 'Xóa hóa đơn thành công'
    })
  } catch (error) {
    console.error('Delete invoice error:', error)
    res.status(500).json({
      error: 'Failed to delete invoice',
      message: 'Không thể xóa hóa đơn'
    })
  }
})

// Get billing statistics
router.get('/stats', async (req, res) => {
  try {
    const today = new Date()
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())

    // Today's revenue
    const todayRevenue = await db
      .select({
        total: sum(invoices.paidAmount)
      })
      .from(invoices)
      .where(and(
        eq(invoices.status, 'paid'),
        gte(invoices.paymentDate, startOfToday)
      ))

    // Today's invoices count
    const todayInvoices = await db
      .select({ count: 'count(*)' })
      .from(invoices)
      .where(gte(invoices.issueDate, startOfToday))

    // Pending payments count
    const pendingPayments = await db
      .select({ count: 'count(*)' })
      .from(invoices)
      .where(eq(invoices.status, 'pending'))

    // Monthly revenue
    const monthlyRevenue = await db
      .select({
        total: sum(invoices.paidAmount)
      })
      .from(invoices)
      .where(and(
        eq(invoices.status, 'paid'),
        gte(invoices.paymentDate, startOfMonth)
      ))

    res.json({
      data: {
        todayRevenue: parseFloat(todayRevenue[0]?.total || 0),
        todayInvoices: parseInt(todayInvoices[0]?.count || 0),
        pendingPayments: parseInt(pendingPayments[0]?.count || 0),
        monthlyRevenue: parseFloat(monthlyRevenue[0]?.total || 0)
      }
    })
  } catch (error) {
    console.error('Get billing stats error:', error)
    res.status(500).json({
      error: 'Failed to fetch billing statistics',
      message: 'Không thể tải thống kê thanh toán'
    })
  }
})

module.exports = router
