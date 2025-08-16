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