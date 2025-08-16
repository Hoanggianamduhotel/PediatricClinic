<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
      <div class="mt-3">
        <h3 class="text-lg font-medium text-gray-900 mb-4">
          {{ patient ? 'Sửa thông tin bệnh nhân' : 'Thêm bệnh nhân mới' }}
        </h3>
        
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Họ tên bệnh nhân *</label>
              <input
                v-model="form.name"
                type="text"
                required
                class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập họ tên"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Ngày sinh *</label>
              <input
                v-model="form.date_of_birth"
                type="date"
                required
                class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Giới tính *</label>
              <select
                v-model="form.gender"
                required
                class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Chọn giới tính</option>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Họ tên phụ huynh *</label>
              <input
                v-model="form.parent_name"
                type="text"
                required
                class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Họ tên cha/mẹ"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Số điện thoại *</label>
              <input
                v-model="form.phone"
                type="tel"
                required
                class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Số điện thoại liên hệ"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                v-model="form.email"
                type="email"
                class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Email (tùy chọn)"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
            <textarea
              v-model="form.address"
              rows="3"
              class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Địa chỉ liên hệ"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tiền sử bệnh</label>
            <textarea
              v-model="form.medical_history"
              rows="3"
              class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tiền sử bệnh, dị ứng, thuốc đang sử dụng..."
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
import { usePatientsStore } from '@/stores/patients'
import { validatePhone, validateEmail } from '@/utils/validators'

const props = defineProps({
  patient: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'save'])

const patientsStore = usePatientsStore()
const loading = ref(false)
const error = ref('')

const form = ref({
  name: '',
  date_of_birth: '',
  gender: '',
  parent_name: '',
  phone: '',
  email: '',
  address: '',
  medical_history: '',
  notes: ''
})

const validateForm = () => {
  if (!validatePhone(form.value.phone)) {
    error.value = 'Số điện thoại không hợp lệ'
    return false
  }
  
  if (form.value.email && !validateEmail(form.value.email)) {
    error.value = 'Email không hợp lệ'
    return false
  }
  
  return true
}

const handleSubmit = async () => {
  error.value = ''
  
  if (!validateForm()) {
    return
  }
  
  loading.value = true
  
  try {
    let result
    if (props.patient) {
      result = await patientsStore.updatePatient(props.patient.id, form.value)
    } else {
      result = await patientsStore.createPatient(form.value)
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

onMounted(() => {
  if (props.patient) {
    form.value = { ...props.patient }
  }
})
</script>
