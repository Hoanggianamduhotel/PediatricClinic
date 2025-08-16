const { drizzle } = require('drizzle-orm/postgres-js')
const { migrate } = require('drizzle-orm/postgres-js/migrator')
const postgres = require('postgres')
require('dotenv').config()

const runMigration = async () => {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is required')
    console.log('Please set your Supabase database connection string:')
    console.log('1. Go to https://supabase.com/dashboard/projects')
    console.log('2. Select your project')
    console.log('3. Click "Connect" button')
    console.log('4. Copy the URI under "Connection string" -> "Transaction pooler"')
    console.log('5. Replace [YOUR-PASSWORD] with your database password')
    console.log('6. Set DATABASE_URL environment variable')
    process.exit(1)
  }

  const client = postgres(process.env.DATABASE_URL)
  const db = drizzle(client)

  console.log('🔄 Running database migrations...')
  
  try {
    // Create tables manually since we're not using migration files
    await createTables(db)
    await seedInitialData(db)
    
    console.log('✅ Database migrations completed successfully')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await client.end()
  }
}

const createTables = async (db) => {
  // Users table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'staff',
      avatar TEXT,
      is_active BOOLEAN DEFAULT true,
      last_login TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `)

  // Patients table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS patients (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      date_of_birth DATE NOT NULL,
      gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
      parent_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      address TEXT,
      medical_history TEXT,
      notes TEXT,
      last_visit TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `)

  // Staff table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS staff (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id),
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('doctor', 'nurse', 'receptionist', 'admin')),
      specialization TEXT,
      license_number TEXT,
      hire_date DATE NOT NULL,
      salary DECIMAL(12,2),
      status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'terminated')),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `)

  // Appointments table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS appointments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      patient_id UUID REFERENCES patients(id) NOT NULL,
      doctor_id UUID REFERENCES staff(id) NOT NULL,
      date DATE NOT NULL,
      time TIME NOT NULL,
      duration INTEGER DEFAULT 30,
      reason TEXT NOT NULL,
      notes TEXT,
      status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'checked-in', 'completed', 'cancelled', 'no-show')),
      checked_in_at TIMESTAMP,
      completed_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(doctor_id, date, time)
    )
  `)

  // Medical records table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS medical_records (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      patient_id UUID REFERENCES patients(id) NOT NULL,
      doctor_id UUID REFERENCES staff(id) NOT NULL,
      appointment_id UUID REFERENCES appointments(id),
      visit_date DATE NOT NULL,
      weight DECIMAL(5,2),
      height DECIMAL(5,2),
      temperature DECIMAL(4,1),
      blood_pressure TEXT,
      heart_rate INTEGER,
      symptoms TEXT NOT NULL,
      examination TEXT,
      diagnosis TEXT NOT NULL,
      treatment TEXT,
      prescription TEXT,
      follow_up_date DATE,
      notes TEXT,
      status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'completed', 'pending')),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `)

  // Invoices table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS invoices (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      invoice_number TEXT UNIQUE NOT NULL,
      patient_id UUID REFERENCES patients(id) NOT NULL,
      appointment_id UUID REFERENCES appointments(id),
      medical_record_id UUID REFERENCES medical_records(id),
      issue_date DATE DEFAULT CURRENT_DATE,
      due_date DATE,
      subtotal DECIMAL(12,2) NOT NULL,
      tax DECIMAL(12,2) DEFAULT 0,
      discount DECIMAL(12,2) DEFAULT 0,
      total_amount DECIMAL(12,2) NOT NULL,
      paid_amount DECIMAL(12,2) DEFAULT 0,
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
      payment_method TEXT CHECK (payment_method IN ('cash', 'card', 'transfer')),
      payment_date TIMESTAMP,
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `)

  // Invoice items table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS invoice_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      invoice_id UUID REFERENCES invoices(id) NOT NULL,
      description TEXT NOT NULL,
      quantity INTEGER DEFAULT 1,
      unit_price DECIMAL(12,2) NOT NULL,
      total_price DECIMAL(12,2) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `)

  // Medications table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS medications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      generic_name TEXT,
      dosage_form TEXT,
      strength TEXT,
      manufacturer TEXT,
      description TEXT,
      side_effects TEXT,
      contraindications TEXT,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `)

  // Prescriptions table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS prescriptions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      medical_record_id UUID REFERENCES medical_records(id) NOT NULL,
      medication_id UUID REFERENCES medications(id),
      medication_name TEXT NOT NULL,
      dosage TEXT NOT NULL,
      frequency TEXT NOT NULL,
      duration TEXT NOT NULL,
      instructions TEXT,
      quantity INTEGER,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `)

  // Appointment slots table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS appointment_slots (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      doctor_id UUID REFERENCES staff(id) NOT NULL,
      day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
      start_time TIME NOT NULL,
      end_time TIME NOT NULL,
      slot_duration INTEGER DEFAULT 30,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `)

  // Settings table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS settings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      key TEXT UNIQUE NOT NULL,
      value TEXT NOT NULL,
      type TEXT DEFAULT 'string' CHECK (type IN ('string', 'number', 'boolean', 'json')),
      description TEXT,
      is_public BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `)

  // Audit logs table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id),
      action TEXT NOT NULL CHECK (action IN ('create', 'read', 'update', 'delete')),
      table_name TEXT NOT NULL,
      record_id TEXT NOT NULL,
      old_values TEXT,
      new_values TEXT,
      ip_address TEXT,
      user_agent TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `)

  // Create indexes for better performance
  await db.execute('CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone)')
  await db.execute('CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date)')
  await db.execute('CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id)')
  await db.execute('CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON appointments(doctor_id)')
  await db.execute('CREATE INDEX IF NOT EXISTS idx_medical_records_patient ON medical_records(patient_id)')
  await db.execute('CREATE INDEX IF NOT EXISTS idx_invoices_patient ON invoices(patient_id)')
  await db.execute('CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status)')
  await db.execute('CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id)')
  await db.execute('CREATE INDEX IF NOT EXISTS idx_audit_logs_table ON audit_logs(table_name)')

  console.log('✅ All tables created successfully')
}

