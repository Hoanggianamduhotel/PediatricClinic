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
      <v-list density="compact" nav>
        <v-list-item 
          prepend-icon="mdi-view-dashboard" 
          title="Bệnh Nhi" 
          subtitle="Quản lý bệnh nhân"
          active
        />
        
        <v-divider class="my-2" />
        
        <v-list-item 
          prepend-icon="mdi-account-plus" 
          title="Tiếp Nhận BN"
          @click="currentTab = 'tieptan'"
        />
        
        <v-list-item 
          prepend-icon="mdi-format-list-bulleted" 
          title="Danh Sách Chờ"
          @click="currentTab = 'danhsachcho'"
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

    <!-- Right Sidebar (Purple) -->
    <v-navigation-drawer
      app
      permanent
      location="right"
      width="80"
      class="purple-sidebar d-flex flex-column align-center"
      color="purple darken-2"
    >
      <div class="flex-grow-1 d-flex align-center">
        <div class="text-center text-white">
          <div class="clinic-name-vertical">
            C<br/>L<br/>I<br/>N<br/>I<br/>C<br/><br/>
            B<br/>S<br/><br/>
            K<br/>H<br/>A<br/>N<br/>G
          </div>
        </div>
      </div>
      
      <!-- Copyright Footer -->
      <div class="text-center text-white pa-2" style="font-size: 8px; line-height: 1.2;">
        <div>2025. All Rights Reserved by</div>
        <div class="font-weight-bold">Dr. Lee Min Khang</div>
      </div>
    </v-navigation-drawer>
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
