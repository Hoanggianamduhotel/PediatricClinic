<template>
  <v-app>
    <v-app-bar color="primary" dark>
      <v-app-bar-title>Clinic BS Khang - Danh Sách Khám Bệnh</v-app-bar-title>
    </v-app-bar>
    
    <v-main>
      <v-container class="pa-6">
        <h2 class="text-h4 mb-6">📋 Danh sách khám bệnh theo ngày</h2>
        
        <!-- Date Selection -->
        <v-card class="mb-6">
          <v-card-text>
            <v-row>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="selectedDate"
                  @update:model-value="loadPatients"
                  type="date"
                  label="Chọn ngày khám"
                  variant="outlined"
                  prepend-inner-icon="mdi-calendar"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-btn @click="setToday" color="primary" prepend-icon="mdi-calendar-today">
                  Hôm nay
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Loading -->
        <v-card v-if="loading" class="text-center pa-6">
          <v-progress-circular indeterminate color="primary" />
          <p class="mt-4">⏳ Đang tải dữ liệu...</p>
        </v-card>

        <!-- Error -->
        <v-card v-else-if="error" color="error" class="pa-4 mb-4">
          <p class="text-white">⚠️ {{ error }}</p>
        </v-card>

        <!-- Results Table -->
        <v-card v-else-if="patients.length > 0">
          <v-card-title>
            Kết quả: {{ patients.length }} lượt khám
          </v-card-title>
          <v-table>
            <thead>
              <tr>
                <th>Mã BN</th>
                <th>Họ tên</th>
                <th>Ngày sinh</th>
                <th>Ngày khám</th>
                <th>Chẩn đoán</th>
                <th>Số ngày toa</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(p, i) in patients" :key="i">
                <td>{{ p.benhnhan_id }}</td>
                <td>{{ p.benhnhan?.ho_ten || 'N/A' }}</td>
                <td>{{ p.benhnhan?.ngay_sinh || 'N/A' }}</td>
                <td>{{ p.ngay_kham }}</td>
                <td>{{ p.chan_doan || 'Chưa có' }}</td>
                <td>{{ p.so_ngay_toa || 0 }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-card>

        <!-- Empty State -->
        <v-card v-else-if="selectedDate" class="text-center pa-6">
          <v-icon size="64" color="grey">mdi-calendar-remove</v-icon>
          <h3 class="mt-4">Không có bệnh nhân nào khám trong ngày này</h3>
        </v-card>

        <!-- Initial State -->
        <v-card v-else class="text-center pa-6">
          <v-icon size="64" color="primary">mdi-calendar-search</v-icon>
          <h3 class="mt-4">Chọn ngày để xem danh sách khám bệnh</h3>
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import { ref, onMounted } from 'vue'
import { examinationService } from './lib/supabase.js'

export default {
  name: 'SimpleKhamBenh',
  setup() {
    const patients = ref([])
    const loading = ref(false)
    const error = ref(null)
    const selectedDate = ref('')

    // Load patients based on selected date
    const loadPatients = async () => {
      if (!selectedDate.value) {
        patients.value = []
        return
      }

      loading.value = true
      error.value = null

      try {
        const result = await examinationService.getExaminationsByDate(selectedDate.value)
        
        if (result.success) {
          patients.value = result.data || []
        } else {
          error.value = result.error || 'Lỗi khi tải dữ liệu'
          patients.value = []
        }
      } catch (err) {
        error.value = err.message || 'Lỗi khi tải dữ liệu'
        patients.value = []
      } finally {
        loading.value = false
      }
    }

    // Set today's date
    const setToday = () => {
      selectedDate.value = new Date().toISOString().split('T')[0]
      loadPatients()
    }

    onMounted(() => {
      setToday() // Auto-load today's data
    })

    return {
      patients,
      loading,
      error,
      selectedDate,
      loadPatients,
      setToday
    }
  }
}
</script>