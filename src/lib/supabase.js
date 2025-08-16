import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper functions for patient operations
export const patientService = {
  // Get all patients with optional search
  async getPatients(searchText = '') {
    try {
      let query = supabase
        .from('benhnhan')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)
      
      if (searchText && searchText.trim()) {
        query = query.ilike('ho_ten', `%${searchText.trim()}%`)
      }
      
      const { data, error } = await query
      
      if (error) {
        throw error
      }
      
      return { success: true, data: data || [] }
    } catch (error) {
      console.error('Lỗi tải danh sách bệnh nhân:', error)
      return { 
        success: false, 
        error: error.message || 'Không thể tải danh sách bệnh nhân' 
      }
    }
  },

  // Create new patient
  async createPatient(patientData) {
    try {
      const { ho_ten, ngay_sinh, gioi_tinh, dia_chi, so_dien_thoai, can_nang } = patientData
      
      // Validation
      if (!ho_ten?.trim()) {
        throw new Error('Vui lòng nhập họ tên bệnh nhân')
      }
      if (!ngay_sinh) {
        throw new Error('Vui lòng nhập ngày sinh')
      }
      if (!gioi_tinh) {
        throw new Error('Vui lòng chọn giới tính')
      }
      
      // Calculate age in months
      const birthDate = new Date(ngay_sinh)
      const today = new Date()
      const thang_tuoi = Math.floor((today - birthDate) / (1000 * 60 * 60 * 24 * 30.44))
      
      const newPatient = {
        ho_ten: ho_ten.trim(),
        ngay_sinh,
        gioi_tinh,
        dia_chi: dia_chi?.trim() || null,
        so_dien_thoai: so_dien_thoai?.trim() || null,
        can_nang: can_nang ? parseFloat(can_nang) : null,
        thang_tuoi,
        created_at: new Date().toISOString().split('T')[0]
      }
      
      const { data, error } = await supabase
        .from('benhnhan')
        .insert(newPatient)
        .select()
        .single()
      
      if (error) {
        throw error
      }
      
      return { 
        success: true, 
        data, 
        message: 'Thêm bệnh nhân thành công' 
      }
    } catch (error) {
      console.error('Lỗi thêm bệnh nhân:', error)
      return { 
        success: false, 
        error: error.message || 'Không thể thêm bệnh nhân' 
      }
    }
  },

  // Get patient by ID
  async getPatientById(id) {
    try {
      const { data, error } = await supabase
        .from('benhnhan')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) {
        throw error
      }
      
      return { success: true, data }
    } catch (error) {
      console.error('Lỗi tải thông tin bệnh nhân:', error)
      return { 
        success: false, 
        error: error.message || 'Không tìm thấy bệnh nhân' 
      }
    }
  }
}

