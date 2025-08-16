<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
      <div class="mt-3">
        <h3 class="text-lg font-medium text-gray-900 mb-4">
          {{ viewOnly ? 'Xem hồ sơ bệnh án' : (record ? 'Sửa hồ sơ bệnh án' : 'Tạo hồ sơ bệnh án mới') }}
        </h3>
        
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Patient and Basic Info -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Bệnh nhân *</label>
              <select
                v-model="form.patient_id"
                :disabled="viewOnly"
                required
                @change="handlePatientChange"
                class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">Chọn bệnh nhân</option>
                <option v-for="patient in patients" :key="patient.id" :value="patient.id">
                  {{ patient.name }} - {{ patient.phone }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Bác sĩ khám *</label>
              <select
                v-model="form.doctor_id"
                :disabled="viewOnly"
                required
                class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">Chọn bác sĩ</option>
                <option v-for="doctor in doctors" :key="doctor.id" :value="doctor.id">
                  {{ doctor.name }} - {{ doctor.specialization }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Ngày khám *</label>
              <input
                v-model="form.visit_date"
                :disabled="viewOnly"
                type="date"
                required
                class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
          </div>

          <!-- Vital Signs -->
          <div>
            <h4 class="text-md font-medium text-gray-900 mb-3">Sinh hiệu</h4>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Cân nặng (kg)</label>
                <input
                  v-model="form.weight"
                  :disabled="viewOnly"
                  type="number"
                  step="0.1"
                  min="0"
                  class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Chiều cao (cm)</label>
                <input
                  v-model="form.height"
                  :disabled="viewOnly"
                  type="number"
                  step="0.1"
                  min="0"
                  class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nhiệt độ (°C)</label>
                <input
                  v-model="form.temperature"
                  :disabled="viewOnly"
                  type="number"
                  step="0.1"
                  min="30"
                  max="45"
                  class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Huyết áp</label>
                <input
                  v-model="form.blood_pressure"
                  :disabled="viewOnly"
                  type="text"
                  placeholder="120/80"
                  class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
            </div>
          </div>

          <!-- Symptoms and Examination -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Triệu chứng *</label>
              <textarea
                v-model="form.symptoms"
                :disabled="viewOnly"
                rows="4"
                required
                class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                placeholder="Mô tả chi tiết triệu chứng..."
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Khám lâm sàng</label>
              <textarea
                v-model="form.examination"
                :disabled="viewOnly"
                rows="4"
                class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                placeholder="Kết quả khám lâm sàng..."
              ></textarea>
            </div>
          </div>

          <!-- Diagnosis -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Chẩn đoán *</label>
            <textarea
              v-model="form.diagnosis"
              :disabled="viewOnly"
              rows="3"
              required
              class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="Chẩn đoán bệnh..."
            ></textarea>
          </div>

          <!-- Treatment and Prescription -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Điều trị</label>
              <textarea
                v-model="form.treatment"
                :disabled="viewOnly"
                rows="4"
                class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                placeholder="Phương pháp điều trị..."
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Đơn thuốc</label>
              <textarea
                v-model="form.prescription"
                :disabled="viewOnly"
                rows="4"
                class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                placeholder="Tên thuốc, liều dùng, cách dùng..."
              ></textarea>
            </div>
          </div>

          <!-- Follow-up and Notes -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Ngày tái khám</label>
              <input
                v-model="form.follow_up_date"
                :disabled="viewOnly"
                type="date"
                class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
              <select
                v-model="form.status"
                :disabled="viewOnly"
                class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="draft">Nháp</option>
                <option value="completed">Hoàn thành</option>
                <option value="pending">Chờ xử lý</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
            <textarea
              v-model="form.notes"
              :disabled="viewOnly"
              rows="3"
              class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="Ghi chú thêm..."
            ></textarea>
          </div>

          <div v-if="error" class="text-red-600 text-sm">
            {{ error }}
          </div>

          <div class="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              @click="$emit('close')"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              {{ viewOnly ? 'Đóng' : 'Hủy' }}
            </button>
            <button
              v-if="!viewOnly"
              type="submit"
              :disabled="loading"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {{ loading ? 'Đang lưu...' : 'Lưu' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { apiService } from '@/services/api'

const props = defineProps({
  record: {
    type: Object,
    default: null
  },
  viewOnly: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'save'])

const loading = ref(false)
const error = ref('')
const patients = ref([])
const doctors = ref([])

const form = ref({
  patient_id: '',
  doctor_id: '',
  visit_date: new Date().toISOString().split('T')[0],
  weight: '',
  height: '',
  temperature: '',
  blood_pressure: '',
  symptoms: '',
  examination: '',
  diagnosis: '',
  treatment: '',
  prescription: '',
  follow_up_date: '',
  notes: '',
  status: 'draft'
})

const fetchPatients = async () => {
  try {
    const response = await apiService.get('/patients')
    patients.value = response.data
  } catch (error) {
    console.error('Error fetching patients:', error)
  }
}

const fetchDoctors = async () => {
  try {
    const response = await apiService.get('/staff?role=doctor')
    doctors.value = response.data
  } catch (error) {
    console.error('Error fetching doctors:', error)
  }
}

const handlePatientChange = () => {
  const patient = patients.value.find(p => p.id === form.value.patient_id)
  if (patient && patient.medical_history) {
    // You could pre-fill some information based on patient history
  }
}

const handleSubmit = async () => {
  if (props.viewOnly) return
  
  error.value = ''
  loading.value = true
  
  try {
    let response
    if (props.record) {
      response = await apiService.put(`/medical-records/${props.record.id}`, form.value)
    } else {
      response = await apiService.post('/medical-records', form.value)
    }
    
    emit('save')
  } catch (err) {
    error.value = err.response?.data?.message || 'Đã có lỗi xảy ra'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await Promise.all([fetchPatients(), fetchDoctors()])
  
  if (props.record) {
    form.value = { ...props.record }
  }
})
</script>
