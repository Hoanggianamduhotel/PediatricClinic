import axios from 'axios'

class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor to handle errors globally
    this.client.interceptors.response.use(
      (response) => {
        return response.data
      },
      (error) => {
        if (error.response) {
          // Server responded with error status
          const { status, data } = error.response
          
          if (status === 401) {
            // Unauthorized - clear token and redirect to login
            localStorage.removeItem('token')
            window.location.href = '/login'
            return Promise.reject(new Error('Phiên đăng nhập đã hết hạn'))
          }
          
          if (status === 403) {
            return Promise.reject(new Error('Bạn không có quyền thực hiện thao tác này'))
          }
          
          if (status === 404) {
            return Promise.reject(new Error('Không tìm thấy dữ liệu'))
          }
          
          if (status === 422) {
            const message = data.message || 'Dữ liệu không hợp lệ'
            return Promise.reject(new Error(message))
          }
          
          if (status >= 500) {
            return Promise.reject(new Error('Lỗi máy chủ. Vui lòng thử lại sau'))
          }
          
          return Promise.reject(new Error(data.message || 'Đã có lỗi xảy ra'))
        } else if (error.request) {
          // Network error
          return Promise.reject(new Error('Không thể kết nối đến máy chủ'))
        } else {
          return Promise.reject(error)
        }
      }
    )
  }

  // Generic HTTP methods
  async get(url, params = {}) {
    return this.client.get(url, { params })
  }

  async post(url, data = {}) {
    return this.client.post(url, data)
  }

  async put(url, data = {}) {
    return this.client.put(url, data)
  }

  async patch(url, data = {}) {
    return this.client.patch(url, data)
  }

  async delete(url) {
    return this.client.delete(url)
  }

  // Authentication methods
  async login(credentials) {
    return this.post('/auth/login', credentials)
  }

  async register(userData) {
    return this.post('/auth/register', userData)
  }

  async getCurrentUser() {
    return this.get('/auth/me')
  }

  async changePassword(passwordData) {
    return this.post('/auth/change-password', passwordData)
  }

  // Patient methods
  async getPatients(params = {}) {
    return this.get('/patients', params)
  }

  async getPatient(id) {
    return this.get(`/patients/${id}`)
  }

  async createPatient(patientData) {
    return this.post('/patients', patientData)
  }

  async updatePatient(id, patientData) {
    return this.put(`/patients/${id}`, patientData)
  }

  async deletePatient(id) {
    return this.delete(`/patients/${id}`)
  }

  async searchPatients(query) {
    return this.get('/patients/search', { q: query })
  }

  // Appointment methods
  async getAppointments(params = {}) {
    return this.get('/appointments', params)
  }

  async getAppointment(id) {
    return this.get(`/appointments/${id}`)
  }

  async createAppointment(appointmentData) {
    return this.post('/appointments', appointmentData)
  }

  async updateAppointment(id, appointmentData) {
    return this.put(`/appointments/${id}`, appointmentData)
  }

  async deleteAppointment(id) {
    return this.delete(`/appointments/${id}`)
  }

  async checkInAppointment(id) {
    return this.patch(`/appointments/${id}/checkin`)
  }

  async checkAppointmentAvailability(params) {
    return this.get('/appointments/check-availability', params)
  }

  // Medical Records methods
  async getMedicalRecords(params = {}) {
    return this.get('/medical-records', params)
  }

  async getMedicalRecord(id) {
    return this.get(`/medical-records/${id}`)
  }

  async createMedicalRecord(recordData) {
    return this.post('/medical-records', recordData)
  }

  async updateMedicalRecord(id, recordData) {
    return this.put(`/medical-records/${id}`, recordData)
  }

  async deleteMedicalRecord(id) {
    return this.delete(`/medical-records/${id}`)
  }

  // Staff methods
  async getStaff(params = {}) {
    return this.get('/staff', params)
  }

  async getStaffMember(id) {
    return this.get(`/staff/${id}`)
  }

  async createStaffMember(staffData) {
    return this.post('/staff', staffData)
  }

  async updateStaffMember(id, staffData) {
    return this.put(`/staff/${id}`, staffData)
  }

  async deleteStaffMember(id) {
    return this.delete(`/staff/${id}`)
  }

  // Billing methods
  async getInvoices(params = {}) {
    return this.get('/billing', params)
  }

  async getInvoice(id) {
    return this.get(`/billing/${id}`)
  }

  async createInvoice(invoiceData) {
    return this.post('/billing', invoiceData)
  }

  async updateInvoice(id, invoiceData) {
    return this.put(`/billing/${id}`, invoiceData)
  }

  async deleteInvoice(id) {
    return this.delete(`/billing/${id}`)
  }

  async markInvoiceAsPaid(id) {
    return this.patch(`/billing/${id}/pay`)
  }

  async getBillingStats() {
    return this.get('/billing/stats')
  }

  // Dashboard methods
  async getDashboardStats() {
    return this.get('/dashboard/stats')
  }

  async getTodayStats() {
    return this.get('/dashboard/today-stats')
  }

  // File upload methods
  async uploadFile(file, type = 'general') {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)
    
    return this.client.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }

  // Reports methods
  async generateReport(type, params = {}) {
    return this.get(`/reports/${type}`, params)
  }

  async exportData(type, params = {}) {
    return this.client.get(`/export/${type}`, {
      params,
      responseType: 'blob'
    })
  }
}

export const apiService = new ApiService()
