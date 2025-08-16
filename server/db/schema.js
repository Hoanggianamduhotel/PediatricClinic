const { pgTable, text, integer, decimal, timestamp, boolean, uuid, date, time } = require('drizzle-orm/pg-core')
const { createId } = require('@paralleldrive/cuid2')

// Users table for authentication
const users = pgTable('users', {
  id: uuid('id').primaryKey().default(createId()),
  email: text('email').unique().notNull(),
  password: text('password').notNull(),
  name: text('name').notNull(),
  role: text('role').notNull().default('staff'), // admin, doctor, nurse, receptionist, staff
  avatar: text('avatar'),
  isActive: boolean('is_active').default(true),
  lastLogin: timestamp('last_login'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
})

// Benhnhan table (Vietnamese patient table)
const benhnhan = pgTable('benhnhan', {
  id: uuid('id').primaryKey().$defaultFn(() => createId()),
  ho_ten: text('ho_ten').notNull(),
  ngay_sinh: date('ngay_sinh'),
  gioi_tinh: text('gioi_tinh'),
  dia_chi: text('dia_chi'),
  so_dien_thoai: text('so_dien_thoai'),
  created_at: date('created_at').$defaultFn(() => new Date().toISOString().split('T')[0]),
  thang_tuoi: integer('thang_tuoi'),
  can_nang: decimal('can_nang', { precision: 5, scale: 1 })
})

// Patients table (English for system integration)
const patients = pgTable('patients', {
  id: uuid('id').primaryKey().default(createId()),
  name: text('name').notNull(),
  dateOfBirth: date('date_of_birth').notNull(),
  gender: text('gender').notNull(), // male, female
  parentName: text('parent_name').notNull(),
  phone: text('phone').notNull(),
  email: text('email'),
  address: text('address'),
  medicalHistory: text('medical_history'),
  notes: text('notes'),
  lastVisit: timestamp('last_visit'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
})

// Staff table (doctors, nurses, etc.)
const staff = pgTable('staff', {
  id: uuid('id').primaryKey().default(createId()),
  userId: uuid('user_id').references(() => users.id),
  name: text('name').notNull(),
  email: text('email').unique().notNull(),
  phone: text('phone').notNull(),
  role: text('role').notNull(), // doctor, nurse, receptionist, admin
  specialization: text('specialization'),
  licenseNumber: text('license_number'),
  hireDate: date('hire_date').notNull(),
  salary: decimal('salary', { precision: 12, scale: 2 }),
  status: text('status').default('active'), // active, inactive, terminated
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
})

// Appointments table
const appointments = pgTable('appointments', {
  id: uuid('id').primaryKey().default(createId()),
  patientId: uuid('patient_id').references(() => patients.id).notNull(),
  doctorId: uuid('doctor_id').references(() => staff.id).notNull(),
  date: date('date').notNull(),
  time: time('time').notNull(),
  duration: integer('duration').default(30), // minutes
  reason: text('reason').notNull(),
  notes: text('notes'),
  status: text('status').default('scheduled'), // scheduled, checked-in, completed, cancelled, no-show
  checkedInAt: timestamp('checked_in_at'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
})

// Medical records table
const medicalRecords = pgTable('medical_records', {
  id: uuid('id').primaryKey().default(createId()),
  patientId: uuid('patient_id').references(() => patients.id).notNull(),
  doctorId: uuid('doctor_id').references(() => staff.id).notNull(),
  appointmentId: uuid('appointment_id').references(() => appointments.id),
  visitDate: date('visit_date').notNull(),
  weight: decimal('weight', { precision: 5, scale: 2 }), // kg
  height: decimal('height', { precision: 5, scale: 2 }), // cm
  temperature: decimal('temperature', { precision: 4, scale: 1 }), // celsius
  bloodPressure: text('blood_pressure'),
  heartRate: integer('heart_rate'),
  symptoms: text('symptoms').notNull(),
  examination: text('examination'),
  diagnosis: text('diagnosis').notNull(),
  treatment: text('treatment'),
  prescription: text('prescription'),
  followUpDate: date('follow_up_date'),
  notes: text('notes'),
  status: text('status').default('draft'), // draft, completed, pending
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
})

// Billing and invoices table
const invoices = pgTable('invoices', {
  id: uuid('id').primaryKey().default(createId()),
  invoiceNumber: text('invoice_number').unique().notNull(),
  patientId: uuid('patient_id').references(() => patients.id).notNull(),
  appointmentId: uuid('appointment_id').references(() => appointments.id),
  medicalRecordId: uuid('medical_record_id').references(() => medicalRecords.id),
  issueDate: date('issue_date').defaultNow(),
  dueDate: date('due_date'),
  subtotal: decimal('subtotal', { precision: 12, scale: 2 }).notNull(),
  tax: decimal('tax', { precision: 12, scale: 2 }).default('0'),
  discount: decimal('discount', { precision: 12, scale: 2 }).default('0'),
  totalAmount: decimal('total_amount', { precision: 12, scale: 2 }).notNull(),
  paidAmount: decimal('paid_amount', { precision: 12, scale: 2 }).default('0'),
  status: text('status').default('pending'), // pending, paid, overdue, cancelled
  paymentMethod: text('payment_method'), // cash, card, transfer
  paymentDate: timestamp('payment_date'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
})

// Invoice items table
const invoiceItems = pgTable('invoice_items', {
  id: uuid('id').primaryKey().default(createId()),
  invoiceId: uuid('invoice_id').references(() => invoices.id).notNull(),
  description: text('description').notNull(),
  quantity: integer('quantity').default(1),
  unitPrice: decimal('unit_price', { precision: 12, scale: 2 }).notNull(),
  totalPrice: decimal('total_price', { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow()
})

// Medications table
const medications = pgTable('medications', {
  id: uuid('id').primaryKey().default(createId()),
  name: text('name').notNull(),
  genericName: text('generic_name'),
  dosageForm: text('dosage_form'), // tablet, syrup, injection, etc.
  strength: text('strength'),
  manufacturer: text('manufacturer'),
  description: text('description'),
  sideEffects: text('side_effects'),
  contraindications: text('contraindications'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
})

// Prescriptions table (detailed prescription items)
const prescriptions = pgTable('prescriptions', {
  id: uuid('id').primaryKey().default(createId()),
  medicalRecordId: uuid('medical_record_id').references(() => medicalRecords.id).notNull(),
  medicationId: uuid('medication_id').references(() => medications.id),
  medicationName: text('medication_name').notNull(), // Store name directly for flexibility
  dosage: text('dosage').notNull(),
  frequency: text('frequency').notNull(),
  duration: text('duration').notNull(),
  instructions: text('instructions'),
  quantity: integer('quantity'),
  createdAt: timestamp('created_at').defaultNow()
})

// Appointment slots template (for recurring schedules)
const appointmentSlots = pgTable('appointment_slots', {
  id: uuid('id').primaryKey().default(createId()),
  doctorId: uuid('doctor_id').references(() => staff.id).notNull(),
  dayOfWeek: integer('day_of_week').notNull(), // 0 = Sunday, 1 = Monday, etc.
  startTime: time('start_time').notNull(),
  endTime: time('end_time').notNull(),
  slotDuration: integer('slot_duration').default(30), // minutes
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
})

// System settings table
const settings = pgTable('settings', {
  id: uuid('id').primaryKey().default(createId()),
  key: text('key').unique().notNull(),
  value: text('value').notNull(),
  type: text('type').default('string'), // string, number, boolean, json
  description: text('description'),
  isPublic: boolean('is_public').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
})

// Audit logs table
const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().default(createId()),
  userId: uuid('user_id').references(() => users.id),
  action: text('action').notNull(), // create, read, update, delete
  tableName: text('table_name').notNull(),
  recordId: text('record_id').notNull(),
  oldValues: text('old_values'), // JSON string
  newValues: text('new_values'), // JSON string
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow()
})

module.exports = {
  users,
  benhnhan,
  patients,
  staff,
  appointments,
  medicalRecords,
  invoices,
  invoiceItems,
  medications,
  prescriptions,
  appointmentSlots,
  settings,
  auditLogs
}
