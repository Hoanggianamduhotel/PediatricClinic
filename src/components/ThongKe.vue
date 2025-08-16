<template>
  <div class="thong-ke-container">
    <!-- Header -->
    <v-card elevation="2" class="mb-4">
      <v-card-title class="bg-primary text-white d-flex align-center">
        <v-icon start>mdi-chart-line</v-icon>
        Thống Kê Khám Bệnh
        <v-spacer />
        <v-chip color="white" text-color="primary" size="small">
          {{ selectedDate ? formatDate(selectedDate) : 'Chọn ngày' }}
        </v-chip>
      </v-card-title>
    </v-card>

    <!-- Date Picker -->
    <v-card elevation="1" class="mb-4">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="selectedDate"
              type="date"
              label="Chọn ngày thống kê"
              prepend-icon="mdi-calendar"
              variant="outlined"
              @change="loadStatistics"
            />
          </v-col>
          <v-col cols="12" md="6" class="d-flex align-center">
            <v-btn
              @click="setToday"
              color="primary"
              variant="outlined"
              prepend-icon="mdi-calendar-today"
            >
              Hôm nay
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Statistics Cards -->
    <v-row v-if="selectedDate" class="mb-4">
      <v-col cols="12" sm="6" md="3">
        <v-card color="info" elevation="2">
          <v-card-text class="text-center text-white">
            <v-icon size="40" class="mb-2">mdi-account-group</v-icon>
            <div class="text-h4 font-weight-bold">{{ statistics.totalPatients }}</div>
            <div class="text-subtitle-1">Tổng bệnh nhân</div>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" sm="6" md="3">
        <v-card color="success" elevation="2">
          <v-card-text class="text-center text-white">
            <v-icon size="40" class="mb-2">mdi-check-circle</v-icon>
            <div class="text-h4 font-weight-bold">{{ statistics.completedExams }}</div>
            <div class="text-subtitle-1">Đã khám xong</div>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" sm="6" md="3">
        <v-card color="warning" elevation="2">
          <v-card-text class="text-center text-white">
            <v-icon size="40" class="mb-2">mdi-calendar-clock</v-icon>
            <div class="text-h4 font-weight-bold">{{ statistics.followUpAppointments }}</div>
            <div class="text-subtitle-1">Hẹn tái khám</div>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" sm="6" md="3">
        <v-card color="error" elevation="2">
          <v-card-text class="text-center text-white">
            <v-icon size="40" class="mb-2">mdi-clock-outline</v-icon>
            <div class="text-h4 font-weight-bold">{{ statistics.waitingPatients }}</div>
            <div class="text-subtitle-1">Đang chờ</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Patient List -->
    <v-card v-if="examinations.length > 0" elevation="2">
      <v-card-title class="d-flex align-center">
        <h3 class="text-h6">Danh Sách Khám Bệnh - {{ formatDate(selectedDate) }}</h3>
        <v-spacer />
        <v-chip color="primary" variant="tonal" size="small">
          {{ examinations.length }} bệnh nhân
        </v-chip>
      </v-card-title>
      
      <v-divider />

      <v-table class="clean-table">
        <thead>
          <tr class="table-header">
            <th class="text-center">STT</th>
            <th>Họ tên</th>
            <th>Tuổi</th>
            <th>Bác sĩ</th>
            <th>Chẩn đoán</th>
            <th class="text-center">Trạng thái</th>
            <th class="text-center">Hẹn tái khám</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="(exam, index) in examinations" 
            :key="exam.id"
            class="table-row"
          >
            <td class="text-center">
              <v-chip color="primary" size="small" class="font-weight-bold">
                {{ index + 1 }}
              </v-chip>
            </td>
            <td>
              <div class="patient-name">{{ exam.patient_name }}</div>
            </td>
            <td>{{ calculateAge(exam.patient_birth_date) }}</td>
            <td>{{ exam.doctor_name || 'Chưa xác định' }}</td>
            <td>
              <span v-if="exam.diagnosis">{{ exam.diagnosis }}</span>
              <span v-else class="text-grey-500">Chưa chẩn đoán</span>
            </td>
            <td class="text-center">
              <v-chip 
                :color="getStatusColor(exam.status)" 
                size="small"
                variant="tonal"
              >
                {{ getStatusText(exam.status) }}
              </v-chip>
            </td>
            <td class="text-center">
              <span v-if="exam.follow_up_date">
                {{ formatDateShort(exam.follow_up_date) }}
              </span>
              <span v-else class="text-grey-500">-</span>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <!-- Empty State -->
    <v-card v-else-if="selectedDate && !loading" elevation="1" class="text-center pa-8">
      <v-icon size="64" color="grey-400" class="mb-4">mdi-chart-line</v-icon>
      <h3 class="text-h6 text-grey-600 mb-2">Không có dữ liệu thống kê</h3>
      <p class="text-body-2 text-grey-500">
        Chưa có bệnh nhân nào khám bệnh vào ngày {{ formatDate(selectedDate) }}
      </p>
    </v-card>

    <!-- Loading State -->
    <v-card v-if="loading" elevation="1" class="text-center pa-8">
      <v-progress-circular
        indeterminate
        color="primary"
        size="60"
        class="mb-4"
      />
      <p class="text-body-2">Đang tải dữ liệu thống kê...</p>
    </v-card>

    <!-- Success/Error Messages -->
    <v-snackbar
      v-model="showMessage"
      :color="message?.type === 'success' ? 'success' : 'error'"
      :timeout="4000"
      location="top right"
    >
      {{ message?.text }}
      <template #actions>
        <v-btn @click="showMessage = false" icon="mdi-close" variant="text" />
      </template>
    </v-snackbar>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { statisticsService } from '../lib/supabase.js'

