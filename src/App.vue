<template>
  <v-app>
    <!-- Header -->
    <v-app-bar color="primary" elevation="1" density="comfortable">
      <template #prepend>
        <v-icon color="white" size="large">mdi-hospital-building</v-icon>
      </template>
      
      <v-app-bar-title class="text-white">
        <div>
          <div class="text-h6 font-weight-bold">Clinic BS Khang</div>
          <div class="text-caption">Hệ thống tiếp tân</div>
        </div>
      </v-app-bar-title>

      <template #append>
        <v-chip color="white" variant="outlined" size="small">
          <v-icon start>mdi-clock-outline</v-icon>
          {{ currentDateTime }}
        </v-chip>
      </template>
    </v-app-bar>

    <!-- Navigation Tabs -->
    <v-toolbar color="white" elevation="1">
      <v-tabs v-model="currentTab" color="primary" align-tabs="start">
        <v-tab value="tieptan" prepend-icon="mdi-account-plus">
          Tiếp Tân
        </v-tab>
        <v-tab value="danhsachcho" prepend-icon="mdi-clock-outline">
          Danh Sách Chờ
          <v-chip 
            v-if="waitingCount > 0" 
            color="warning" 
            size="x-small" 
            class="ml-2"
          >
            {{ waitingCount }}
          </v-chip>
        </v-tab>
      </v-tabs>
    </v-toolbar>

    <!-- Main Content -->
    <v-main>
      <v-container fluid class="pa-6">
        <v-window v-model="currentTab">
          <v-window-item value="tieptan">
            <TiepTan @patient-added-to-waiting="updateWaitingCount" />
          </v-window-item>
          
          <v-window-item value="danhsachcho">
            <DanhSachCho @waiting-list-changed="updateWaitingCount" />
          </v-window-item>
        </v-window>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import TiepTan from './components/TiepTan.vue'
import DanhSachCho from './components/DanhSachCho.vue'
import { waitingListService } from './lib/supabase.js'

export default {
  name: 'App',
  components: {
    TiepTan,
    DanhSachCho
  },
  setup() {
    const currentDateTime = ref('')
    const currentTab = ref('tieptan')
    const waitingCount = ref(0)
    let timeInterval = null

    const updateDateTime = () => {
      const now = new Date()
      currentDateTime.value = now.toLocaleString('vi-VN', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const updateWaitingCount = async () => {
      try {
        const result = await waitingListService.getWaitingList()
        if (result.success) {
          waitingCount.value = result.data?.length || 0
        }
      } catch (error) {
        console.error('Failed to update waiting count:', error)
      }
    }

    onMounted(() => {
      updateDateTime()
      updateWaitingCount()
      timeInterval = setInterval(updateDateTime, 60000) // Update every minute
    })

    onUnmounted(() => {
      if (timeInterval) {
        clearInterval(timeInterval)
      }
    })

    return {
      currentDateTime,
      currentTab,
      waitingCount,
      updateWaitingCount
    }
  }
}
</script>
