<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
      <div class="mt-3">
        <h3 class="text-lg font-medium text-gray-900 mb-4">
          {{ appointment ? 'Sửa lịch hẹn' : 'Đặt lịch hẹn mới' }}
        </h3>
        
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Bệnh nhân *</label>
              <select
                v-model="form.patient_id"
                required
                @change="handlePatientChange"
                class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Chọn bệnh nhân</option>
                <option v-for="patient in patients" :key="patient.id" :value="patient.id">
                  {{ patient.name }} - {{ patient.phone }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Bác sĩ *</label>
              <select
                v-model="form.doctor_id"
                required
                class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Chọn bác sĩ</option>
                <option v-for="doctor in doctors" :key="doctor.id" :value="doctor.id">
                  {{ doctor.name }} - {{ doctor.specialization }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Ngày hẹn *</label>
              <input
                v-model="form.date"
                type="date"
                required
                :min="new Date().toISOString().split('T')[0]"
                @change="checkAvailability"
                class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Giờ hẹn *</label>
              <select
                v-model="form.time"
                required
                @change="checkAvailability"
                class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Chọn giờ</option>
                <option v-for="time in availableTimes" :key="time" :value="time">
                  {{ time }}
                </option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Lý do khám *</label>
            <textarea
              v-model="form.reason"
              rows="3"
              required
              class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Mô tả triệu chứng, lý do khám..."
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
            <textarea
              v-model="form.notes"
              rows="2"
              class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ghi chú thêm..."
            ></textarea>
          </div>

          <div v-if="conflictWarning" class="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <div class="flex">
              <i data-feather="alert-triangle" class="w-5 h-5 text-yellow-400 mr-2"></i>
              <div class="text-sm text-yellow-700">
                {{ conflictWarning }}
              </div>
            </div>
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
              Hủy
            </button>
            <button
              type="submit"
              :disabled="loading || !!conflictWarning"
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
import { ref, computed, onMounted } from 'vue'
import { useAppointmentsStore } from '@/stores/appointments'
import { apiService } from '@/services/api'

const props = defineProps({
  appointment: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'save'])

const appointmentsStore = useAppointmentsStore()
const loading = ref(false)
const error = ref('')
const conflictWarning = ref('')
const patients = ref([])
const doctors = ref([])

const form = ref({
  patient_id: '',
  doctor_id: '',
  date: '',
  time: '',
  reason: '',
  notes: '',
  status: 'scheduled'
})

const availableTimes = computed(() => {
  const times = []
  for (let hour = 8; hour < 17; hour++) {
    for (let minute of ['00', '30']) {
      times.push(`${hour.toString().padStart(2, '0')}:${minute}`)
    }
  }
  return times
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
  if (patient) {
    // You could pre-fill reason based on patient history
  }
}

const checkAvailability = async () => {
  conflictWarning.value = ''
  
  if (!form.value.date || !form.value.time || !form.value.doctor_id) {
    return
  }
  
  try {
    const response = await apiService.get('/appointments/check-availability', {
      params: {
        date: form.value.date,
        time: form.value.time,
        doctor_id: form.value.doctor_id,
        exclude_id: props.appointment?.id
      }
    })
    
    if (!response.available) {
      conflictWarning.value = 'Thời gian này đã có lịch hẹn khác. Vui lòng chọn thời gian khác.'
    }
  } catch (error) {
    console.error('Error checking availability:', error)
  }
}

const handleSubmit = async () => {
  error.value = ''
  
  if (conflictWarning.value) {
    error.value = 'Vui lòng giải quyết xung đột thời gian trước khi lưu'
    return
  }
  
  loading.value = true
  
  try {
    let result
    if (props.appointment) {
      result = await appointmentsStore.updateAppointment(props.appointment.id, form.value)
    } else {
      result = await appointmentsStore.createAppointment(form.value)
    }
    
    if (result.success) {
      emit('save')
    } else {
      error.value = result.error
    }
  } catch (err) {
    error.value = 'Đã có lỗi xảy ra'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await Promise.all([fetchPatients(), fetchDoctors()])
  
  if (props.appointment) {
    form.value = { ...props.appointment }
  }
  
  if (window.feather) {
    window.feather.replace()
  }
})
</script>
