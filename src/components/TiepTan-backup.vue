<template>
  <div class="reception-container pa-0">
    <!-- Search Section -->
    <v-row>
      <v-col cols="12">
        <v-card flat>
          <v-card-text class="pa-4">
            <v-text-field
              v-model="searchQuery"
              @input="searchPatients"
              placeholder="Tìm bệnh nhân theo tên, SĐT..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              clearable
              hide-details
              class="mb-4"
            />
            
            <!-- Search Results -->
            <v-list v-if="searchResults.length > 0" class="search-results">
              <v-list-item
                v-for="patient in searchResults"
                :key="patient.id"
                @click="selectPatient(patient)"
                class="cursor-pointer"
                rounded
              >
                <template #prepend>
                  <v-avatar color="primary" size="40">
                    <v-icon>mdi-account</v-icon>
                  </v-avatar>
                </template>
                
                <v-list-item-title>{{ patient.ho_ten }}</v-list-item-title>
                <v-list-item-subtitle>
                  <span v-if="patient.ngay_sinh">{{ formatAge(patient.ngay_sinh) }}</span>
                  <span v-if="patient.so_dien_thoai" class="ml-2">{{ patient.so_dien_thoai }}</span>
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
            
            <!-- No Results -->
            <v-alert 
              v-else-if="searchQuery && !isSearching" 
              type="info" 
              variant="tonal" 
              class="mt-4"
            >
              Không tìm thấy bệnh nhân nào
            </v-alert>
            
            <!-- Loading -->
            <v-progress-linear v-if="isSearching" indeterminate class="mt-4" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Patient Action Selection Dialog (Mobile only) -->
    <v-dialog v-model="showPatientActionDialog" fullscreen transition="dialog-bottom-transition">
      <v-card>
        <v-toolbar color="primary" class="text-white">
          <v-btn icon @click="closeDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>Chọn Hành Động</v-toolbar-title>
        </v-toolbar>

        <v-card-text class="pa-6">
          <div class="text-center mb-6">
            <v-icon size="100" color="primary">mdi-account-heart</v-icon>
            <h2 class="text-h5 mt-4 mb-2">Tiếp Nhận Bệnh Nhân</h2>
            <p class="text-body-1 text-grey-600">Chọn một trong hai tùy chọn bên dưới</p>
          </div>

          <v-row class="mt-8">
            <v-col cols="6">
              <v-card 
                @click="openAddPatient" 
                class="text-center pa-6 hover-card cursor-pointer"
                elevation="3"
                color="success"
              >
                <v-icon size="60" color="white" class="mb-3">mdi-account-plus</v-icon>
                <h3 class="text-h6 text-white mb-2">Thêm Mới</h3>
                <p class="text-body-2 text-white">Bệnh nhân mới</p>
              </v-card>
            </v-col>
            
            <v-col cols="6">
              <v-card 
                @click="openSearchPatient" 
                class="text-center pa-6 hover-card cursor-pointer"
                elevation="3"
                color="info"
              >
                <v-icon size="60" color="white" class="mb-3">mdi-magnify</v-icon>
                <h3 class="text-h6 text-white mb-2">Tìm Kiếm</h3>
                <p class="text-body-2 text-white">Bệnh nhân cũ</p>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Search Patient Dialog (Mobile) -->
    <v-dialog v-model="showSearchDialog" fullscreen transition="dialog-bottom-transition">
      <v-card>
        <v-toolbar color="info" class="text-white">
          <v-btn icon @click="showSearchDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>Tìm Bệnh Nhân Cũ</v-toolbar-title>
        </v-toolbar>

        <v-card-text class="pa-6">
          <v-text-field
            v-model="searchQuery"
            @input="searchPatients"
            placeholder="Tìm theo tên hoặc số điện thoại..."
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            autofocus
            class="mb-4"
          />

          <!-- Search Results in Dialog -->
          <div v-if="searchResults.length > 0" class="search-results-dialog">
            <v-card
              v-for="patient in searchResults"
              :key="patient.id"
              @click="selectPatient(patient)"
              class="mb-3 patient-card cursor-pointer hover-card"
              elevation="2"
            >
              <v-card-text class="pa-4">
                <div class="d-flex align-center">
                  <v-avatar color="primary" size="48" class="mr-4">
                    <v-icon color="white">mdi-account</v-icon>
                  </v-avatar>
                  
                  <div class="flex-grow-1">
                    <div class="text-h6 mb-1">{{ patient.ho_ten }}</div>
                    <div class="text-body-2 text-grey-600">
                      <span v-if="patient.ngay_sinh">{{ formatAge(patient.ngay_sinh) }}</span>
                      <span v-if="patient.so_dien_thoai" class="ml-2">{{ patient.so_dien_thoai }}</span>
                    </div>
                  </div>
                  
                  <v-icon color="primary">mdi-chevron-right</v-icon>
                </div>
              </v-card-text>
            </v-card>
          </div>

          <!-- Loading state -->
          <div v-else-if="isSearching" class="text-center py-8">
            <v-progress-circular indeterminate color="primary" size="50" />
            <p class="mt-3 text-grey-600">Đang tìm kiếm...</p>
          </div>

          <!-- No results -->
          <div v-else-if="searchQuery && !isSearching" class="text-center py-8">
            <v-icon size="80" color="grey-lighten-1">mdi-account-search</v-icon>
            <p class="text-h6 mt-3 text-grey-600">Không tìm thấy bệnh nhân</p>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Add Patient Dialog -->
    <v-dialog 
      v-model="showAddPatientDialog" 
      :max-width="$vuetify.display.mobile ? '100%' : '600px'"
      :fullscreen="$vuetify.display.mobile"
      persistent
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-card-title class="bg-success text-white d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <v-icon start>mdi-account-plus</v-icon>
            Thêm Bệnh Nhân Mới
          </div>
          <v-btn 
            @click="closeDialog" 
            icon="mdi-close" 
            variant="text" 
            color="white"
            size="small"
          />
        </v-card-title>
        
        <v-form @submit.prevent="addPatient" ref="patientForm">
          <v-card-text class="pa-3">
            <v-row class="gy-1">
              <v-col cols="12" class="pb-1">
                <v-text-field
                  v-model="newPatient.ho_ten"
                  label="Họ Tên *"
                  placeholder="Nhập họ tên đầy đủ"
                  variant="outlined"
                  required
                  :rules="[v => !!v || 'Họ tên là bắt buộc']"
                  prepend-inner-icon="mdi-account"
                  ref="hoTenField"
                  density="compact"
                  hide-details="auto"
                />
              </v-col>
              
              <v-col cols="12" class="pb-1">
                <v-text-field
                  v-model="displayNgaySinh"
                  label="Ngày Sinh"
                  placeholder="dd/mm/yyyy hoặc 09102003"
                  variant="outlined"
                  prepend-inner-icon="mdi-calendar"
                  ref="ngaySinhField"
                  @input="formatNgaySinhInput"
                  density="compact"
                  hide-details="auto"
                />
              </v-col>
              
              <v-col cols="12" class="pb-1">
                <v-text-field
                  v-model="newPatient.dia_chi"
                  label="Địa Chỉ"
                  variant="outlined"
                  placeholder="Nhập địa chỉ đầy đủ"
                  prepend-inner-icon="mdi-map-marker"
                  ref="diaChiField"
                  density="compact"
                  hide-details="auto"
                />
              </v-col>
              
              <v-col cols="12" class="pb-1">
                <v-text-field
                  v-model="newPatient.so_dien_thoai"
                  label="Số Điện Thoại"
                  type="tel"
                  variant="outlined"
                  placeholder="0123456789"
                  prepend-inner-icon="mdi-phone"
                  ref="soDienThoaiField"
                  density="compact"
                  hide-details="auto"
                />
              </v-col>
              
              <v-col cols="6" class="pb-1">
                <v-text-field
                  v-model="newPatient.can_nang"
                  label="Cân Nặng (kg)"
                  type="number"
                  variant="outlined"
                  placeholder="5.5"
                  prepend-inner-icon="mdi-weight"
                  ref="canNangField"
                  density="compact"
                  hide-details="auto"
                />
              </v-col>
              
              <v-col cols="6" class="pb-1">
                <v-select
                  v-model="newPatient.gioi_tinh"
                  label="Giới Tính"
                  :items="[{ title: 'Nam', value: 'Nam' }, { title: 'Nữ', value: 'Nữ' }]"
                  variant="outlined"
                  prepend-inner-icon="mdi-human-male-female"
                  density="compact"
                  hide-details="auto"
                />
              </v-col>
            </v-row>
          </v-card-text>
          
          <v-card-actions class="pa-3 pt-0">
            <v-spacer />
            <v-btn 
              @click="closeDialog" 
              variant="outlined"
              :disabled="isSubmitting"
            >
              Hủy
            </v-btn>
            <v-btn 
              type="submit"
              color="success"
              :loading="isSubmitting"
            >
              <v-icon start>mdi-check</v-icon>
              Thêm Bệnh Nhân
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <!-- Selected Patient Details -->
    <v-row v-if="selectedPatient">
      <v-col cols="12">
        <v-card>
          <v-card-title class="bg-info text-white">
            <v-icon start>mdi-account-details</v-icon>
            Thông Tin Bệnh Nhân
          </v-card-title>
          
          <v-card-text class="pa-4">
            <div class="patient-info">
              <h3 class="text-h5 mb-3">{{ selectedPatient.ho_ten }}</h3>
              
              <v-row>
                <v-col cols="6">
                  <div class="info-item">
                    <strong>Ngày sinh:</strong>
                    <span>{{ formatDate(selectedPatient.ngay_sinh) }}</span>
                  </div>
                </v-col>
                <v-col cols="6">
                  <div class="info-item">
                    <strong>Tuổi:</strong>
                    <span>{{ formatAge(selectedPatient.ngay_sinh) }}</span>
                  </div>
                </v-col>
                <v-col cols="6">
                  <div class="info-item">
                    <strong>Giới tính:</strong>
                    <span>{{ selectedPatient.gioi_tinh || 'Chưa có thông tin' }}</span>
                  </div>
                </v-col>
                <v-col cols="6">
                  <div class="info-item">
                    <strong>Cân nặng:</strong>
                    <span>{{ selectedPatient.can_nang ? selectedPatient.can_nang + ' kg' : 'Chưa có thông tin' }}</span>
                  </div>
                </v-col>
                <v-col cols="12">
                  <div class="info-item">
                    <strong>Địa chỉ:</strong>
                    <span>{{ selectedPatient.dia_chi || 'Chưa có thông tin' }}</span>
                  </div>
                </v-col>
                <v-col cols="12">
                  <div class="info-item">
                    <strong>Số điện thoại:</strong>
                    <span>{{ selectedPatient.so_dien_thoai || 'Chưa có thông tin' }}</span>
                  </div>
                </v-col>
              </v-row>
            </div>
          </v-card-text>
          
          <v-card-actions class="pa-4 pt-0">
            <v-btn 
              @click="addToWaitingList(selectedPatient)" 
              color="primary" 
              :loading="isAddingToWaitingList"
              size="large"
            >
              <v-icon start>mdi-plus</v-icon>
              Thêm vào danh sách chờ
            </v-btn>
            <v-btn @click="selectedPatient = null" variant="outlined" size="small" class="ml-2">
              Đóng
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Success/Error Messages -->
    <v-snackbar
      v-model="showMessage"
      :color="message?.type === 'success' ? 'success' : 'error'"
      :timeout="5000"
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
import { ref, onMounted, nextTick, getCurrentInstance, watch } from 'vue'
import { patientService, waitingListService } from '../lib/supabase.js'

