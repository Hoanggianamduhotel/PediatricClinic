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

    <!-- Main Content -->
    <v-main>
      <v-container fluid class="pa-6">
        <TiepTan />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import TiepTan from './components/TiepTan.vue'

export default {
  name: 'App',
  components: {
    TiepTan
  },
  setup() {
    const currentDateTime = ref('')
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

    onMounted(() => {
      updateDateTime()
      timeInterval = setInterval(updateDateTime, 60000) // Update every minute
    })

    onUnmounted(() => {
      if (timeInterval) {
        clearInterval(timeInterval)
      }
    })

    return {
      currentDateTime
    }
  }
}
</script>
