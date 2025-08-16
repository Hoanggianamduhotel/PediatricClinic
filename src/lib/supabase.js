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

// Follow-up appointment service
export const followUpService = {
  async getFollowUpStats() {
    try {
      const today = new Date().toISOString().split('T')[0]
      
      // Get follow-up appointments for today with join
      const { data: todayFollowUps, error: todayError } = await supabase
        .from('khambenh')
        .select(`
          id,
          benhnhan:benhnhan_id (
            id,
            ho_ten,
            ngay_sinh
          ),
          ngay_kham,
          chan_doan,
          so_ngay_toa
        `)
        .eq('ngay_hen_tai_kham', today)
      
      if (todayError) throw todayError

      // Get all upcoming follow-up appointments (future dates)
      const { data: upcomingFollowUps, error: upcomingError } = await supabase
        .from('khambenh')
        .select('id')
        .gt('ngay_hen_tai_kham', today)
      
      if (upcomingError) throw upcomingError

      // Get overdue follow-up appointments (past dates)
      const { data: overdueFollowUps, error: overdueError } = await supabase
        .from('khambenh')
        .select('id')
        .lt('ngay_hen_tai_kham', today)
        .not('ngay_hen_tai_kham', 'is', null)
      
      if (overdueError) throw overdueError

      return {
        success: true,
        data: {
          today: todayFollowUps?.length || 0,
          upcoming: upcomingFollowUps?.length || 0,
          overdue: overdueFollowUps?.length || 0
        }
      }
    } catch (error) {
      console.error('Get follow-up stats error:', error)
      return {
        success: false,
        error: error.message || 'Không thể lấy thống kê hẹn tái khám'
      }
    }
  },

  async getFollowUpAppointments(type = 'today') {
    try {
      const today = new Date().toISOString().split('T')[0]
      let query = supabase
        .from('khambenh')
        .select(`
          id,
          ngay_hen_tai_kham,
          ngay_kham,
          chan_doan,
          so_ngay_toa,
          benhnhan:benhnhan_id (
            id,
            ho_ten,
            ngay_sinh,
            so_dien_thoai
          )
        `)
        .not('ngay_hen_tai_kham', 'is', null)

      switch (type) {
        case 'today':
          query = query.eq('ngay_hen_tai_kham', today)
          break
        case 'upcoming':
          query = query.gt('ngay_hen_tai_kham', today)
          break
        case 'overdue':
          query = query.lt('ngay_hen_tai_kham', today)
          break
      }

      const { data, error } = await query.order('ngay_hen_tai_kham', { ascending: true })
      
      if (error) throw error

      return {
        success: true,
        data: data || []
      }
    } catch (error) {
      console.error('Get follow-up appointments error:', error)
      return {
        success: false,
        error: error.message || 'Không thể lấy danh sách hẹn tái khám'
      }
    }
  }
}

// Export services
export { patientService, waitingListService, followUpService }