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

    <!-- Waiting List - Modern Data Table -->
    <div v-if="waitingList.length > 0">
      <v-data-table
        :headers="headers"
        :items="waitingList"
        :items-per-page="10"
        class="elevation-3 rounded-lg"
        item-value="id"
        no-data-text="Chưa có bệnh nhân nào trong danh sách chờ"
        items-per-page-text="Số dòng mỗi trang:"
        page-text="{0}-{1} của {2}"
        hover
      >
        <template v-slot:item.stt="{ index }">
          <v-avatar color="warning" size="32">
            <span class="text-caption font-weight-bold">{{ index + 1 }}</span>
          </v-avatar>
        </template>

        <template v-slot:item.ho_ten="{ item }">
          <div class="d-flex align-center">
            <v-avatar :color="item.gioi_tinh === 'Nam' ? 'blue' : 'pink'" size="32" class="mr-3">
              <v-icon color="white" size="20">{{ item.gioi_tinh === 'Nam' ? 'mdi-face-man' : 'mdi-face-woman' }}</v-icon>
            </v-avatar>
            <div>
              <div class="font-weight-bold">{{ item.ho_ten }}</div>
              <div class="text-caption text-grey-600">{{ item.gioi_tinh }}</div>
            </div>
          </div>
        </template>

        <template v-slot:item.ngay_sinh="{ item }">
          <div>
            <div>{{ formatDate(item.ngay_sinh) }}</div>
            <div v-if="item.thang_tuoi" class="text-caption text-grey-600">{{ item.thang_tuoi }} tháng tuổi</div>
          </div>
        </template>

        <template v-slot:item.thong_tin="{ item }">
          <div class="d-flex flex-column ga-1">
            <div v-if="item.so_dien_thoai" class="d-flex align-center">
              <v-icon size="14" color="grey" class="mr-1">mdi-phone</v-icon>
              <span class="text-caption">{{ item.so_dien_thoai }}</span>
            </div>
            <div v-if="item.can_nang" class="d-flex align-center">
              <v-icon size="14" color="grey" class="mr-1">mdi-weight-kilogram</v-icon>
              <span class="text-caption">{{ item.can_nang }} kg</span>
            </div>
          </div>
        </template>

        <template v-slot:item.thoi_gian_cho="{ item }">
          <v-chip 
            color="warning" 
            variant="tonal" 
            size="small"
          >
            {{ formatTime(item.ngay_tao) }}
          </v-chip>
        </template>

        <template v-slot:item.actions="{ item }">
          <v-btn 
            @click="removeFromList(item)"
            :loading="removing === item.id"
            color="error" 
            variant="outlined"
            size="small"
            prepend-icon="mdi-close"
          >
            Xóa
          </v-btn>
        </template>
      </v-data-table>
    </div>

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

    const headers = [
      { title: 'STT', key: 'stt', sortable: false, width: '80px' },
      { title: 'Bệnh nhân', key: 'ho_ten', sortable: true, width: '200px' },
      { title: 'Ngày sinh', key: 'ngay_sinh', sortable: true, width: '150px' },
      { title: 'Thông tin', key: 'thong_tin', sortable: false, width: '180px' },
      { title: 'Thời gian chờ', key: 'thoi_gian_cho', sortable: true, width: '150px' },
      { title: 'Thao tác', key: 'actions', sortable: false, width: '120px', align: 'center' }
    ]

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
      headers,
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