export default {
  name: 'TiepTan',
  props: {
    showAddDialog: {
      type: Boolean,
      default: false
    }
  },
  emits: ['patient-added-to-waiting', 'show-add-dialog'],
  setup(props, { emit }) {
    const showAddPatientDialog = ref(false)
    const showPatientActionDialog = ref(false)
    const showSearchDialog = ref(false)
    const searchQuery = ref('')
    const searchResults = ref([])
    const selectedPatient = ref(null)
    const isSearching = ref(false)
    const isSubmitting = ref(false)
    const isAddingToWaitingList = ref(false)
    const message = ref(null)
    const showMessage = ref(false)
    const displayNgaySinh = ref('')
    
    const newPatient = ref({
      ho_ten: '',
      ngay_sinh: '',
      gioi_tinh: '',
      can_nang: '',
      dia_chi: '',
      so_dien_thoai: ''
    })

    // Dialog Reset Pattern - đúng như bạn hướng dẫn
    const resetDialogStates = () => {
      showPatientActionDialog.value = false
      showAddPatientDialog.value = false
      showSearchDialog.value = false
    }

    const openReceptionDialog = () => {
      resetDialogStates() // reset trước khi mở
      showPatientActionDialog.value = true
    }

    const closeDialog = () => {
      resetDialogStates()
      // Reset form data
      newPatient.value = {
        ho_ten: '',
        ngay_sinh: '',
        gioi_tinh: '',
        can_nang: '',
        dia_chi: '',
        so_dien_thoai: ''
      }
      displayNgaySinh.value = ''
      searchQuery.value = ''
      searchResults.value = []
      selectedPatient.value = null
      
      // Notify parent
      emit('show-add-dialog', false)
    }

    // Watch for props changes
    watch(() => props.showAddDialog, (newVal, oldVal) => {
      if (newVal && !oldVal) {
        openReceptionDialog()
      }
    })

    const displayMessage = (text, type = 'success') => {
      message.value = { text, type }
      showMessage.value = true
    }

    // Mobile dialog actions
    const openAddPatient = () => {
      resetDialogStates()
      showAddPatientDialog.value = true
    }

    const openSearchPatient = () => {
      resetDialogStates()
      showSearchDialog.value = true
    }

    // Format functions
    const formatNgaySinhInput = (event) => {
      let val = event.target.value.replace(/\D/g, '')
      
      if (val.length === 8) {
        val = `${val.slice(0, 2)}/${val.slice(2, 4)}/${val.slice(4)}`
      } else if (val.length === 6) {
        val = `${val.slice(0, 2)}/${val.slice(2, 4)}/${val.slice(4)}`
      } else if (val.length === 4) {
        val = `${val.slice(0, 2)}/${val.slice(2)}`
      } else if (val.length === 2) {
        val = `${val}/`
      }
      
      displayNgaySinh.value = val
      
      if (val.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        const [dd, mm, yyyy] = val.split('/')
        newPatient.value.ngay_sinh = `${yyyy}-${mm}-${dd}`
      } else {
        newPatient.value.ngay_sinh = ''
      }
    }

    const formatDate = (dateString) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('vi-VN')
    }

    const formatAge = (dateString) => {
      if (!dateString) return ''
      
      const birth = new Date(dateString)
      const today = new Date()
      
      let totalMonths = (today.getFullYear() - birth.getFullYear()) * 12
      totalMonths += today.getMonth() - birth.getMonth()
      
      if (today.getDate() < birth.getDate()) {
        totalMonths--
      }
      
      if (totalMonths < 36) {
        return `${totalMonths} tháng`
      }
      
      const years = totalMonths / 12
      const roundedYears = Math.round(years * 2) / 2
      
      return `${roundedYears} tuổi`
    }

    // API functions
    const addPatient = async () => {
      try {
        isSubmitting.value = true
        const result = await patientService.createPatient(newPatient.value)
        
        if (result.success) {
          displayMessage(result.message || 'Thêm bệnh nhân thành công!')
          closeDialog()
          emit('patient-added-to-waiting')
        } else {
          displayMessage(result.error || 'Có lỗi xảy ra', 'error')
        }
      } catch (error) {
        console.error('Add patient error:', error)
        displayMessage('Không thể thêm bệnh nhân', 'error')
      } finally {
        isSubmitting.value = false
      }
    }

    const searchPatients = async () => {
      if (!searchQuery.value.trim()) {
        searchResults.value = []
        return
      }

      try {
        isSearching.value = true
        const result = await patientService.getPatients(searchQuery.value)
        
        if (result.success) {
          searchResults.value = result.data || []
        } else {
          searchResults.value = []
          displayMessage(result.error || 'Không thể tìm kiếm bệnh nhân', 'error')
        }
      } catch (error) {
        console.error('Search patients error:', error)
        searchResults.value = []
        displayMessage('Không thể tìm kiếm bệnh nhân', 'error')
      } finally {
        isSearching.value = false
      }
    }

    const selectPatient = (patient) => {
      selectedPatient.value = patient
      searchQuery.value = ''
      searchResults.value = []
      resetDialogStates()
    }

    const addToWaitingList = async (patient) => {
      try {
        isAddingToWaitingList.value = true
        const result = await waitingListService.addToWaitingList(patient)
        
        if (result.success) {
          displayMessage(result.message || 'Đã thêm vào danh sách chờ thành công!')
          selectedPatient.value = null
          emit('patient-added-to-waiting')
        } else {
          displayMessage(result.error || 'Không thể thêm vào danh sách chờ', 'error')
        }
      } catch (error) {
        console.error('Add to waiting list error:', error)
        displayMessage('Không thể thêm vào danh sách chờ', 'error')
      } finally {
        isAddingToWaitingList.value = false
      }
    }

    return {
      showAddPatientDialog,
      showPatientActionDialog,
      showSearchDialog,
      searchQuery,
      searchResults,
      selectedPatient,
      isSearching,
      isSubmitting,
      isAddingToWaitingList,
      message,
      newPatient,
      showMessage,
      displayNgaySinh,
      displayMessage,
      closeDialog,
      addPatient,
      searchPatients,
      selectPatient,
      addToWaitingList,
      formatDate,
      formatAge,
      formatNgaySinhInput,
      openAddPatient,
      openSearchPatient,
      resetDialogStates,
      openReceptionDialog
    }
  }
}
</script>

<style scoped>
.reception-container {
  max-width: 100%;
}

.search-results {
  max-height: 300px;
  overflow-y: auto;
}

.search-results-dialog {
  max-height: 400px;
  overflow-y: auto;
}

.patient-card {
  transition: transform 0.2s;
}

.patient-card:hover {
  transform: translateY(-2px);
}

.hover-card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.hover-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.info-item {
  margin-bottom: 8px;
}

.info-item strong {
  display: inline-block;
  width: 120px;
  color: #1976d2;
}

.cursor-pointer {
  cursor: pointer;
}
</style>