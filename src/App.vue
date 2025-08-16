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
                <div class="text-h6 font-weight-bold">{{ followUpStats.today }}</div>
                <div class="text-caption">Hẹn hôm nay</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="6">
            <v-card color="warning" variant="flat">
              <v-card-text class="text-center text-white pa-3">
                <div class="text-h6 font-weight-bold">{{ followUpStats.upcoming }}</div>
                <div class="text-caption">Hẹn sắp tới</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="6">
            <v-card color="error" variant="flat">
              <v-card-text class="text-center text-white pa-3">
                <div class="text-h6 font-weight-bold">{{ followUpStats.overdue }}</div>
                <div class="text-caption">Hẹn quá hạn</div>
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
          :subtitle="`${followUpStats.today} hôm nay, ${followUpStats.upcoming} sắp tới`"
          @click="currentTab = 'hentaikham'; drawer = false"
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
            @patient-added-to-waiting="handlePatientAdded" 
            @show-add-dialog="showAddPatientDialog = $event"
            :show-add-dialog="showAddPatientDialog"
          />
          
          <!-- Waiting List Below -->
          <div class="mt-8">
            <v-divider class="mb-6" />
            <DanhSachCho 
              @waiting-list-changed="updateWaitingCount" 
              :show-header="false"
              :key="waitingListKey"
              ref="danhSachChoRef"
            />
          </div>
        </div>
        
        <div v-else-if="currentTab === 'danhsachcho'">
          <DanhSachCho @waiting-list-changed="updateWaitingCount" />
        </div>
        
        <div v-else-if="currentTab === 'hentaikham'">
          <HenTaiKham />
        </div>
      </v-container>
    </v-main>

    <!-- Right Sidebar (Purple) -->
    <v-navigation-drawer
      app
      permanent
      location="right"
      :width="rightSidebarExpanded ? 200 : 60"
      class="purple-sidebar d-flex flex-column"
      color="purple darken-2"
    >
      <!-- Toggle Button -->
      <div class="text-center pt-2">
        <v-btn
          @click="rightSidebarExpanded = !rightSidebarExpanded"
          :icon="rightSidebarExpanded ? 'mdi-chevron-right' : 'mdi-chevron-left'"
          color="white"
          variant="text"
          size="small"
        />
      </div>
      
      <div class="flex-grow-1 d-flex align-center justify-center">
        <div class="text-center text-white">
          <div v-if="rightSidebarExpanded" class="clinic-name-horizontal">
            <div class="text-h6 font-weight-bold mb-2">CLINIC</div>
            <div class="text-h5 font-weight-bold mb-2">BS KHANG</div>
            <v-divider class="my-4 border-opacity-25" color="white" />
            <div class="text-caption">Pediatric Care</div>
            <div class="text-caption">Management System</div>
          </div>
          <div v-else class="clinic-name-vertical">
            C<br/>L<br/>I<br/>N<br/>I<br/>C<br/><br/>
            B<br/>S<br/><br/>
            K<br/>H<br/>A<br/>N<br/>G
          </div>
        </div>
      </div>
      
      <!-- Copyright Footer -->
      <div class="text-center text-white pa-2" :style="rightSidebarExpanded ? 'font-size: 10px; line-height: 1.3;' : 'font-size: 8px; line-height: 1.2;'">
        <div v-if="rightSidebarExpanded">
          <div>2025. All Rights Reserved by</div>
          <div class="font-weight-bold">Dr. Lee Min Khang</div>
        </div>
        <div v-else class="copyright-vertical">
          ©<br/>2<br/>0<br/>2<br/>5
        </div>
      </div>
    </v-navigation-drawer>

    <!-- Character Widget (Mascot) -->
    <CharacterWidget 
      v-if="showMascot"
      @character-click="handleMascotClick"
      @close="handleMascotClose"
    />
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

.purple-sidebar {
  background: linear-gradient(180deg, #9c27b0, #673ab7) !important;
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
import { ref, onMounted, onUnmounted, nextTick, getCurrentInstance } from 'vue'
import TiepTan from './components/TiepTan.vue'
import DanhSachCho from './components/DanhSachCho.vue'
import HenTaiKham from './components/HenTaiKham.vue'
import CharacterWidget from './components/CharacterWidget.vue'
import { waitingListService, followUpService } from './lib/supabase.js'

export default {
  name: 'App',
  components: {
    TiepTan,
    DanhSachCho,
    HenTaiKham,
    CharacterWidget
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
    const showMascot = ref(true)
    const waitingListKey = ref(0)
    const followUpStats = ref({
      today: 0,
      upcoming: 0,
      overdue: 0
    })
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

    const handleMascotClick = () => {
      console.log('Mascot clicked!')
      // You can add mascot interaction logic here
    }

    const handleMascotClose = () => {
      showMascot.value = false
    }

    const danhSachChoRef = ref(null)
    
    const handlePatientAdded = async () => {
      // Update waiting count
      updateWaitingCount()
      // Force refresh waiting list component by changing key
      waitingListKey.value++
      // Also directly reload the waiting list data
      await nextTick()
      if (danhSachChoRef.value && danhSachChoRef.value.loadWaitingList) {
        await danhSachChoRef.value.loadWaitingList()
      }
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

    const updateFollowUpStats = async () => {
      try {
        const result = await followUpService.getFollowUpStats()
        if (result.success) {
          followUpStats.value = result.data
        }
      } catch (error) {
        console.error('Failed to update follow-up stats:', error)
      }
    }

    onMounted(() => {
      updateDateTime()
      updateWaitingCount()
      updateFollowUpStats()
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
      showMascot,
      waitingListKey,
      followUpStats,
      danhSachChoRef,
      updateWaitingCount,
      updateFollowUpStats,
      toggleTheme,
      handleMascotClick,
      handleMascotClose,
      handlePatientAdded
    }
  }
}
</script>
