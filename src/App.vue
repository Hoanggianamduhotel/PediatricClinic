<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center space-x-3">
            <div class="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 8.172V5L8 4z" />
              </svg>
            </div>
            <div>
              <h1 class="text-xl font-semibold text-gray-900">Clinic BS Khang</h1>
              <p class="text-sm text-gray-500">Hệ thống tiếp tân</p>
            </div>
          </div>
          <div class="text-sm text-gray-600">
            {{ currentDateTime }}
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <TiepTan />
    </main>
  </div>
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
        weekday: 'long',
        year: 'numeric',
        month: 'long',
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
