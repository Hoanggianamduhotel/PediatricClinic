<template>
  <v-app>
    <!-- Top App Bar -->
    <v-app-bar app color="white" elevation="0" height="64">
      <v-app-bar-nav-icon @click="drawer = !drawer" />
      
      <v-app-bar-title>
        <div class="d-flex align-center">
          <v-icon color="primary" size="32" class="mr-3">mdi-hospital-building</v-icon>
          <div>
            <div class="text-h6 font-weight-bold text-primary">Clinic BS Khang</div>
            <div class="text-caption text-grey-600">Tiếp Nhận Bệnh Nhân</div>
          </div>
        </div>
      </v-app-bar-title>

      <v-spacer />
      
      <!-- Date and Time -->
      <v-chip color="grey-lighten-2" variant="flat" size="small" class="mr-4">
        <v-icon start size="16">mdi-calendar</v-icon>
        Hôm nay, {{ currentDate }}
      </v-chip>
      
      <!-- Theme Toggle -->
      <v-btn 
        @click="toggleTheme" 
        :icon="isDark ? 'mdi-white-balance-sunny' : 'mdi-weather-night'"
        variant="text"
        class="mr-2"
      />
      
      <!-- Logout -->
      <v-btn 
        prepend-icon="mdi-logout" 
        color="primary" 
        variant="outlined"
        size="small"
      >
        Đăng xuất
      </v-btn>
    </v-app-bar>
    
    <!-- Purple separator line -->
    <div class="purple-separator"></div>

    <!-- Left Sidebar (Statistics) -->
    <v-navigation-drawer
      v-model="drawer"
      app
      temporary
      width="280"
      color="grey-lighten-5"
    >
      <!-- Sidebar Header -->
      <div class="pa-4 bg-primary">
        <div class="d-flex align-center text-white">
          <v-icon size="32" class="mr-3">mdi-view-dashboard</v-icon>
          <div>
            <div class="text-h6 font-weight-bold">Dashboard</div>
            <div class="text-caption">Bảng điều khiển</div>
          </div>
        </div>
      </div>
      <!-- Statistics Cards -->
      <div class="pa-4">
        <v-row dense>
          <v-col cols="6">
            <v-card color="success" variant="flat">
              <v-card-text class="text-center text-white pa-3">
                <div class="text-h6 font-weight-bold">{{ waitingCount }}</div>
                <div class="text-caption">Chờ khám</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="6">
            <v-card color="info" variant="flat">
              <v-card-text class="text-center text-white pa-3">
                <div class="text-h6 font-weight-bold">0</div>
                <div class="text-caption">Đã khám</div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </div>

      <v-list density="compact" nav>
        <v-list-item 
          prepend-icon="mdi-view-dashboard" 
          title="Bệnh Nhi" 
          subtitle="Quản lý bệnh nhân"
          :active="currentTab === 'tieptan'"
          @click="currentTab = 'tieptan'; drawer = false"
        />
        
        <v-divider class="my-2" />
        
        <v-list-item 
          prepend-icon="mdi-account-plus" 
          title="Tiếp Nhận BN"
          @click="currentTab = 'tieptan'; drawer = false"
        />
        
        <v-list-item 
          prepend-icon="mdi-format-list-bulleted" 
          title="Danh Sách Chờ"
          @click="currentTab = 'danhsachcho'; drawer = false"
        />
        
        <v-list-item 
          prepend-icon="mdi-chart-line" 
          title="Thống Kê DT"
        />
        
        <v-list-item 
          prepend-icon="mdi-calendar-check" 
          title="Hẹn Tái Khám"
        />
        
        <v-list-item 
          prepend-icon="mdi-file-document" 
          title="Danh Sách Khám..."
        />
        
        <v-list-item 
          prepend-icon="mdi-clipboard-list" 
          title="Lịch Nhắc Tiêm Chủng"
        />
        
        <v-list-item 
          prepend-icon="mdi-clipboard-check" 
          title="Danh Sách Kê Đơn"
        />
      </v-list>
    </v-navigation-drawer>

    <!-- Main Content -->
    <v-main class="bg-grey-lighten-4">
      <v-container fluid class="pa-6">
        <!-- Tab Content -->
        <div v-if="currentTab === 'tieptan'">
          <!-- Title and Action Button -->
          <div class="d-flex justify-space-between align-center mb-6">
            <div>
              <h2 class="text-h4 font-weight-bold text-primary mb-2">Danh Sách Chờ Khám</h2>
              <p class="text-grey-600">Quản lý bệnh nhân đang chờ khám</p>
            </div>
            <v-btn 
              color="primary" 
              size="large"
              prepend-icon="mdi-plus"
              @click="showAddPatientDialog = true"
            >
              Tiếp Nhận Bệnh Nhân
            </v-btn>
          </div>
          
          <!-- Reception Interface -->
          <TiepTan 
            @patient-added-to-waiting="updateWaitingCount" 
            @show-add-dialog="showAddPatientDialog = $event"
            :show-add-dialog="showAddPatientDialog"
          />
          
          <!-- Waiting List Below -->
          <div class="mt-8">
            <v-divider class="mb-6" />
            <DanhSachCho 
              @waiting-list-changed="updateWaitingCount" 
              :show-header="false"
            />
          </div>
        </div>
        
        <div v-else-if="currentTab === 'danhsachcho'">
          <DanhSachCho @waiting-list-changed="updateWaitingCount" />
        </div>
      </v-container>
    </v-main>

    <!-- Right Sidebar Background (Copyright) -->
    <div class="right-sidebar-background">
      <div class="copyright-text">
        2025. All Rights Reserved by Dr. Lee Min Khang
      </div>
    </div>

    <!-- Right Sidebar Purple Strip (Role Interface) -->
    <div class="right-sidebar-purple">
      <div class="role-text-vertical">
        {{ currentRole === 'doctor' ? 'Giao Diện Bác Sĩ' : 'Giao Diện Dược Sĩ' }}
      </div>
    </div>
  </v-app>
