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

// Statistics and examination service using proper backend API
export const statisticsService = {
  // Get examinations by date using backend API
  async getExaminationsByDate(date) {
    try {
      console.log('Fetching examinations for date:', date)
      
      // Use the proper backend API endpoint
      const response = await fetch(`http://localhost:10000/api/examinations/${date}`)
      
      if (!response.ok) {
        // If API fails, try direct Supabase query as fallback
        return await this.getExaminationsFromSupabase(date)
      }
      
      const examinations = await response.json()
      
      // Calculate statistics from the examination data
      const totalPatients = examinations.length
      const completedExams = examinations.filter(exam => exam.status === 'completed').length
      const followUpAppointments = examinations.filter(exam => exam.ngay_hen_tai_kham).length
      const waitingPatients = examinations.filter(exam => 
        exam.status === 'waiting' || exam.status === 'in_progress' || exam.status === 'draft'
      ).length
      
      // Transform data to match frontend format
      const transformedExaminations = examinations.map(exam => ({
        id: exam.id,
        examination_date: exam.ngay_kham,
        patient_name: exam.ho_ten,
        patient_birth_date: exam.ngay_sinh,
        doctor_name: exam.ten_bacsi || 'BS. Lê Minh Khang',
        diagnosis: exam.chan_doan,
        symptoms: exam.trieu_chung,
        treatment: `Kê toa ${exam.so_ngay_toa || 0} ngày`,
        prescription: `Toa thuốc ${exam.so_ngay_toa || 0} ngày`,
        follow_up_date: exam.ngay_hen_tai_kham,
        status: exam.status || 'completed',
        notes: `Khám ngày ${exam.ngay_kham}`,
        created_at: exam.created_at,
        patient_info: {
          age: exam.tuoi,
          weight: exam.can_nang
        }
      }))
      
      console.log('API response statistics:', { totalPatients, completedExams, followUpAppointments, waitingPatients })
      
      return {
        success: true,
        data: {
          examinations: transformedExaminations,
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
      console.error('Error fetching examinations from API:', error)
      // Fallback to direct Supabase query
      return await this.getExaminationsFromSupabase(date)
    }
  },

  // Fallback method using direct Supabase query
  async getExaminationsFromSupabase(date) {
    try {
      // Query khambenh table with patient info
      const { data: examinations, error } = await supabase
        .from('khambenh')
        .select(`
          *,
          benhnhan:benhnhan_id (
            ho_ten,
            ngay_sinh,
            can_nang
          )
        `)
        .eq('ngay_kham', date)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Supabase query error:', error)
        throw error
      }
      
      // Transform data to match expected format
      const transformedExaminations = (examinations || []).map(exam => {
        const patient = exam.benhnhan || {}
        const age = patient.ngay_sinh ? this.calculateAge(patient.ngay_sinh) : 0
        
        return {
          id: exam.id,
          examination_date: exam.ngay_kham,
          patient_name: patient.ho_ten || 'Chưa xác định',
          patient_birth_date: patient.ngay_sinh,
          doctor_name: exam.ten_bacsi || 'BS. Lê Minh Khang',
          diagnosis: exam.chan_doan,
          symptoms: exam.trieu_chung,
          treatment: `Kê toa ${exam.so_ngay_toa || 0} ngày`,
          prescription: `Toa thuốc ${exam.so_ngay_toa || 0} ngày`,
          follow_up_date: exam.ngay_hen_tai_kham,
          status: exam.status || 'completed',
          notes: `Khám ngày ${exam.ngay_kham}`,
          created_at: exam.created_at,
          patient_info: {
            age: age,
            weight: patient.can_nang
          }
        }
      })
      
      // Calculate statistics
      const totalPatients = transformedExaminations.length
      const completedExams = transformedExaminations.filter(exam => exam.status === 'completed').length
      const followUpAppointments = transformedExaminations.filter(exam => exam.follow_up_date).length
      const waitingPatients = transformedExaminations.filter(exam => 
        exam.status === 'waiting' || exam.status === 'in_progress' || exam.status === 'draft'
      ).length
      
      console.log('Supabase fallback statistics:', { totalPatients, completedExams, followUpAppointments, waitingPatients })
      
      return {
        success: true,
        data: {
          examinations: transformedExaminations,
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
      console.error('Error in Supabase fallback:', error)
      return {
        success: false,
        error: error.message || 'Không thể tải dữ liệu thống kê khám bệnh'
      }
    }
  },

  // Calculate age from birth date
  calculateAge(birthDate) {
    const birth = new Date(birthDate)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    
    return age
  },

  // Add days utility function
  addDays(dateString, days) {
    const date = new Date(dateString)
    date.setDate(date.getDate() + days)
    return date.toISOString().split('T')[0]
  }
}