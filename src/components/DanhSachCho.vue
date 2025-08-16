<template>
  <div class="danh-sach-cho">
    <!-- Header -->
    <v-card v-if="showHeader" elevation="2" class="mb-6">
      <v-card-title class="bg-warning text-white d-flex align-center">
        <v-icon start>mdi-clock-outline</v-icon>
        Danh Sách Chờ Khám
        <v-spacer />
        <v-chip color="white" text-color="warning" size="small">
          {{ waitingList.length }} bệnh nhân
        </v-chip>
      </v-card-title>
    </v-card>

    <!-- Modern List View -->
    <v-card v-if="waitingList.length > 0" elevation="2" class="rounded-lg">
      <!-- Table Header -->
      <v-card-title class="pa-4 d-flex align-center">
        <h3 class="text-h6">Danh Sách Chờ Khám</h3>
        <v-spacer />
        <v-chip color="primary" variant="tonal" size="small">
          Tổng số: {{ waitingList.length }}
        </v-chip>
      </v-card-title>
      
      <v-divider />

      <!-- Table Content -->
      <v-table class="clean-table">
        <thead>
          <tr class="table-header">
            <th class="text-center">STT</th>
            <th>Họ tên</th>
            <th>Ngày sinh</th>
            <th class="text-center">Tuổi</th>
            <th class="text-center">Cân nặng</th>
            <th>Số điện thoại</th>
            <th class="text-center">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="(patient, index) in waitingList" 
            :key="patient.id"
            class="table-row"
          >
            <td class="text-center">
              <v-chip color="primary" size="small" class="font-weight-bold">
                {{ index + 1 }}
              </v-chip>
            </td>
            <td>
              <div class="patient-name">{{ patient.ho_ten }}</div>
            </td>
            <td>{{ formatDateShort(patient.ngay_sinh) }}</td>
            <td class="text-center">
              <span v-if="patient.thang_tuoi">{{ patient.thang_tuoi }} tháng</span>
              <span v-else class="text-grey-500">null tháng</span>
            </td>
            <td class="text-center">
              <span v-if="patient.can_nang">{{ patient.can_nang }} kg</span>
              <span v-else class="text-grey-500">-</span>
            </td>
            <td>
              <span v-if="patient.so_dien_thoai">{{ patient.so_dien_thoai }}</span>
              <span v-else class="text-grey-500">-</span>
            </td>
            <td class="text-center">
              <v-btn
                @click="removeFromList(patient)"
                :loading="removing === patient.id"
                icon
                size="small"
                color="error"
                variant="text"
              >
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

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
  props: {
    showHeader: {
      type: Boolean,
      default: true
    }
  },
  emits: ['waiting-list-changed'],
  setup(props, { emit }) {
    const waitingList = ref([])
    const removing = ref(null)
    const message = ref(null)
    const showMessage = ref(false)

    const formatDateShort = (dateString) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    }

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
      formatDateShort,
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