</template>

<style scoped>
.purple-separator {
  height: 3px;
  background: linear-gradient(90deg, #9c27b0, #673ab7);
  position: fixed;
  top: 64px;
  left: 0;
  right: 0;
  z-index: 1001;
}

.clinic-name-vertical {
  font-size: 14px;
  font-weight: bold;
  letter-spacing: 2px;
  line-height: 1.2;
}

.clinic-name-horizontal {
  padding: 16px;
}

.copyright-vertical {
  font-size: 8px;
  line-height: 1.1;
  writing-mode: vertical-lr;
  text-orientation: mixed;
}

/* Right Sidebar Styles */
.right-sidebar-background {
  position: fixed;
  top: 0;
  right: 0;
  width: 20%;
  height: 100vh;
  background: white;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  padding: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  z-index: 1200;
}

.copyright-text {
  text-align: center;
  color: #666;
  font-weight: 500;
  font-size: 14px;
}

.right-sidebar-purple {
  position: fixed;
  top: 0;
  right: 0;
  width: 80px;
  height: 100vh;
  background: purple;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1201;
}

.role-text-vertical {
  color: white;
  writing-mode: vertical-rl;
  text-orientation: upright;
  font-weight: 700;
  font-size: 16px;
  letter-spacing: 2px;
}

/* Custom scrollbar for drawers */
.v-navigation-drawer__content::-webkit-scrollbar {
  width: 4px;
}

.v-navigation-drawer__content::-webkit-scrollbar-track {
  background: transparent;
}

.v-navigation-drawer__content::-webkit-scrollbar-thumb {
  background: rgba(0,0,0,0.2);
  border-radius: 2px;
}
</style>

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
    const currentDate = ref('')
    const currentTab = ref('tieptan')
    const waitingCount = ref(0)
    const drawer = ref(false)
    const rightSidebarExpanded = ref(true)
    const isDark = ref(false)
    const showAddPatientDialog = ref(false)
    const currentRole = ref('doctor') // 'doctor' or 'pharmacist'
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
      currentDate.value = now.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    }

    const toggleTheme = () => {
      isDark.value = !isDark.value
      // You can implement theme switching logic here
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
      currentDate,
      currentTab,
      waitingCount,
      drawer,
      rightSidebarExpanded,
      isDark,
      showAddPatientDialog,
      currentRole,
      updateWaitingCount,
      toggleTheme
    }
  }
}
</script>
