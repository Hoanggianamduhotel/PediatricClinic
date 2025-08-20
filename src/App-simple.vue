<template>
  <v-app>
    <!-- Topbar + Navigation Tabs as one unit -->
    <transition name="slide-down">
      <div v-if="showNavigation" class="nav-wrapper">
        <!-- Top App Bar -->
        <v-app-bar 
          app 
          color="white" 
          elevation="0" 
          height="56"
        >
          <v-app-bar-title>
            <div class="d-flex align-center">
              <v-icon color="primary" size="24" class="mr-2">mdi-hospital-building</v-icon>
              <div class="text-subtitle-1 font-weight-bold text-primary">Clinic BS Khang</div>
            </div>
          </v-app-bar-title>
          <v-spacer />
          <v-btn icon="mdi-logout" color="primary" variant="text" size="small" />
        </v-app-bar>
        
        <!-- Purple separator line -->
        <div class="purple-separator"></div>

        <!-- Mobile Navigation Tabs -->
        <v-tabs 
          v-model="currentTab"
          fixed-tabs
          bg-color="white"
          color="primary"
          align-tabs="center"
          style="position: sticky; top: 59px; z-index: 1000;"
        >
          <v-tab value="tieptan">
            <v-icon start>mdi-account-plus</v-icon>
            Tiếp Tân
          </v-tab>
          <v-tab value="danhsachcho">
            <v-icon start>mdi-format-list-bulleted</v-icon>
            DS Chờ
          </v-tab>
          <v-tab value="thongke">
            <v-icon start>mdi-chart-line</v-icon>
            Thống Kê
          </v-tab>
        </v-tabs>
      </div>
    </transition>

    <!-- Main Content -->
    <v-main class="bg-grey-lighten-4">

      <!-- Tab Content with scroll detection -->
      <div 
        @scroll.passive="onScroll"
        ref="scrollArea"
        style="height: calc(100vh - 107px); overflow-y: auto;"
      >
        <v-container fluid class="pa-0">
          <div v-if="currentTab === 'tieptan'" class="pa-4">
            <h2>Tiếp Tân</h2>
            <div v-for="i in 50" :key="i" class="mb-2">
              📋 Bệnh nhân số {{ i }}
            </div>
          </div>
          
          <div v-else-if="currentTab === 'danhsachcho'">
            <!-- Title right under tabs -->
            <div class="px-4 py-2 bg-warning">
              <div class="d-flex justify-space-between align-center">
                <h2 class="text-subtitle-1 font-weight-bold text-black">Danh Sách Chờ Khám</h2>
                <v-chip color="primary" variant="tonal" size="small">
                  Tổng số: 5
                </v-chip>
              </div>
            </div>
            
            <div class="pa-4">
              <div v-for="i in 50" :key="i" class="mb-2">
                📋 Chờ khám số {{ i }}
              </div>
            </div>
          </div>
          
          <div v-else-if="currentTab === 'thongke'" class="pa-4">
            <h2>Thống Kê</h2>
            <div v-for="i in 50" :key="i" class="mb-2">
              📊 Thống kê số {{ i }}
            </div>
          </div>
        </v-container>
      </div>
    </v-main>
  </v-app>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'App',
  setup() {
    const currentTab = ref('tieptan')
    const showNavigation = ref(true)
    const scrollArea = ref(null)
    let lastScrollTop = 0

    // Scroll handler for swipe-to-hide navigation
    const onScroll = (event) => {
      if (!event.target) return
      
      const currentScrollTop = event.target.scrollTop
      
      if (currentScrollTop > lastScrollTop && currentScrollTop > 50) {
        // Scrolling down and past threshold => hide navigation
        showNavigation.value = false
      } else if (currentScrollTop < lastScrollTop) {
        // Scrolling up => show navigation
        showNavigation.value = true
      }
      
      lastScrollTop = currentScrollTop
    }

    return {
      currentTab,
      showNavigation,
      scrollArea,
      onScroll
    }
  }
}
</script>

<style scoped>
.nav-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1001;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.purple-separator {
  height: 4px;
  background: linear-gradient(90deg, #9c27b0, #673ab7);
}

/* Swipe-to-hide navigation transition */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
</style>