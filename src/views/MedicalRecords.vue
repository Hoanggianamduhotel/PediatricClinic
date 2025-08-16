<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Hồ sơ bệnh án</h1>
        <p class="text-gray-600">Quản lý hồ sơ y tế bệnh nhân</p>
      </div>
      <button
        @click="showForm = true"
        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
      >
        <i data-feather="plus" class="w-4 h-4 mr-2"></i>
        Tạo hồ sơ mới
      </button>
    </div>

    <!-- Search and Filter -->
    <div class="mb-6 bg-white p-4 rounded-lg shadow">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm bệnh nhân</label>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Tên bệnh nhân..."
            @input="handleSearch"
            class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Từ ngày</label>
          <input
            v-model="dateFrom"
            type="date"
            @change="handleFilter"
            class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Đến ngày</label>
          <input
            v-model="dateTo"
            type="date"
            @change="handleFilter"
            class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>

    <!-- Medical Records List -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bệnh nhân
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ngày khám
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Chẩn đoán
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bác sĩ
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="loading">
              <td colspan="6" class="px-6 py-4 text-center text-gray-500">
                Đang tải...
              </td>
            </tr>
            <tr v-else-if="medicalRecords.length === 0">
              <td colspan="6" class="px-6 py-4 text-center text-gray-500">
                Không tìm thấy hồ sơ nào
              </td>
            </tr>
            <tr v-for="record in medicalRecords" :key="record.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <div class="text-sm font-medium text-gray-900">{{ record.patient_name }}</div>
                  <div class="text-sm text-gray-500">{{ record.patient_age }} tuổi</div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatDate(record.visit_date) }}
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-900">{{ record.diagnosis }}</div>
                <div class="text-sm text-gray-500">{{ record.symptoms }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ record.doctor_name }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="getRecordStatusClass(record.status)"
                  class="px-2 py-1 text-xs font-medium rounded-full"
                >
                  {{ getRecordStatusText(record.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  @click="viewRecord(record)"
                  class="text-blue-600 hover:text-blue-900 mr-3"
                >
                  Xem
                </button>
                <button
                  @click="editRecord(record)"
                  class="text-green-600 hover:text-green-900 mr-3"
                >
                  Sửa
                </button>
                <button
                  @click="deleteRecord(record.id)"
                  class="text-red-600 hover:text-red-900"
                >
                  Xóa
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Medical Record Form Modal -->
    <MedicalRecordForm
      v-if="showForm"
      :record="selectedRecord"
      :view-only="viewOnly"
      @close="closeForm"
      @save="handleSave"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { apiService } from '@/services/api'
import MedicalRecordForm from '@/components/MedicalRecordForm.vue'
import { formatDate } from '@/utils/dateUtils'

const medicalRecords = ref([])
const loading = ref(false)
const showForm = ref(false)
const selectedRecord = ref(null)
const viewOnly = ref(false)
const searchQuery = ref('')
const dateFrom = ref('')
const dateTo = ref('')

const fetchMedicalRecords = async (params = {}) => {
  loading.value = true
  try {
    const queryParams = new URLSearchParams(params).toString()
    const response = await apiService.get(`/medical-records?${queryParams}`)
    medicalRecords.value = response.data
  } catch (error) {
    console.error('Error fetching medical records:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  const params = {}
  if (searchQuery.value.trim()) {
    params.search = searchQuery.value.trim()
  }
  if (dateFrom.value) params.dateFrom = dateFrom.value
  if (dateTo.value) params.dateTo = dateTo.value
  
  fetchMedicalRecords(params)
}

const handleFilter = () => {
  handleSearch()
}

const viewRecord = (record) => {
  selectedRecord.value = record
  viewOnly.value = true
  showForm.value = true
}

const editRecord = (record) => {
  selectedRecord.value = record
  viewOnly.value = false
  showForm.value = true
}

const deleteRecord = async (id) => {
  if (confirm('Bạn có chắc chắn muốn xóa hồ sơ này?')) {
    try {
      await apiService.delete(`/medical-records/${id}`)
      await fetchMedicalRecords()
    } catch (error) {
      alert('Lỗi: ' + error.message)
    }
  }
}

const closeForm = () => {
  showForm.value = false
  selectedRecord.value = null
  viewOnly.value = false
}

const handleSave = () => {
  closeForm()
  fetchMedicalRecords()
}

const getRecordStatusClass = (status) => {
  const classes = {
    draft: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    pending: 'bg-blue-100 text-blue-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getRecordStatusText = (status) => {
  const texts = {
    draft: 'Nháp',
    completed: 'Hoàn thành',
    pending: 'Chờ xử lý'
  }
  return texts[status] || status
}

onMounted(async () => {
  await fetchMedicalRecords()
  
  if (window.feather) {
    window.feather.replace()
  }
})
</script>
