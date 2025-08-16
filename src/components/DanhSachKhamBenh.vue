<template>
  <div class="danh-sach-kham-benh">
    <!-- Header with Date Selection -->
    <v-card elevation="2" class="mb-6">
      <v-card-title class="bg-success text-white d-flex align-center">
        <v-icon start>mdi-calendar-check</v-icon>
        Danh Sách Khám Bệnh Theo Ngày
        <v-spacer />
        <v-chip color="white" text-color="success" size="small">
          {{ examinations.length }} lượt khám
        </v-chip>
      </v-card-title>
      <v-card-text class="pa-4">
        <v-row align="center">
          <v-col cols="12" md="4">
            <v-text-field
              v-model="selectedDate"
              @update:model-value="searchExaminations"
              type="date"
              label="Chọn ngày khám"
              variant="outlined"
              density="compact"
              prepend-inner-icon="mdi-calendar"
              hide-details
            />
          </v-col>
          <v-col cols="12" md="4">
            <v-btn 
              @click="setToday"
              color="primary" 
              variant="outlined"
              prepend-icon="mdi-calendar-today"
              size="small"
            >
              Hôm nay
            </v-btn>
          </v-col>
          <v-col cols="12" md="4" class="text-right">
            <v-chip 
              v-if="selectedDate" 
              color="primary" 
              variant="tonal"
            >
              {{ formatDateDisplay(selectedDate) }}
            </v-chip>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Examinations List -->
    <v-card v-if="examinations.length > 0" elevation="2" class="rounded-lg">
      <v-card-title class="pa-4 d-flex align-center">
        <h3 class="text-h6">Danh Sách Khám Bệnh</h3>
        <v-spacer />
        <v-chip color="success" variant="tonal" size="small">
          Tổng số: {{ examinations.length }} lượt khám
        </v-chip>
      </v-card-title>
      
      <v-divider />

      <!-- Table Content -->
      <v-table class="clean-table">
        <thead>
          <tr class="table-header">
            <th class="text-center">STT</th>
            <th>Họ tên bệnh nhân</th>
            <th>Ngày sinh</th>
            <th class="text-center">Tuổi</th>
            <th>Chẩn đoán</th>
            <th class="text-center">Số ngày toa</th>
            <th>Hẹn tái khám</th>
            <th>Điện thoại</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="(exam, index) in examinations" 
            :key="exam.id"
            class="table-row"
          >
            <td class="text-center">
              <v-chip color="success" size="small" class="font-weight-bold">
                {{ index + 1 }}
              </v-chip>
            </td>
            <td>
              <div class="patient-name">{{ exam.benhnhan?.ho_ten || 'N/A' }}</div>
            </td>
            <td>{{ formatDateShort(exam.benhnhan?.ngay_sinh) }}</td>
            <td class="text-center">
              <v-chip color="blue-grey" size="small" variant="tonal">
                {{ calculateAge(exam.benhnhan?.ngay_sinh) }} tuổi
              </v-chip>
            </td>
            <td>
              <div class="diagnosis-text">{{ exam.chan_doan || 'Chưa có chẩn đoán' }}</div>
            </td>
            <td class="text-center">
              <v-chip 
                :color="exam.so_ngay_toa ? 'orange' : 'grey'" 
                size="small" 
                variant="tonal"
              >
                {{ exam.so_ngay_toa || 0 }} ngày
              </v-chip>
            </td>
            <td>
              <v-chip 
                v-if="exam.ngay_hen_tai_kham" 
                color="info" 
                size="small"
                variant="tonal"
              >
                {{ formatDateShort(exam.ngay_hen_tai_kham) }}
              </v-chip>
              <span v-else class="text-grey-600">Không hẹn</span>
            </td>
            <td>{{ exam.benhnhan?.so_dien_thoai || 'N/A' }}</td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <!-- Empty State -->
    <v-card v-else-if="selectedDate" elevation="2" class="text-center pa-8">
      <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-calendar-remove</v-icon>
      <h3 class="text-h6 mb-2">Không có lượt khám nào</h3>
      <p class="text-body-2 text-grey-600">
        Không có lượt khám bệnh nào trong ngày {{ formatDateDisplay(selectedDate) }}
      </p>
      <v-btn 
        @click="setToday" 
        color="primary" 
        variant="outlined" 
        class="mt-4"
        prepend-icon="mdi-calendar-today"
      >
        Xem hôm nay
      </v-btn>
    </v-card>

    <!-- Initial State -->
    <v-card v-else elevation="2" class="text-center pa-8">
      <v-icon size="64" color="primary" class="mb-4">mdi-calendar-search</v-icon>
      <h3 class="text-h6 mb-2">Chọn ngày để xem danh sách khám bệnh</h3>
      <p class="text-body-2 text-grey-600 mb-4">
        Chọn ngày ở trên để xem danh sách chi tiết các lượt khám bệnh
      </p>
      <v-btn 
        @click="setToday" 
        color="primary" 
        size="large"
        prepend-icon="mdi-calendar-today"
      >
        Xem hôm nay
      </v-btn>
    </v-card>

    <!-- Loading State -->
    <v-overlay v-model="loading" class="align-center justify-center">
      <v-progress-circular
        color="primary"
        indeterminate
        size="64"
      ></v-progress-circular>
    </v-overlay>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { examinationService } from '../lib/supabase.js'

export default {
  name: 'DanhSachKhamBenh',
  setup() {
    const examinations = ref([])
    const selectedDate = ref('')
    const loading = ref(false)

    const setToday = () => {
      selectedDate.value = new Date().toISOString().split('T')[0]
      searchExaminations()
    }

    const searchExaminations = async () => {
      if (!selectedDate.value) {
        examinations.value = []
        return
      }

      loading.value = true
      try {
        const result = await examinationService.getExaminationsByDate(selectedDate.value)
        if (result.success) {
          examinations.value = result.data
        } else {
          console.error('Failed to load examinations:', result.error)
          examinations.value = []
        }
      } catch (error) {
        console.error('Error loading examinations:', error)
        examinations.value = []
      } finally {
        loading.value = false
      }
    }

    const formatDateShort = (dateString) => {
      if (!dateString) return 'N/A'
      const date = new Date(dateString)
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    }

    const formatDateDisplay = (dateString) => {
      if (!dateString) return 'N/A'
      const date = new Date(dateString)
      return date.toLocaleDateString('vi-VN', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    }

    const calculateAge = (birthDate) => {
      if (!birthDate) return 'N/A'
      const birth = new Date(birthDate)
      const today = new Date()
      let age = today.getFullYear() - birth.getFullYear()
      const monthDiff = today.getMonth() - birth.getMonth()
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--
      }
      
      return age
    }

    onMounted(() => {
      // Auto-load today's examinations
      setToday()
    })

    return {
      examinations,
      selectedDate,
      loading,
      setToday,
      searchExaminations,
      formatDateShort,
      formatDateDisplay,
      calculateAge
    }
  }
}
</script>

<style scoped>
.clean-table {
  border-collapse: separate;
  border-spacing: 0;
}

.table-header th {
  background-color: #f5f5f5;
  font-weight: 600;
  padding: 16px 12px;
  border-bottom: 2px solid #e0e0e0;
}

.table-row:hover {
  background-color: #f8f9fa;
}

.table-row td {
  padding: 12px;
  border-bottom: 1px solid #e0e0e0;
  vertical-align: middle;
}

.patient-name {
  font-weight: 500;
  color: #1976d2;
}

.diagnosis-text {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.v-overlay {
  border-radius: 8px;
}
</style>