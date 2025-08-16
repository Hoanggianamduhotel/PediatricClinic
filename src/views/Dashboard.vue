<template>
  <div class="p-6">
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Bảng điều khiển</h1>
      <p class="text-gray-600">Tổng quan hoạt động phòng khám</p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-2 bg-blue-100 rounded-lg">
            <i data-feather="users" class="w-6 h-6 text-blue-600"></i>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Bệnh nhân hôm nay</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.todayPatients }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-2 bg-green-100 rounded-lg">
            <i data-feather="calendar" class="w-6 h-6 text-green-600"></i>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Lịch hẹn hôm nay</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.todayAppointments }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-2 bg-yellow-100 rounded-lg">
            <i data-feather="clock" class="w-6 h-6 text-yellow-600"></i>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Đang chờ</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.waitingPatients }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-2 bg-purple-100 rounded-lg">
            <i data-feather="dollar-sign" class="w-6 h-6 text-purple-600"></i>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Doanh thu hôm nay</p>
            <p class="text-2xl font-bold text-gray-900">{{ formatCurrency(stats.todayRevenue) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Today's Appointments -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white rounded-lg shadow">
        <div class="p-6 border-b">
          <h2 class="text-lg font-semibold text-gray-900">Lịch hẹn hôm nay</h2>
        </div>
        <div class="p-6">
          <div v-if="todaysAppointments.length === 0" class="text-center text-gray-500 py-8">
            Không có lịch hẹn nào hôm nay
          </div>
          <div v-else class="space-y-4">
            <div
              v-for="appointment in todaysAppointments"
              :key="appointment.id"
              class="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div>
                <p class="font-medium">{{ appointment.patient_name }}</p>
                <p class="text-sm text-gray-600">{{ appointment.time }} - {{ appointment.reason }}</p>
              </div>
              <div class="flex items-center space-x-2">
                <span
                  :class="getStatusClass(appointment.status)"
                  class="px-2 py-1 text-xs font-medium rounded-full"
                >
                  {{ getStatusText(appointment.status) }}
                </span>
                <button
                  v-if="appointment.status === 'scheduled'"
                  @click="checkInPatient(appointment.id)"
                  class="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                >
                  Check-in
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-white rounded-lg shadow">
        <div class="p-6 border-b">
          <h2 class="text-lg font-semibold text-gray-900">Thao tác nhanh</h2>
        </div>
        <div class="p-6">
          <div class="space-y-4">
            <router-link
              to="/patients"
              class="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <i data-feather="user-plus" class="w-6 h-6 text-blue-600 mr-3"></i>
              <div>
                <p class="font-medium text-blue-900">Thêm bệnh nhân mới</p>
                <p class="text-sm text-blue-600">Đăng ký thông tin bệnh nhân</p>
              </div>
            </router-link>

            <router-link
              to="/appointments"
              class="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <i data-feather="calendar-plus" class="w-6 h-6 text-green-600 mr-3"></i>
              <div>
                <p class="font-medium text-green-900">Đặt lịch hẹn</p>
                <p class="text-sm text-green-600">Tạo lịch hẹn mới</p>
              </div>
            </router-link>

            <router-link
              to="/medical-records"
              class="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <i data-feather="file-text" class="w-6 h-6 text-purple-600 mr-3"></i>
              <div>
                <p class="font-medium text-purple-900">Hồ sơ bệnh án</p>
                <p class="text-sm text-purple-600">Quản lý hồ sơ y tế</p>
              </div>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAppointmentsStore } from '@/stores/appointments'
import { apiService } from '@/services/api'

const appointmentsStore = useAppointmentsStore()
const stats = ref({
  todayPatients: 0,
  todayAppointments: 0,
  waitingPatients: 0,
  todayRevenue: 0
})

const todaysAppointments = computed(() => appointmentsStore.todaysAppointments)

const fetchDashboardStats = async () => {
  try {
    const response = await apiService.get('/dashboard/stats')
    stats.value = response.data
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
  }
}

const checkInPatient = async (appointmentId) => {
  const result = await appointmentsStore.checkInPatient(appointmentId)
  if (result.success) {
    await fetchDashboardStats()
  }
}

const getStatusClass = (status) => {
  const classes = {
    scheduled: 'bg-yellow-100 text-yellow-800',
    'checked-in': 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getStatusText = (status) => {
  const texts = {
    scheduled: 'Đã đặt lịch',
    'checked-in': 'Đã check-in',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy'
  }
  return texts[status] || status
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount)
}

onMounted(async () => {
  await appointmentsStore.fetchAppointments()
  await fetchDashboardStats()
  
  if (window.feather) {
    window.feather.replace()
  }
})
</script>
