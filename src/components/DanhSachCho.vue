<template>
  <div class="danh-sach-cho">
    <!-- Header -->
    <v-card elevation="2" class="mb-6">
      <v-card-title class="bg-warning text-white d-flex align-center">
        <v-icon start>mdi-clock-outline</v-icon>
        Danh Sách Chờ Khám
        <v-spacer />
        <v-chip color="white" text-color="warning" size="small">
          {{ waitingList.length }} bệnh nhân
        </v-chip>
      </v-card-title>
    </v-card>

    <!-- Waiting List -->
    <v-row v-if="waitingList.length > 0">
      <v-col 
        v-for="(patient, index) in waitingList" 
        :key="patient.id"
        cols="12" 
        md="6" 
        lg="4"
      >
        <v-card elevation="3" class="h-100">
          <v-card-title class="d-flex align-center pa-4">
            <v-avatar color="warning" size="40" class="mr-3">
              <span class="text-h6 font-weight-bold">{{ index + 1 }}</span>
            </v-avatar>
            <div>
              <div class="text-h6">{{ patient.ho_ten }}</div>
              <div class="text-caption text-grey-600">
                Chờ từ {{ formatTime(patient.ngay_tao) }}
              </div>
            </div>
          </v-card-title>
          
          <v-card-text class="pa-4 pt-0">
            <v-list density="compact" class="pa-0">
              <v-list-item v-if="patient.ngay_sinh" class="pa-0 mb-1">
                <template #prepend>
                  <v-icon size="16" color="primary">mdi-calendar</v-icon>
                </template>
                <v-list-item-title class="text-body-2">
                  {{ formatDate(patient.ngay_sinh) }}
                  <span v-if="patient.thang_tuoi" class="text-grey-600">
                    ({{ patient.thang_tuoi }} tháng tuổi)
                  </span>
                </v-list-item-title>
              </v-list-item>
              
              <v-list-item v-if="patient.gioi_tinh" class="pa-0 mb-1">
                <template #prepend>
                  <v-icon size="16" color="primary">mdi-gender-male-female</v-icon>
                </template>
                <v-list-item-title class="text-body-2">{{ patient.gioi_tinh }}</v-list-item-title>
              </v-list-item>
              
              <v-list-item v-if="patient.can_nang" class="pa-0 mb-1">
                <template #prepend>
                  <v-icon size="16" color="primary">mdi-scale</v-icon>
                </template>
                <v-list-item-title class="text-body-2">{{ patient.can_nang }} kg</v-list-item-title>
              </v-list-item>
              
              <v-list-item v-if="patient.so_dien_thoai" class="pa-0 mb-1">
                <template #prepend>
                  <v-icon size="16" color="primary">mdi-phone</v-icon>
                </template>
                <v-list-item-title class="text-body-2">{{ patient.so_dien_thoai }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card-text>
          
          <v-card-actions class="pa-4 pt-0">
            <v-btn 
              @click="removeFromList(patient)"
              :loading="removing === patient.id"
              color="error" 
              variant="outlined" 
              size="small"
              prepend-icon="mdi-close"
            >
              Xóa khỏi danh sách
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Empty State -->
    <v-card v-else elevation="1" class="text-center pa-8">
      <v-icon size="64" color="grey-400" class="mb-4">mdi-clock-outline</v-icon>
      <h3 class="text-h6 text-grey-600 mb-2">Danh sách chờ trống</h3>
      <p class="text-body-2 text-grey-500">
        Hiện tại không có bệnh nhân nào trong danh sách chờ khám
      </p>
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
import { waitingListService } from '../lib/supabase.js'

export default {
  name: 'DanhSachCho',
  emits: ['waiting-list-changed'],
  setup(props, { emit }) {
    const waitingList = ref([])
    const removing = ref(null)
    const message = ref(null)
    const showMessage = ref(false)

    const displayMessage = (text, type = 'success') => {
      message.value = { text, type }
      showMessage.value = true
    }

    const loadWaitingList = async () => {
      try {
        const result = await waitingListService.getWaitingList()
        if (result.success) {
          waitingList.value = result.data || []
        } else {
          displayMessage(result.error || 'Không thể tải danh sách chờ', 'error')
        }
      } catch (error) {
        console.error('Load waiting list error:', error)
        displayMessage('Không thể tải danh sách chờ', 'error')
      }
    }

    const removeFromList = async (patient) => {
      try {
        removing.value = patient.id
        const result = await waitingListService.removeFromWaitingList(patient.id)
        
        if (result.success) {
          displayMessage(result.message || 'Đã xóa khỏi danh sách chờ')
          await loadWaitingList() // Reload list
          emit('waiting-list-changed') // Notify parent to update count
        } else {
          displayMessage(result.error || 'Không thể xóa khỏi danh sách chờ', 'error')
        }
      } catch (error) {
        console.error('Remove from waiting list error:', error)
        displayMessage('Không thể xóa khỏi danh sách chờ', 'error')
      } finally {
        removing.value = null
      }
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

    const formatTime = (dateString) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      const now = new Date()
      const diffHours = Math.floor((now - date) / (1000 * 60 * 60))
      
      if (diffHours === 0) return 'Vừa xong'
      if (diffHours === 1) return '1 giờ trước'
      if (diffHours < 24) return `${diffHours} giờ trước`
      
      return date.toLocaleDateString('vi-VN')
    }

    onMounted(() => {
      loadWaitingList()
    })

    return {
      waitingList,
      removing,
      message,
      showMessage,
      displayMessage,
      loadWaitingList,
      removeFromList,
      formatDate,
      formatTime
    }
  }
}
</script>

<style scoped>
.danh-sach-cho {
  max-width: 1200px;
  margin: 0 auto;
}
</style>