const seedInitialData = async (db) => {
  // Create default admin user
  const bcrypt = require('bcrypt')
  const hashedPassword = await bcrypt.hash('admin123', 10)

  await db.execute(`
    INSERT INTO users (email, password, name, role)
    VALUES ('admin@clinic.com', '${hashedPassword}', 'Administrator', 'admin')
    ON CONFLICT (email) DO NOTHING
  `)

  // Create default settings
  const defaultSettings = [
    ['clinic_name', 'Clinic BS Khang', 'string', 'Tên phòng khám'],
    ['clinic_address', 'Địa chỉ phòng khám', 'string', 'Địa chỉ phòng khám'],
    ['clinic_phone', '0123456789', 'string', 'Số điện thoại phòng khám'],
    ['clinic_email', 'contact@clinic.com', 'string', 'Email liên hệ'],
    ['appointment_duration', '30', 'number', 'Thời lượng khám mặc định (phút)'],
    ['working_hours_start', '08:00', 'string', 'Giờ bắt đầu làm việc'],
    ['working_hours_end', '17:00', 'string', 'Giờ kết thúc làm việc'],
    ['currency', 'VND', 'string', 'Đơn vị tiền tệ'],
    ['tax_rate', '0', 'number', 'Thuế VAT (%)'],
  ]

  for (const [key, value, type, description] of defaultSettings) {
    await db.execute(`
      INSERT INTO settings (key, value, type, description, is_public)
      VALUES ('${key}', '${value}', '${type}', '${description}', true)
      ON CONFLICT (key) DO NOTHING
    `)
  }

  // Create sample medications
  const medications = [
    ['Paracetamol', 'Acetaminophen', 'Viên nén', '500mg', 'Hạ sốt, giảm đau'],
    ['Amoxicillin', 'Amoxicillin', 'Viên nang', '500mg', 'Kháng sinh'],
    ['ORS', 'Oral Rehydration Salt', 'Gói bột', '20.5g', 'Bù nước điện giải'],
    ['Vitamin C', 'Ascorbic Acid', 'Viên sủi', '1000mg', 'Bổ sung vitamin C'],
    ['Zinc', 'Zinc Sulfate', 'Viên nén', '20mg', 'Bổ sung kẽm'],
  ]

  for (const [name, genericName, dosageForm, strength, description] of medications) {
    await db.execute(`
      INSERT INTO medications (name, generic_name, dosage_form, strength, description)
      VALUES ('${name}', '${genericName}', '${dosageForm}', '${strength}', '${description}')
      ON CONFLICT DO NOTHING
    `)
  }

  console.log('✅ Initial data seeded successfully')
  console.log('🔑 Default admin credentials:')
  console.log('   Email: admin@clinic.com')
  console.log('   Password: admin123')
  console.log('⚠️  Please change the default password after first login!')
}

// Run migration if this script is called directly
if (require.main === module) {
  runMigration()
    .then(() => {
      console.log('✅ Migration completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Migration failed:', error)
      process.exit(1)
    })
}

module.exports = { runMigration, createTables, seedInitialData }
