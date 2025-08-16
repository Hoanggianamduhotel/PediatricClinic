<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Quản lý nhân viên</h1>
        <p class="text-gray-600">Danh sách bác sĩ và nhân viên</p>
      </div>
      <button
        @click="showForm = true"
        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
      >
        <i data-feather="plus" class="w-4 h-4 mr-2"></i>
        Thêm nhân viên
      </button>
    </div>

    <!-- Staff List -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-if="loading" class="col-span-full text-center text-gray-500 py-8">
        Đang tải...
      </div>
      <div v-else-if="staff.length === 0" class="col-span-full text-center text-gray-500 py-8">
        Chưa có nhân viên nào
      </div>
      <div
        v-for="member in staff"
        :key="member.id"
        class="bg-white rounded-lg shadow p-6"
      >
        <div class="flex items-center space-x-4">
          <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <i data-feather="user" class="w-8 h-8 text-blue-600"></i>
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-900">{{ member.name }}</h3>
            <p class="text-sm text-gray-600">{{ getRoleText(member.role) }}</p>
            <p class="text-sm text-gray-500">{{ member.specialization }}</p>
          </div>
        </div>
        
        <div class="mt-4 space-y-2">
          <div class="flex items-center text-sm text-gray-600">
            <i data-feather="mail" class="w-4 h-4 mr-2"></i>
            {{ member.email }}
          </div>
          <div class="flex items-center text-sm text-gray-600">
            <i data-feather="phone" class="w-4 h-4 mr-2"></i>
            {{ member.phone }}
          </div>
          <div class="flex items-center text-sm text-gray-600">
            <i data-feather="calendar" class="w-4 h-4 mr-2"></i>
            Làm việc từ {{ formatDate(member.hire_date) }}
          </div>
        </div>

        <div class="mt-4 flex items-center justify-between">
          <span
            :class="getStatusClass(member.status)"
            class="px-2 py-1 text-xs font-medium rounded-full"
          >
            {{ getStatusText(member.status) }}
          </span>
          <div class="flex space-x-2">
            <button
              @click="editStaff(member)"
              class="text-blue-600 hover:text-blue-800 text-sm"
            >
              Sửa
            </button>
            <button
              @click="deleteStaff(member.id)"
              class="text-red-600 hover:text-red-800 text-sm"
            >
              Xóa
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Staff Form Modal -->
    <div
      v-if="showForm"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    >
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            {{ selectedStaff ? 'Sửa thông tin nhân viên' : 'Thêm nhân viên mới' }}
          </h3>
          
          <form @submit.prevent="handleSave" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Họ tên</label>
              <input
                v-model="form.name"
                type="text"
                required
                class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                v-model="form.email"
                type="email"
                required
                class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Điện thoại</label>
              <input
                v-model="form.phone"
                type="tel"
                required
                class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
              <select
                v-model="form.role"
                required
                class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Chọn vai trò</option>
                <option value="doctor">Bác sĩ</option>
                <option value="nurse">Y tá</option>
                <option value="receptionist">Lễ tân</option>
                <option value="admin">Quản trị viên</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Chuyên khoa</label>
              <input
                v-model="form.specialization"
                type="text"
                class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu làm việc</label>
              <input
                v-model="form.hire_date"
                type="date"
                required
                class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
              <select
                v-model="form.status"
                required
                class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Đang làm việc</option>
                <option value="inactive">Tạm nghỉ</option>
                <option value="terminated">Đã nghỉ việc</option>
              </select>
            </div>

            <div class="flex justify-end space-x-2 pt-4">
              <button
                type="button"
                @click="closeForm"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Hủy
              </button>
              <button
                type="submit"
                :disabled="saving"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {{ saving ? 'Đang lưu...' : 'Lưu' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { apiService } from '@/services/api'
import { formatDate } from '@/utils/dateUtils'

const staff = ref([])
const loading = ref(false)
const saving = ref(false)
const showForm = ref(false)
const selectedStaff = ref(null)

const form = ref({
  name: '',
  email: '',
  phone: '',
  role: '',
  specialization: '',
  hire_date: '',
  status: 'active'
})

const fetchStaff = async () => {
  loading.value = true
  try {
    const response = await apiService.get('/staff')
    staff.value = response.data
  } catch (error) {
    console.error('Error fetching staff:', error)
  } finally {
    loading.value = false
  }
}

const editStaff = (member) => {
  selectedStaff.value = member
  form.value = { ...member }
  showForm.value = true
}

const deleteStaff = async (id) => {
  if (confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) {
    try {
      await apiService.delete(`/staff/${id}`)
      await fetchStaff()
    } catch (error) {
      alert('Lỗi: ' + error.message)
    }
  }
}

const handleSave = async () => {
  saving.value = true
  try {
    if (selectedStaff.value) {
      await apiService.put(`/staff/${selectedStaff.value.id}`, form.value)
    } else {
      await apiService.post('/staff', form.value)
    }
    
    closeForm()
    await fetchStaff()
  } catch (error) {
    alert('Lỗi: ' + error.message)
  } finally {
    saving.value = false
  }
}

const closeForm = () => {
  showForm.value = false
  selectedStaff.value = null
  form.value = {
    name: '',
    email: '',
    phone: '',
    role: '',
    specialization: '',
    hire_date: '',
    status: 'active'
  }
}

const getRoleText = (role) => {
  const roles = {
    doctor: 'Bác sĩ',
    nurse: 'Y tá',
    receptionist: 'Lễ tân',
    admin: 'Quản trị viên'
  }
  return roles[role] || role
}

const getStatusClass = (status) => {
  const classes = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-yellow-100 text-yellow-800',
    terminated: 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getStatusText = (status) => {
  const texts = {
    active: 'Đang làm việc',
    inactive: 'Tạm nghỉ',
    terminated: 'Đã nghỉ việc'
  }
  return texts[status] || status
}

onMounted(async () => {
  await fetchStaff()
  
  if (window.feather) {
    window.feather.replace()
  }
})
</script>
