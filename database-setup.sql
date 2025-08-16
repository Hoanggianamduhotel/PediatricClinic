-- Create patients table (maps to benhnhan data)
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  date_of_birth DATE,
  gender VARCHAR(20),
  address TEXT,
  phone VARCHAR(20),
  weight DECIMAL(5,2),
  age_in_months INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create staff table for doctors/nurses
CREATE TABLE IF NOT EXISTS staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL, -- 'doctor', 'nurse', 'receptionist'
  specialization VARCHAR(100),
  phone VARCHAR(20),
  email VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create medical_records table for examinations
CREATE TABLE IF NOT EXISTS medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id),
  staff_id UUID REFERENCES staff(id),
  visit_date DATE NOT NULL,
  symptoms TEXT,
  diagnosis TEXT,
  treatment TEXT,
  prescription TEXT,
  follow_up_date DATE,
  status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'in_progress', 'completed', 'waiting', 'cancelled'
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert sample staff data
INSERT INTO staff (name, role, specialization, phone, email) VALUES
('BS. Lê Minh Khang', 'doctor', 'Nhi khoa', '0901234567', 'bs.khang@clinic.vn'),
('Y tá Nguyễn Thu Hà', 'nurse', 'Điều dưỡng nhi', '0901234568', 'yta.ha@clinic.vn'),
('Lễ tân Mai Anh', 'receptionist', '', '0901234569', 'letan.maianh@clinic.vn')
ON CONFLICT (id) DO NOTHING;

-- Migrate existing benhnhan data to patients table (if needed)
INSERT INTO patients (name, date_of_birth, gender, address, phone, weight, age_in_months, created_at)
SELECT 
  ho_ten as name,
  ngay_sinh::date as date_of_birth,
  gioi_tinh as gender,
  dia_chi as address,
  so_dien_thoai as phone,
  can_nang as weight,
  thang_tuoi as age_in_months,
  COALESCE(created_at::timestamp, NOW()) as created_at
FROM benhnhan
WHERE NOT EXISTS (
  SELECT 1 FROM patients p 
  WHERE p.name = benhnhan.ho_ten 
  AND p.date_of_birth = benhnhan.ngay_sinh::date
);

-- Create sample medical records for today's date
INSERT INTO medical_records (patient_id, staff_id, visit_date, symptoms, diagnosis, treatment, prescription, follow_up_date, status, notes)
SELECT 
  p.id as patient_id,
  s.id as staff_id,
  CURRENT_DATE as visit_date,
  CASE 
    WHEN RANDOM() < 0.3 THEN 'Sốt, ho, đau họng'
    WHEN RANDOM() < 0.6 THEN 'Tiêu chảy, buồn nôn'
    ELSE 'Sốt nhẹ, mệt mỏi'
  END as symptoms,
  CASE 
    WHEN RANDOM() < 0.3 THEN 'Viêm họng cấp'
    WHEN RANDOM() < 0.6 THEN 'Tiêu chảy cấp'
    ELSE 'Cảm lạnh thông thường'
  END as diagnosis,
  CASE 
    WHEN RANDOM() < 0.3 THEN 'Thuốc kháng sinh, thuốc hạ sốt'
    WHEN RANDOM() < 0.6 THEN 'Oresol, thuốc cầm tiêu chảy'
    ELSE 'Thuốc hạ sốt, nghỉ ngơi'
  END as treatment,
  CASE 
    WHEN RANDOM() < 0.3 THEN 'Amoxicillin 250mg x 3 lần/ngày'
    WHEN RANDOM() < 0.6 THEN 'Oresol 1 gói x 4 lần/ngày'
    ELSE 'Paracetamol 250mg khi sốt'
  END as prescription,
  CASE WHEN RANDOM() < 0.4 THEN CURRENT_DATE + INTERVAL '3 days' ELSE NULL END as follow_up_date,
  CASE 
    WHEN RANDOM() < 0.7 THEN 'completed'
    WHEN RANDOM() < 0.9 THEN 'in_progress'
    ELSE 'waiting'
  END as status,
  'Hồ sơ mẫu cho demo thống kê' as notes
FROM patients p
CROSS JOIN staff s
WHERE s.role = 'doctor'
AND p.id IN (SELECT id FROM patients ORDER BY RANDOM() LIMIT 5)
ON CONFLICT (id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_medical_records_visit_date ON medical_records(visit_date);
CREATE INDEX IF NOT EXISTS idx_medical_records_status ON medical_records(status);
CREATE INDEX IF NOT EXISTS idx_medical_records_patient_id ON medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_staff_id ON medical_records(staff_id);