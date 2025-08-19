<template>
  <div class="tiep-tan">


    <!-- Desktop Actions - Keep Original Layout -->
    <v-row v-if="!$vuetify.display.mobile && !patientInfoOnly" class="mb-4">
      <!-- New Patient Card -->
      <v-col cols="12" md="6">
        <v-card elevation="2" height="100%" class="rounded-xl">
          <v-card-title class="text-white d-flex align-center" style="background-color: #4caf50;">
            <v-icon start>mdi-account-plus</v-icon>
            Thêm Bệnh Nhân Mới
          </v-card-title>
          <v-card-text class="pa-6">
            <p class="text-body-1 mb-4">Đăng ký thông tin bệnh nhân mới vào hệ thống</p>
            <v-btn 
              @click="showAddPatientDialog = true" 
              size="large"
              block
              prepend-icon="mdi-account-plus"
              class="rounded-lg"
              style="background-color: #4caf50; color: white;"
            >
              Thêm Bệnh Nhân
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Search Patient Card -->
      <v-col cols="12" md="6">
        <v-card elevation="2" height="100%" class="rounded-xl">
          <v-card-title class="text-white d-flex align-center" style="background-color: #2196F3;">
            <v-icon start>mdi-magnify</v-icon>
            Tìm Bệnh Cũ
          </v-card-title>
          <v-card-text class="pa-6">
            <v-text-field
              v-model="searchQuery"
              @input="searchPatients"
              label="Nhập tên bệnh nhân"
              placeholder="VD: đinh minh"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              clearable
              hide-details="auto"
              class="rounded-lg"
            />
            
            <!-- Search Results -->
            <v-list v-if="searchResults.length > 0" class="mt-4" max-height="300" style="overflow-y: auto;">
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
          <v-btn icon @click="closeAddPatientDialog">
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

        <v-card-text class="pa-0">
          <div class="px-4 pt-4">
            <v-text-field
              v-model="searchQuery"
              @input="searchPatients"
              label="Nhập tên bệnh nhân"
              placeholder="VD: đinh minh"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              clearable
              autofocus
              hide-details="auto"
              class="mb-4"
            />
          </div>
          
          <!-- Search Results -->
          <div v-if="searchResults.length > 0">
            <div class="px-4">
              <h3 class="text-h6 mb-4">Kết quả tìm kiếm:</h3>
            </div>
            <v-list class="pa-0">
              <v-card
                v-for="patient in searchResults" 
                :key="patient.id"
                @click="selectPatient(patient); showSearchDialog = false"
                class="pa-4 border-b"
                variant="flat"
                hover
              >
                <div class="d-flex justify-space-between align-start">
                  <div class="flex-grow-1 pr-2">
                    <div class="text-body-1 font-weight-medium mb-1">{{ patient.ho_ten }}</div>
                    <div v-if="patient.ngay_sinh" class="text-body-2 text-grey-600 mb-1">
                      <v-icon size="14" class="mr-1">mdi-calendar</v-icon>
                      {{ formatDate(patient.ngay_sinh) }} • {{ formatAge(patient.ngay_sinh) }}
                    </div>
                    <div v-if="patient.so_dien_thoai" class="text-body-2 text-grey-600">
                      <v-icon size="14" class="mr-1">mdi-phone</v-icon>
                      {{ patient.so_dien_thoai }}
                    </div>
                  </div>
                  <v-icon color="grey-400" size="20">mdi-chevron-right</v-icon>
                </div>
              </v-card>
            </v-list>
          </div>
          
          <!-- No Results -->
          <div class="px-4">
            <v-alert 
              v-if="searchQuery && !isSearching && !searchResults.length" 
              type="info" 
              variant="tonal" 
              class="mt-4"
            >
              <v-icon>mdi-information</v-icon>
              <strong>Không tìm thấy bệnh nhân nào</strong>
              <br>Hãy thử tìm kiếm với từ khóa khác
            </v-alert>
            
            <!-- Loading -->
            <div v-if="isSearching" class="text-center mt-8">
              <v-progress-circular indeterminate color="primary" size="60"></v-progress-circular>
              <p class="text-body-1 mt-4">Đang tìm kiếm...</p>
            </div>

            <!-- Empty State -->
            <div v-if="!searchQuery && !searchResults.length" class="text-center mt-8">
              <v-icon size="80" color="grey-400">mdi-magnify</v-icon>
              <h3 class="text-h6 mt-4 text-grey-600">Tìm Kiếm Bệnh Nhân</h3>
              <p class="text-body-2 text-grey-500">Nhập tên bệnh nhân để bắt đầu tìm kiếm</p>
            </div>
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
            @click="closeAddPatientDialog" 
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
                  @input="capitalizePatientName"
                  @keydown.enter.prevent="focusNext('ngaySinhField')"
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
                  @keydown.enter.prevent="focusNext('diaChiField')"
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
                  @keydown.enter.prevent="focusNext('soDienThoaiField')"
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
                  @keydown.enter.prevent="focusNext('canNangField')"
                  density="compact"
                  hide-details="auto"
                />
              </v-col>
              
              <v-col cols="6" class="pb-1">
                <v-text-field
                  v-model="newPatient.can_nang"
                  label="Cân Nặng (kg)"
                  type="number"
                  step="0.1"
                  variant="outlined"
                  placeholder="VD: 15.5"
                  prepend-inner-icon="mdi-scale"
                  ref="canNangField"
                  @keydown.enter.prevent="focusNext('submit')"
                  density="compact"
                  hide-details="auto"
                />
              </v-col>
              
              <v-col cols="6" class="pb-1">
                <v-select
                  v-model="newPatient.gioi_tinh"
                  label="Giới Tính"
                  :items="['Nam', 'Nữ']"
                  variant="outlined"
                  prepend-inner-icon="mdi-gender-male-female"
                  clearable
                  ref="gioiTinhField"
                  density="compact"
                  hide-details="auto"
                />
              </v-col>
            </v-row>
          </v-card-text>
          
          <v-card-actions class="pa-3 pt-0">
            <v-spacer />
            <v-btn 
              @click="closeAddPatientDialog" 
              variant="outlined"
              color="grey"
            >
              Hủy
            </v-btn>
            <v-btn 
              type="submit" 
              :loading="isSubmitting"
              color="success"
              variant="elevated"
            >
              Lưu Bệnh Nhân
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <!-- Selected Patient Details - Moved up before waiting list -->
    <v-row v-if="selectedPatient" class="mb-4">
      <v-col cols="12">
        <v-card elevation="2">
          <v-card-title class="bg-info text-white d-flex align-center">
            <v-icon start>mdi-account-details</v-icon>
            Thông Tin Bệnh Nhân
          </v-card-title>
          <v-card-text class="pa-4">
            <v-row class="gy-1">
              <!-- Họ tên - Full width -->
              <v-col cols="12">
                <v-list-item class="pa-0 mb-2">
                  <template #prepend>
                    <v-icon color="primary" size="small">mdi-account</v-icon>
                  </template>
                  <v-list-item-title class="text-caption text-grey-400 font-weight-light">Họ Tên</v-list-item-title>
                  <v-list-item-subtitle class="text-body-1 font-weight-medium">
                    {{ selectedPatient.ho_ten }}
                  </v-list-item-subtitle>
                </v-list-item>
              </v-col>
              
              <!-- Ngày sinh và Cân nặng cùng dòng -->
              <v-col cols="6">
                <v-list-item class="pa-0">
                  <template #prepend>
                    <v-icon color="primary" size="small">mdi-calendar</v-icon>
                  </template>
                  <v-list-item-title class="text-caption text-grey-400 font-weight-light">Ngày Sinh / Tuổi</v-list-item-title>
                  <v-list-item-subtitle class="text-caption">
                    {{ formatDate(selectedPatient.ngay_sinh) }}<br>
                    <small class="text-success font-weight-medium">{{ formatAge(selectedPatient.ngay_sinh) }}</small>
                  </v-list-item-subtitle>
                </v-list-item>
              </v-col>
              
              <v-col v-if="selectedPatient.can_nang" cols="6">
                <v-list-item class="pa-0">
                  <template #prepend>
                    <v-icon color="primary" size="small">mdi-scale</v-icon>
                  </template>
                  <v-list-item-title class="text-caption text-grey-400 font-weight-light">Cân Nặng</v-list-item-title>
                  <v-list-item-subtitle class="text-caption">
                    {{ selectedPatient.can_nang }} kg
                  </v-list-item-subtitle>
                </v-list-item>
              </v-col>
              
              <!-- Số điện thoại và Địa chỉ cùng dòng -->
              <v-col v-if="selectedPatient.so_dien_thoai" cols="6">
                <v-list-item class="pa-0">
                  <template #prepend>
                    <v-icon color="primary" size="small">mdi-phone</v-icon>
                  </template>
                  <v-list-item-title class="text-caption text-grey-400 font-weight-light">Số Điện Thoại</v-list-item-title>
                  <v-list-item-subtitle class="text-caption">
                    {{ selectedPatient.so_dien_thoai }}
                  </v-list-item-subtitle>
                </v-list-item>
              </v-col>
              
              <v-col v-if="selectedPatient.dia_chi" cols="6">
                <v-list-item class="pa-0">
                  <template #prepend>
                    <v-icon color="primary" size="small">mdi-map-marker</v-icon>
                  </template>
                  <v-list-item-title class="text-caption text-grey-400 font-weight-light">Địa Chỉ</v-list-item-title>
                  <v-list-item-subtitle class="text-caption">
                    {{ selectedPatient.dia_chi }}
                  </v-list-item-subtitle>
                </v-list-item>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions class="pa-4 pt-0 d-flex">
            <v-btn 
              @click="addToWaitingList(selectedPatient)"
              :loading="isAddingToWaitingList"
              color="warning"
              variant="elevated"
              prepend-icon="mdi-clock-plus"
              size="small"
              class="flex-shrink-0"
              style="width: 67%;"
            >
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
    },
    patientInfoOnly: {
      type: Boolean,
      default: false
    }
  },
  emits: ['patient-added-to-waiting', 'show-add-dialog'],
  setup(props, { emit }) {
    const showAddPatientDialog = ref(props.showAddDialog)
    const showPatientActionDialog = ref(props.showAddDialog)
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

    // Watch for props changes to show dialog
    watch(() => props.showAddDialog, (newVal, oldVal) => {
      console.log('showAddDialog changed:', oldVal, '->', newVal)
      if (newVal && !oldVal) {
        // Only open when changing from false to true
        showPatientActionDialog.value = true
        showAddPatientDialog.value = false
        showSearchDialog.value = false
      }
    })

    const displayMessage = (text, type = 'success') => {
      message.value = { text, type }
      showMessage.value = true
    }

    const closeAddPatientDialog = () => {
      console.log('Closing dialogs...')
      showAddPatientDialog.value = false
      showPatientActionDialog.value = false
      showSearchDialog.value = false
      
      // Reset all data
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
      
      // Emit to parent to reset state
      emit('show-add-dialog', false)
    }

    // Template refs for fields
    const hoTenField = ref()
    const ngaySinhField = ref()  
    const diaChiField = ref()
    const soDienThoaiField = ref()
    const canNangField = ref()
    
    const focusNext = (nextFieldName) => {
      nextTick(() => {
        let nextField = null
        
        switch(nextFieldName) {
          case 'ngaySinhField':
            nextField = ngaySinhField.value
            break
          case 'diaChiField':
            nextField = diaChiField.value
            break
          case 'soDienThoaiField':
            nextField = soDienThoaiField.value
            break
          case 'canNangField':
            nextField = canNangField.value
            break
          case 'submit':
            addPatient()
            return
        }
        
        if (nextField) {
          // Try multiple ways to focus Vuetify components
          if (nextField.focus) {
            nextField.focus()
          } else if (nextField.$el) {
            const input = nextField.$el.querySelector('input, textarea')
            if (input) {
              input.focus()
            }
          }
        }
      })
    }

    // Format date from DB (YYYY-MM-DD) to display format (DD/MM/YYYY)
    const formatFromDB = (value) => {
      if (!value) return value
      const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
      if (match) {
        const [, yyyy, mm, dd] = match
        return `${dd}/${mm}/${yyyy}`
      }
      return value
    }

    // Format date from display format (DD/MM/YYYY) to DB format (YYYY-MM-DD)
    const formatToDB = (value) => {
      if (!value) return value
      const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
      if (match) {
        const [, dd, mm, yyyy] = match
        return `${yyyy}-${mm}-${dd}`
      }
      return value
    }

    // Smart date input formatting
    const formatNgaySinhInput = (event) => {
      let val = event.target.value.replace(/\D/g, '')
      
      // Auto format when user types 8 digits like 09102003
      if (val.length === 8) {
        val = `${val.slice(0, 2)}/${val.slice(2, 4)}/${val.slice(4)}`
      } else if (val.length === 6) {
        // Format partial input like 091020 -> 09/10/20
        val = `${val.slice(0, 2)}/${val.slice(2, 4)}/${val.slice(4)}`
      } else if (val.length === 4) {
        // Format partial input like 0910 -> 09/10
        val = `${val.slice(0, 2)}/${val.slice(2)}`
      } else if (val.length === 2) {
        // Format partial input like 09 -> 09/
        val = `${val}/`
      }
      
      displayNgaySinh.value = val
      
      // Convert to DB format for storage if complete
      if (val.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        newPatient.value.ngay_sinh = formatToDB(val)
      } else {
        newPatient.value.ngay_sinh = ''
      }
    }

    const addPatient = async () => {
      try {
        isSubmitting.value = true
        console.log('Sending patient data:', newPatient.value)
        const result = await patientService.createPatient(newPatient.value)
        console.log('Patient creation result:', result)
        
        if (result.success) {
          displayMessage(result.message || 'Thêm bệnh nhân thành công!')
          closeAddPatientDialog()
          emit('patient-added-to-waiting') // This will trigger handlePatientAdded in App.vue
          // No need to manually add to waiting list - it's done automatically in createPatient
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
    }

    const addToWaitingList = async (patient) => {
      try {
        isAddingToWaitingList.value = true
        const result = await waitingListService.addToWaitingList(patient)
        
        if (result.success) {
          displayMessage(result.message || 'Đã thêm vào danh sách chờ thành công!')
          selectedPatient.value = null // Close patient details
          emit('patient-added-to-waiting') // Notify parent to update count
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

    const formatDate = (dateString) => {
      if (!dateString) return ''
      
      // If already in DD/MM/YYYY format, return as-is
      if (dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        return dateString
      }
      
      // If in YYYY-MM-DD format from database, convert to DD/MM/YYYY
      return formatFromDB(dateString) || dateString
    }

    // Function to capitalize patient name automatically
    const capitalizePatientName = () => {
      const name = newPatient.value.ho_ten
      if (name) {
        newPatient.value.ho_ten = name
          .toLowerCase()
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
      }
    }

    // Function to format age based on birth date
    const formatAge = (birthDate) => {
      if (!birthDate) return ''
      
      const birth = new Date(birthDate)
      const today = new Date()
      
      // Calculate total months
      let totalMonths = (today.getFullYear() - birth.getFullYear()) * 12
      totalMonths += today.getMonth() - birth.getMonth()
      
      // Adjust if current date hasn't reached birth day of month
      if (today.getDate() < birth.getDate()) {
        totalMonths--
      }
      
      // For children under 36 months, show months
      if (totalMonths < 36) {
        return `${totalMonths} tháng tuổi`
      }
      
      // For children over 36 months, show years with 0.5 precision
      const years = totalMonths / 12
      const roundedYears = Math.round(years * 2) / 2 // Round to nearest 0.5
      
      return `${roundedYears} tuổi`
    }

    // Mobile dialog actions
    const openAddPatient = () => {
      showPatientActionDialog.value = false
      showAddPatientDialog.value = true
    }

    const openSearchPatient = () => {
      showPatientActionDialog.value = false
      showSearchDialog.value = true
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
      hoTenField,
      ngaySinhField,
      diaChiField,
      soDienThoaiField,
      canNangField,
      displayMessage,
      closeAddPatientDialog,
      addPatient,
      searchPatients,
      selectPatient,
      addToWaitingList,
      formatDate,
      formatAge,
      capitalizePatientName,
      focusNext,
      formatNgaySinhInput,
      formatFromDB,
      formatToDB,
      openAddPatient,
      openSearchPatient
    }
  }
}
</script>