<template>
  <nav class="fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-40">
    <div class="flex flex-col h-full">
      <!-- Logo -->
      <div class="flex items-center justify-center h-16 px-4 border-b border-gray-200">
        <div class="flex items-center space-x-2">
          <i data-feather="heart" class="w-8 h-8 text-medical-600"></i>
          <div>
            <h1 class="text-lg font-bold text-gray-900">Clinic BS Khang</h1>
            <p class="text-xs text-gray-500">Phòng khám nhi</p>
          </div>
        </div>
      </div>

      <!-- User Info -->
      <div class="px-4 py-4 border-b border-gray-200">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <i data-feather="user" class="w-5 h-5 text-blue-600"></i>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-900">{{ user?.name || 'Admin' }}</p>
            <p class="text-xs text-gray-500">{{ user?.role || 'Quản trị viên' }}</p>
          </div>
        </div>
      </div>

      <!-- Navigation Links -->
      <div class="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        <router-link
          to="/"
          class="nav-link"
          :class="{ 'nav-link-active': $route.name === 'Dashboard' }"
        >
          <i data-feather="home" class="nav-icon"></i>
          Bảng điều khiển
        </router-link>

        <router-link
          to="/patients"
          class="nav-link"
          :class="{ 'nav-link-active': $route.name === 'Patients' }"
        >
          <i data-feather="users" class="nav-icon"></i>
          Quản lý bệnh nhân
        </router-link>

        <router-link
          to="/appointments"
          class="nav-link"
          :class="{ 'nav-link-active': $route.name === 'Appointments' }"
        >
          <i data-feather="calendar" class="nav-icon"></i>
          Lịch hẹn
        </router-link>

        <router-link
          to="/medical-records"
          class="nav-link"
          :class="{ 'nav-link-active': $route.name === 'MedicalRecords' }"
        >
          <i data-feather="file-text" class="nav-icon"></i>
          Hồ sơ bệnh án
        </router-link>

        <router-link
          to="/staff"
          class="nav-link"
          :class="{ 'nav-link-active': $route.name === 'Staff' }"
        >
          <i data-feather="user-check" class="nav-icon"></i>
          Nhân viên
        </router-link>

        <router-link
          to="/billing"
          class="nav-link"
          :class="{ 'nav-link-active': $route.name === 'Billing' }"
        >
          <i data-feather="dollar-sign" class="nav-icon"></i>
          Thanh toán
        </router-link>
      </div>

      <!-- Quick Stats -->
      <div class="px-4 py-3 border-t border-gray-200">
        <div class="grid grid-cols-2 gap-2 text-center">
          <div class="bg-blue-50 rounded-lg p-2">
            <p class="text-xs text-gray-600">Hôm nay</p>
            <p class="text-sm font-semibold text-blue-600">{{ todayStats.appointments || 0 }}</p>
            <p class="text-xs text-gray-500">lịch hẹn</p>
          </div>
          <div class="bg-green-50 rounded-lg p-2">
            <p class="text-xs text-gray-600">Đang chờ</p>
            <p class="text-sm font-semibold text-green-600">{{ todayStats.waiting || 0 }}</p>
            <p class="text-xs text-gray-500">bệnh nhân</p>
          </div>
        </div>
      </div>

      <!-- Logout -->
      <div class="px-4 py-3 border-t border-gray-200">
        <button
          @click="handleLogout"
          class="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
        >
          <i data-feather="log-out" class="w-4 h-4 mr-2"></i>
          Đăng xuất
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { apiService } from '@/services/api'

const router = useRouter()
const authStore = useAuthStore()

const todayStats = ref({
  appointments: 0,
  waiting: 0
})

const user = computed(() => authStore.user)

const fetchTodayStats = async () => {
  try {
    const response = await apiService.get('/dashboard/today-stats')
    todayStats.value = response.data
  } catch (error) {
    console.error('Error fetching today stats:', error)
  }
}

const handleLogout = () => {
  if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
    authStore.logout()
    router.push('/login')
  }
}

onMounted(async () => {
  await fetchTodayStats()
  
  if (window.feather) {
    window.feather.replace()
  }
})
</script>

<style scoped>
.nav-link {
  @apply flex items-center px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors;
}

.nav-link-active {
  @apply bg-blue-100 text-blue-700;
}

.nav-icon {
  @apply w-5 h-5 mr-3;
}
</style>
