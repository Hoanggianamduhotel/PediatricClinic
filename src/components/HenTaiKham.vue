<template>
  <div class="hen-tai-kham">
    <!-- Header -->
    <v-card elevation="2" class="mb-6">
      <v-card-title class="bg-info text-white d-flex align-center">
        <v-icon start>mdi-calendar-check</v-icon>
        Quản Lý Hẹn Tái Khám
        <v-spacer />
        <v-chip color="white" text-color="info" size="small">
          {{ appointments.length }} lịch hẹn
        </v-chip>
      </v-card-title>
    </v-card>

    <!-- Filter Tabs -->
    <v-card elevation="2" class="mb-6">
      <v-tabs v-model="activeTab" color="primary" align-tabs="center">
        <v-tab value="today">
          <v-icon start>mdi-calendar-today</v-icon>
          Hôm nay ({{ stats.today }})
        </v-tab>
        <v-tab value="upcoming">
          <v-icon start>mdi-calendar-clock</v-icon>
          Sắp tới ({{ stats.upcoming }})
        </v-tab>
        <v-tab value="overdue">
          <v-icon start>mdi-calendar-alert</v-icon>
          Quá hạn ({{ stats.overdue }})
        </v-tab>
      </v-tabs>
    </v-card>

    <!-- Appointments List -->
    <v-card v-if="appointments.length > 0" elevation="2">
      <v-card-title class="pa-4">
        <h3 class="text-h6">
          {{ getTabTitle() }}
        </h3>
        <v-spacer />
        <v-chip color="primary" variant="tonal" size="small">
          {{ appointments.length }} bệnh nhân
        </v-chip>
      </v-card-title>
      
      <v-divider />

      <v-list class="pa-0">
        <v-list-item
          v-for="appointment in appointments"
          :key="appointment.id"
          class="appointment-item"
        >
          <template #prepend>
            <v-avatar color="primary" size="40">
              <v-icon>mdi-account</v-icon>
            </v-avatar>
          </template>

          <v-list-item-title class="font-weight-medium">
            {{ appointment.benhnhan?.ho_ten || 'Không có tên' }}
          </v-list-item-title>
          
          <v-list-item-subtitle class="mt-1">
            <div class="d-flex flex-column gap-1">
              <span>
                <v-icon size="14" class="mr-1">mdi-calendar</v-icon>
                Hẹn: {{ formatDate(appointment.ngay_hen_tai_kham) }}
              </span>
              <span v-if="appointment.chan_doan">
                <v-icon size="14" class="mr-1">mdi-medical-bag</v-icon>
                {{ appointment.chan_doan }}
              </span>
              <span v-if="appointment.so_ngay_toa">
                <v-icon size="14" class="mr-1">mdi-pill</v-icon>
                Toa {{ appointment.so_ngay_toa }} ngày
              </span>
            </div>
          </v-list-item-subtitle>

          <template #append>
            <div class="d-flex flex-column align-end">
              <v-chip
                :color="getStatusColor(appointment.ngay_hen_tai_kham)"
                size="small"
                class="mb-1"
              >
                {{ getStatusText(appointment.ngay_hen_tai_kham) }}
              </v-chip>
              <v-btn
                icon="mdi-phone"
                size="small"
                variant="text"
                color="primary"
                :disabled="!appointment.benhnhan?.so_dien_thoai"
              />
            </div>
          </template>
        </v-list-item>
      </v-list>
    </v-card>

    <!-- Empty State -->
    <v-card v-else elevation="1" class="text-center pa-8">
      <v-icon size="64" color="grey-400" class="mb-4">mdi-calendar-check</v-icon>
      <h3 class="text-h6 text-grey-600 mb-2">{{ getEmptyStateTitle() }}</h3>
      <p class="text-body-2 text-grey-500">
        {{ getEmptyStateText() }}
      </p>
    </v-card>

    <!-- Loading -->
    <v-overlay v-model="loading" contained>
      <v-progress-circular indeterminate size="64" />
    </v-overlay>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import { followUpService } from '../lib/supabase.js'

export default {
  name: 'HenTaiKham',
  setup() {
    const activeTab = ref('today')
    const appointments = ref([])
    const stats = ref({
      today: 0,
      upcoming: 0,
      overdue: 0
    })
    const loading = ref(false)

    const loadStats = async () => {
      try {
        const result = await followUpService.getFollowUpStats()
        if (result.success) {
          stats.value = result.data
        }
      } catch (error) {
        console.error('Load stats error:', error)
      }
    }

    const loadAppointments = async (type = 'today') => {
      try {
        loading.value = true
        const result = await followUpService.getFollowUpAppointments(type)
        if (result.success) {
          appointments.value = result.data || []
        }
      } catch (error) {
        console.error('Load appointments error:', error)
        appointments.value = []
      } finally {
        loading.value = false
      }
    }

    const formatDate = (dateString) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('vi-VN', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    }

    const getStatusColor = (dateString) => {
      const today = new Date().toISOString().split('T')[0]
      const appointmentDate = dateString
      
      if (appointmentDate === today) return 'success'
      if (appointmentDate > today) return 'info'
      return 'error'
    }

    const getStatusText = (dateString) => {
      const today = new Date().toISOString().split('T')[0]
      const appointmentDate = dateString
      
      if (appointmentDate === today) return 'Hôm nay'
      if (appointmentDate > today) return 'Sắp tới'
      return 'Quá hạn'
    }

    const getTabTitle = () => {
      switch (activeTab.value) {
        case 'today': return 'Hẹn Tái Khám Hôm Nay'
        case 'upcoming': return 'Hẹn Tái Khám Sắp Tới'
        case 'overdue': return 'Hẹn Tái Khám Quá Hạn'
        default: return 'Hẹn Tái Khám'
      }
    }

    const getEmptyStateTitle = () => {
      switch (activeTab.value) {
        case 'today': return 'Không có hẹn hôm nay'
        case 'upcoming': return 'Không có hẹn sắp tới'
        case 'overdue': return 'Không có hẹn quá hạn'
        default: return 'Không có hẹn nào'
      }
    }

    const getEmptyStateText = () => {
      switch (activeTab.value) {
        case 'today': return 'Hiện tại không có bệnh nhân nào hẹn tái khám hôm nay'
        case 'upcoming': return 'Hiện tại không có bệnh nhân nào hẹn tái khám trong tương lai'
        case 'overdue': return 'Không có bệnh nhân nào bị quá hạn hẹn tái khám'
        default: return 'Không có lịch hẹn nào trong hệ thống'
      }
    }

    // Watch tab changes to reload appointments
    watch(activeTab, (newTab) => {
      loadAppointments(newTab)
    })

    onMounted(async () => {
      await loadStats()
      await loadAppointments('today')
    })

    return {
      activeTab,
      appointments,
      stats,
      loading,
      formatDate,
      getStatusColor,
      getStatusText,
      getTabTitle,
      getEmptyStateTitle,
      getEmptyStateText
    }
  }
}
</script>

<style scoped>
.hen-tai-kham {
  max-width: 1200px;
  margin: 0 auto;
}

.appointment-item {
  border-bottom: 1px solid #f0f0f0;
  padding: 16px 24px;
}

.appointment-item:hover {
  background-color: #fafafa;
}

.appointment-item:last-child {
  border-bottom: none;
}
</style>