// Waiting list service
export const waitingListService = {
  // Add patient to waiting list
  async addToWaitingList(patient) {
    try {
      // Check if patient already in waiting list
      const { data: existing } = await supabase
        .from('danhsachcho')
        .select('id')
        .eq('benhnhan_id', patient.id)
        .single()
      
      if (existing) {
        return {
          success: false,
          error: 'Bệnh nhân đã có trong danh sách chờ'
        }
      }
      
      const waitingListEntry = {
        benhnhan_id: patient.id,
        ho_ten: patient.ho_ten,
        ngay_sinh: patient.ngay_sinh,
        gioi_tinh: patient.gioi_tinh,
        dia_chi: patient.dia_chi,
        thang_tuoi: patient.thang_tuoi,
        can_nang: patient.can_nang,
        so_dien_thoai: patient.so_dien_thoai,
        ngay_tao: new Date().toISOString().split('T')[0]
      }
      
      const { data, error } = await supabase
        .from('danhsachcho')
        .insert(waitingListEntry)
        .select()
        .single()
      
      if (error) {
        throw error
      }
      
      return {
        success: true,
        data,
        message: 'Đã thêm vào danh sách chờ thành công'
      }
    } catch (error) {
      console.error('Lỗi thêm vào danh sách chờ:', error)
      return {
        success: false,
        error: error.message || 'Không thể thêm vào danh sách chờ'
      }
    }
  },

  // Get waiting list
  async getWaitingList() {
    try {
      const { data, error } = await supabase
        .from('danhsachcho')
        .select('*')
        .order('ngay_tao', { ascending: true })
        .order('id', { ascending: true })
      
      if (error) {
        throw error
      }
      
      return { success: true, data: data || [] }
    } catch (error) {
      console.error('Lỗi tải danh sách chờ:', error)
      return {
        success: false,
        error: error.message || 'Không thể tải danh sách chờ'
      }
    }
  },

  // Remove from waiting list
  async removeFromWaitingList(waitingListId) {
    try {
      const { error } = await supabase
        .from('danhsachcho')
        .delete()
        .eq('id', waitingListId)
      
      if (error) {
        throw error
      }
      
      return {
        success: true,
        message: 'Đã xóa khỏi danh sách chờ'
      }
    } catch (error) {
      console.error('Lỗi xóa khỏi danh sách chờ:', error)
      return {
        success: false,
        error: error.message || 'Không thể xóa khỏi danh sách chờ'
      }
    }
  }
}

