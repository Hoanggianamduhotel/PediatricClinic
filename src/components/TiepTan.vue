<template>
  <div class="tiep-tan">
    <!-- Main Actions -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <!-- New Patient Card -->
      <div class="card">
        <div class="card-header">
          <h2 class="text-lg font-semibold text-gray-900 flex items-center">
            <svg class="h-5 w-5 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Thêm Bệnh Nhân Mới
          </h2>
        </div>
        <div class="card-body">
          <p class="text-gray-600 mb-4">Đăng ký thông tin bệnh nhân mới vào hệ thống</p>
          <button @click="showAddPatientDialog = true" class="btn btn-success w-full">
            <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Thêm Bệnh Nhân
          </button>
        </div>
      </div>

      <!-- Search Patient Card -->
      <div class="card">
        <div class="card-header">
          <h2 class="text-lg font-semibold text-gray-900 flex items-center">
            <svg class="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Tìm Bệnh Cũ
          </h2>
        </div>
        <div class="card-body">
          <div class="relative">
            <input
              v-model="searchQuery"
              @input="searchPatients"
              type="text"
              placeholder="Nhập tên bệnh nhân (VD: đinh minh)"
              class="form-input w-full pl-10"
            >
            <svg class="h-5 w-5 text-gray-400 absolute left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <!-- Search Results -->
          <div v-if="searchResults.length > 0" class="mt-4 max-h-64 overflow-y-auto border rounded-lg">
            <div 
              v-for="patient in searchResults" 
              :key="patient.id"
              @click="selectPatient(patient)"
              class="p-3 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
            >
              <div class="font-medium text-gray-900">{{ patient.ho_ten }}</div>
              <div class="text-sm text-gray-500">
                <span v-if="patient.ngay_sinh">{{ formatDate(patient.ngay_sinh) }}</span>
                <span v-if="patient.so_dien_thoai" class="ml-2">{{ patient.so_dien_thoai }}</span>
              </div>
            </div>
          </div>
          
          <!-- No Results -->
          <div v-else-if="searchQuery && !isSearching" class="mt-4 text-center text-gray-500 py-4">
            Không tìm thấy bệnh nhân nào
          </div>
          
          <!-- Loading -->
          <div v-if="isSearching" class="mt-4 text-center text-gray-500 py-4">
            Đang tìm kiếm...
          </div>
        </div>
      </div>
    </div>

    <!-- Add Patient Dialog -->
    <div v-if="showAddPatientDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between p-6 border-b">
          <h3 class="text-lg font-semibold text-gray-900">Thêm Bệnh Nhân Mới</h3>
          <button @click="closeAddPatientDialog" class="text-gray-400 hover:text-gray-600">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form @submit.prevent="addPatient" class="p-6 space-y-4">
          <div>
            <label class="form-label">Họ Tên *</label>
            <input
              v-model="newPatient.ho_ten"
              type="text"
              required
              class="form-input"
              placeholder="Nhập họ tên đầy đủ"
            >
          </div>
          
          <div>
            <label class="form-label">Ngày Sinh</label>
            <input
              v-model="newPatient.ngay_sinh"
              type="date"
              class="form-input"
            >
          </div>
          
          <div>
            <label class="form-label">Giới Tính</label>
            <select v-model="newPatient.gioi_tinh" class="form-input">
              <option value="">-- Chọn giới tính --</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>
          </div>
          
          <div>
            <label class="form-label">Cân Nặng (kg)</label>
            <input
              v-model="newPatient.can_nang"
              type="number"
              step="0.1"
              class="form-input"
              placeholder="VD: 15.5"
            >
          </div>
          
          <div>
            <label class="form-label">Địa Chỉ</label>
            <textarea
              v-model="newPatient.dia_chi"
              class="form-input"
              rows="2"
              placeholder="Nhập địa chỉ đầy đủ"
            ></textarea>
          </div>
          
          <div>
            <label class="form-label">Số Điện Thoại</label>
            <input
              v-model="newPatient.so_dien_thoai"
              type="tel"
              class="form-input"
              placeholder="0123456789"
            >
          </div>
          
          <div class="flex justify-end space-x-3 pt-4">
            <button type="button" @click="closeAddPatientDialog" class="btn btn-secondary">
              Hủy
            </button>
            <button type="submit" :disabled="isSubmitting" class="btn btn-success">
              <span v-if="isSubmitting">Đang lưu...</span>
              <span v-else>Lưu Bệnh Nhân</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Selected Patient Details -->
    <div v-if="selectedPatient" class="card">
      <div class="card-header">
        <h3 class="text-lg font-semibold text-gray-900">Thông Tin Bệnh Nhân</h3>
      </div>
      <div class="card-body">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-500">Họ Tên</label>
            <p class="text-lg font-semibold text-gray-900">{{ selectedPatient.ho_ten }}</p>
          </div>
          <div v-if="selectedPatient.ngay_sinh">
            <label class="text-sm font-medium text-gray-500">Ngày Sinh</label>
            <p class="text-gray-900">{{ formatDate(selectedPatient.ngay_sinh) }}</p>
          </div>
          <div v-if="selectedPatient.gioi_tinh">
            <label class="text-sm font-medium text-gray-500">Giới Tính</label>
            <p class="text-gray-900">{{ selectedPatient.gioi_tinh }}</p>
          </div>
          <div v-if="selectedPatient.can_nang">
            <label class="text-sm font-medium text-gray-500">Cân Nặng</label>
            <p class="text-gray-900">{{ selectedPatient.can_nang }} kg</p>
          </div>
          <div v-if="selectedPatient.so_dien_thoai">
            <label class="text-sm font-medium text-gray-500">Số Điện Thoại</label>
            <p class="text-gray-900">{{ selectedPatient.so_dien_thoai }}</p>
          </div>
          <div v-if="selectedPatient.dia_chi">
            <label class="text-sm font-medium text-gray-500">Địa Chỉ</label>
            <p class="text-gray-900">{{ selectedPatient.dia_chi }}</p>
          </div>
        </div>
        <div class="mt-4 pt-4 border-t">
          <button @click="selectedPatient = null" class="btn btn-secondary">
            Đóng
          </button>
        </div>
      </div>
    </div>

    <!-- Success/Error Messages -->
    <div v-if="message" :class="[
      'fixed top-4 right-4 p-4 rounded-md shadow-lg z-50',
      message.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'
    ]">
      {{ message.text }}
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import axios from 'axios'