export default {
  name: 'ThongKe',
  setup() {
    const selectedDate = ref('')
    const loading = ref(false)
    const examinations = ref([])
    const statistics = ref({
      totalPatients: 0,
      completedExams: 0,
      followUpAppointments: 0,
      waitingPatients: 0
    })
    const message = ref(null)
    const showMessage = ref(false)

    const displayMessage = (text, type = 'success') => {
      message.value = { text, type }
      showMessage.value = true
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

    const formatDateShort = (dateString) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    }

    const calculateAge = (birthDate) => {
      if (!birthDate) return 'Chưa rõ'
      const birth = new Date(birthDate)
      const today = new Date()
      const ageInMonths = (today.getFullYear() - birth.getFullYear()) * 12 + 
                         (today.getMonth() - birth.getMonth())
      
      if (ageInMonths < 12) {
        return `${ageInMonths} tháng`
      } else {
        const years = Math.floor(ageInMonths / 12)
        const months = ageInMonths % 12
        if (months === 0) {
          return `${years} tuổi`
        } else {
          return `${years}t${months}th`
        }
      }
    }

    const getStatusColor = (status) => {
      switch (status) {
        case 'completed': return 'success'
        case 'in_progress': return 'warning'
        case 'waiting': return 'info'
        case 'cancelled': return 'error'
        default: return 'grey'
      }
    }

    const getStatusText = (status) => {
      switch (status) {
        case 'completed': return 'Hoàn thành'
        case 'in_progress': return 'Đang khám'
        case 'waiting': return 'Đang chờ'
        case 'cancelled': return 'Đã hủy'
        default: return 'Chưa rõ'
      }
    }

    const setToday = () => {
      const today = new Date()
      selectedDate.value = today.toISOString().split('T')[0]
      loadStatistics()
    }

    const loadStatistics = async () => {
      if (!selectedDate.value) return

      try {
        loading.value = true
        
        // Get examination statistics from Supabase
        const result = await statisticsService.getExaminationsByDate(selectedDate.value)
        
        if (result.success) {
          // Update examinations data from Supabase
          examinations.value = result.data?.examinations || []
          statistics.value = result.data?.statistics || {
            totalPatients: 0,
            completedExams: 0,
            followUpAppointments: 0,
            waitingPatients: 0
          }
          
          if (examinations.value.length === 0) {
            displayMessage('Không có dữ liệu khám bệnh cho ngày đã chọn', 'info')
          } else {
            displayMessage(`Đã tải ${examinations.value.length} hồ sơ khám bệnh`, 'success')
          }
        } else {
          throw new Error(result.error || 'Không thể tải dữ liệu từ Supabase')
        }

      } catch (error) {
        console.error('Load statistics error:', error)
        displayMessage('Lỗi tải dữ liệu: ' + error.message, 'error')
        examinations.value = []
        statistics.value = {
          totalPatients: 0,
          completedExams: 0,
          followUpAppointments: 0,
          waitingPatients: 0
        }
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      setToday() // Load today's statistics by default
    })

    return {
      selectedDate,
      loading,
      examinations,
      statistics,
      message,
      showMessage,
      displayMessage,
      formatDate,
      formatDateShort,
      calculateAge,
      getStatusColor,
      getStatusText,
      setToday,
      loadStatistics
    }
  }
}
</script>

<style scoped>
.thong-ke-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px;
}

.clean-table {
  background: white;
}

.table-header th {
  background-color: #f5f5f5;
  font-weight: 600;
  color: #424242;
  padding: 16px 12px;
  border-bottom: 2px solid #e0e0e0;
}

.table-row {
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s ease;
}

.table-row:hover {
  background-color: #fafafa;
}

.table-row td {
  padding: 12px;
  vertical-align: middle;
}

.patient-name {
  font-weight: 500;
  color: #1976d2;
}
</style>