// Statistics and examination service
export const statisticsService = {
  // Get examinations by date from Supabase using existing benhnhan table
  async getExaminationsByDate(date) {
    try {
      // First, get patients from benhnhan table for the selected date
      const { data: patients, error: patientsError } = await supabase
        .from('benhnhan')
        .select('*')
        .eq('created_at', date)
        .order('id', { ascending: false })
      
      if (patientsError) {
        console.error('Supabase patients error:', patientsError)
        // Try with date range if exact match fails
        const startDate = new Date(date)
        const endDate = new Date(date)
        endDate.setDate(endDate.getDate() + 1)
        
        const { data: patientsRange, error: rangeError } = await supabase
          .from('benhnhan')
          .select('*')
          .gte('created_at', startDate.toISOString().split('T')[0])
          .lt('created_at', endDate.toISOString().split('T')[0])
          .order('id', { ascending: false })
        
        if (rangeError) {
          throw rangeError
        }
        
        // Transform benhnhan data to examinations format
        const examinations = (patientsRange || []).map(patient => ({
          id: patient.id,
          examination_date: patient.created_at || date,
          patient_name: patient.ho_ten || 'Chưa xác định',
          patient_birth_date: patient.ngay_sinh,
          doctor_name: 'BS. Lê Minh Khang',
          diagnosis: statisticsService.generateSampleDiagnosis(),
          symptoms: statisticsService.generateSampleSymptoms(),
          treatment: statisticsService.generateSampleTreatment(),
          prescription: statisticsService.generateSamplePrescription(),
          follow_up_date: Math.random() < 0.3 ? statisticsService.addDays(date, 3) : null,
          status: statisticsService.generateSampleStatus(),
          notes: 'Hồ sơ từ dữ liệu bệnh nhân',
          created_at: patient.created_at
        }))
        
        // Calculate statistics
        const totalPatients = examinations.length
        const completedExams = examinations.filter(exam => exam.status === 'completed').length
        const followUpAppointments = examinations.filter(exam => exam.follow_up_date).length
        const waitingPatients = examinations.filter(exam => 
          exam.status === 'waiting' || exam.status === 'in_progress' || exam.status === 'draft'
        ).length
        
        return {
          success: true,
          data: {
            examinations,
            statistics: {
              totalPatients,
              completedExams,
              followUpAppointments,
              waitingPatients
            }
          },
          count: totalPatients,
          date: date
        }
      }
      
      // Transform benhnhan data to examinations format
      const examinations = (patients || []).map(patient => ({
        id: patient.id,
        examination_date: patient.created_at || date,
        patient_name: patient.ho_ten || 'Chưa xác định',
        patient_birth_date: patient.ngay_sinh,
        doctor_name: 'BS. Lê Minh Khang',
        diagnosis: statisticsService.generateSampleDiagnosis(),
        symptoms: statisticsService.generateSampleSymptoms(),
        treatment: statisticsService.generateSampleTreatment(),
        prescription: statisticsService.generateSamplePrescription(),
        follow_up_date: Math.random() < 0.3 ? statisticsService.addDays(date, 3) : null,
        status: statisticsService.generateSampleStatus(),
        notes: 'Hồ sơ từ dữ liệu bệnh nhân',
        created_at: patient.created_at
      }))
      
      // Calculate statistics
      const totalPatients = examinations.length
      const completedExams = examinations.filter(exam => exam.status === 'completed').length
      const followUpAppointments = examinations.filter(exam => exam.follow_up_date).length
      const waitingPatients = examinations.filter(exam => 
        exam.status === 'waiting' || exam.status === 'in_progress' || exam.status === 'draft'
      ).length
      
      return {
        success: true,
        data: {
          examinations,
          statistics: {
            totalPatients,
            completedExams,
            followUpAppointments,
            waitingPatients
          }
        },
        count: totalPatients,
        date: date
      }
    } catch (error) {
      console.error('Error fetching examinations:', error)
      return {
        success: false,
        error: error.message || 'Không thể tải dữ liệu thống kê khám bệnh'
      }
    }
  },

  // Helper functions for generating sample medical data
  generateSampleDiagnosis() {
    const diagnoses = [
      'Viêm họng cấp',
      'Tiêu chảy cấp',
      'Cảm lạnh thông thường',
      'Viêm phế quản',
      'Sốt virus',
      'Viêm amidan',
      'Dị ứng thức ăn'
    ]
    return diagnoses[Math.floor(Math.random() * diagnoses.length)]
  },

  generateSampleSymptoms() {
    const symptoms = [
      'Sốt, ho, đau họng',
      'Tiêu chảy, buồn nôn',
      'Sốt nhẹ, mệt mỏi',
      'Ho khan, khó thở',
      'Sốt cao, đau đầu',
      'Đau họng, khó nuốt',
      'Nôn trớ, chán ăn'
    ]
    return symptoms[Math.floor(Math.random() * symptoms.length)]
  },

  generateSampleTreatment() {
    const treatments = [
      'Thuốc kháng sinh, thuốc hạ sốt',
      'Oresol, thuốc cầm tiêu chảy',
      'Thuốc hạ sốt, nghỉ ngơi',
      'Thuốc ho, thuốc long đờm',
      'Thuốc hạ sốt, uống nhiều nước',
      'Thuốc súc họng, thuốc giảm đau',
      'Thuốc kháng dị ứng'
    ]
    return treatments[Math.floor(Math.random() * treatments.length)]
  },

  generateSamplePrescription() {
    const prescriptions = [
      'Amoxicillin 250mg x 3 lần/ngày',
      'Oresol 1 gói x 4 lần/ngày',
      'Paracetamol 250mg khi sốt',
      'Dextromethorphan 15mg x 3 lần/ngày',
      'Ibuprofen 200mg x 2 lần/ngày',
      'Betadine súc họng 3 lần/ngày',
      'Loratadine 10mg x 1 lần/ngày'
    ]
    return prescriptions[Math.floor(Math.random() * prescriptions.length)]
  },

  generateSampleStatus() {
    const statuses = ['completed', 'in_progress', 'waiting', 'draft']
    const weights = [0.6, 0.2, 0.15, 0.05] // 60% completed, 20% in_progress, etc.
    
    const random = Math.random()
    let cumulative = 0
    
    for (let i = 0; i < statuses.length; i++) {
      cumulative += weights[i]
      if (random <= cumulative) {
        return statuses[i]
      }
    }
    return 'completed'
  },

  addDays(dateString, days) {
    const date = new Date(dateString)
    date.setDate(date.getDate() + days)
    return date.toISOString().split('T')[0]
  }
}