export default {
  name: 'TiepTan',
  setup() {
    const showAddPatientDialog = ref(false)
    const searchQuery = ref('')
    const searchResults = ref([])
    const selectedPatient = ref(null)
    const isSearching = ref(false)
    const isSubmitting = ref(false)
    const message = ref(null)
    
    const newPatient = ref({
      ho_ten: '',
      ngay_sinh: '',
      gioi_tinh: '',
      can_nang: '',
      dia_chi: '',
      so_dien_thoai: ''
    })

    // Setup axios defaults
    const api = axios.create({
      baseURL: '/api'
    })

    const showMessage = (text, type = 'success') => {
      message.value = { text, type }
      setTimeout(() => {
        message.value = null
      }, 5000)
    }

    const closeAddPatientDialog = () => {
      showAddPatientDialog.value = false
      newPatient.value = {
        ho_ten: '',
        ngay_sinh: '',
        gioi_tinh: '',
        can_nang: '',
        dia_chi: '',
        so_dien_thoai: ''
      }
    }

    const addPatient = async () => {
      try {
        isSubmitting.value = true
        const response = await api.post('/benhnhan', newPatient.value)
        
        if (response.data.success) {
          showMessage('Thêm bệnh nhân thành công!')
          closeAddPatientDialog()
        } else {
          showMessage(response.data.message || 'Có lỗi xảy ra', 'error')
        }
      } catch (error) {
        console.error('Add patient error:', error)
        showMessage(error.response?.data?.message || 'Không thể thêm bệnh nhân', 'error')
      } finally {
        isSubmitting.value = false
      }
    }

    const searchPatients = async () => {
      if (!searchQuery.value.trim()) {
        searchResults.value = []
        return
      }

      try {
        isSearching.value = true
        const response = await api.get(`/benhnhan?search=${encodeURIComponent(searchQuery.value)}`)
        
        if (response.data.success) {
          searchResults.value = response.data.data
        } else {
          searchResults.value = []
        }
      } catch (error) {
        console.error('Search patients error:', error)
        searchResults.value = []
        showMessage('Không thể tìm kiếm bệnh nhân', 'error')
      } finally {
        isSearching.value = false
      }
    }

    const selectPatient = (patient) => {
      selectedPatient.value = patient
      searchQuery.value = ''
      searchResults.value = []
    }

    const formatDate = (dateString) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    return {
      showAddPatientDialog,
      searchQuery,
      searchResults,
      selectedPatient,
      isSearching,
      isSubmitting,
      message,
      newPatient,
      closeAddPatientDialog,
      addPatient,
      searchPatients,
      selectPatient,
      formatDate
    }
  }
}
</script>