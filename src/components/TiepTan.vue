<template>
  <div class="tiep-tan">
    <!-- Main Actions -->
    <v-row class="mb-6">
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
                  <span v-if="patient.ngay_sinh">{{ formatDate(patient.ngay_sinh) }}</span>
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

    <!-- Add Patient Dialog -->
    <v-dialog v-model="showAddPatientDialog" max-width="600px" persistent>
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
          <v-card-text class="pa-6">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="newPatient.ho_ten"
                  label="Họ Tên *"
                  placeholder="Nhập họ tên đầy đủ"
                  variant="outlined"
                  required
                  :rules="[v => !!v || 'Họ tên là bắt buộc']"
                  prepend-inner-icon="mdi-account"
                />
              </v-col>
              
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="newPatient.ngay_sinh"
                  label="Ngày Sinh"
                  type="date"
                  variant="outlined"
                  prepend-inner-icon="mdi-calendar"
                />
              </v-col>
              
              <v-col cols="12" sm="6">
                <v-select
                  v-model="newPatient.gioi_tinh"
                  label="Giới Tính"
                  :items="['Nam', 'Nữ']"
                  variant="outlined"
                  prepend-inner-icon="mdi-gender-male-female"
                  clearable
                />
              </v-col>
              
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="newPatient.can_nang"
                  label="Cân Nặng (kg)"
                  type="number"
                  step="0.1"
                  variant="outlined"
                  placeholder="VD: 15.5"
                  prepend-inner-icon="mdi-scale"
                />
              </v-col>
              
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="newPatient.so_dien_thoai"
                  label="Số Điện Thoại"
                  type="tel"
                  variant="outlined"
                  placeholder="0123456789"
                  prepend-inner-icon="mdi-phone"
                />
              </v-col>
              
              <v-col cols="12">
                <v-textarea
                  v-model="newPatient.dia_chi"
                  label="Địa Chỉ"
                  variant="outlined"
                  placeholder="Nhập địa chỉ đầy đủ"
                  prepend-inner-icon="mdi-map-marker"
                  rows="2"
                />
              </v-col>
            </v-row>
          </v-card-text>
          
          <v-card-actions class="pa-6 pt-0">
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

    <!-- Selected Patient Details -->
    <v-row v-if="selectedPatient">
      <v-col cols="12">
        <v-card elevation="2">
          <v-card-title class="bg-info text-white d-flex align-center">
            <v-icon start>mdi-account-details</v-icon>
            Thông Tin Bệnh Nhân
          </v-card-title>
          <v-card-text class="pa-6">
            <v-row>
              <v-col cols="12" sm="6" md="4">
                <v-list-item class="pa-0">
                  <template #prepend>
                    <v-icon color="primary">mdi-account</v-icon>
                  </template>
                  <v-list-item-title class="text-caption text-grey-600">Họ Tên</v-list-item-title>
                  <v-list-item-subtitle class="text-h6 font-weight-medium">
                    {{ selectedPatient.ho_ten }}
                  </v-list-item-subtitle>
                </v-list-item>
              </v-col>
              
              <v-col v-if="selectedPatient.ngay_sinh" cols="12" sm="6" md="4">
                <v-list-item class="pa-0">
                  <template #prepend>
                    <v-icon color="primary">mdi-calendar</v-icon>
                  </template>
                  <v-list-item-title class="text-caption text-grey-600">Ngày Sinh</v-list-item-title>
                  <v-list-item-subtitle class="text-body-1">
                    {{ formatDate(selectedPatient.ngay_sinh) }}
                  </v-list-item-subtitle>
                </v-list-item>
              </v-col>
              
              <v-col v-if="selectedPatient.gioi_tinh" cols="12" sm="6" md="4">
                <v-list-item class="pa-0">
                  <template #prepend>
                    <v-icon color="primary">mdi-gender-male-female</v-icon>
                  </template>
                  <v-list-item-title class="text-caption text-grey-600">Giới Tính</v-list-item-title>
                  <v-list-item-subtitle class="text-body-1">
                    {{ selectedPatient.gioi_tinh }}
                  </v-list-item-subtitle>
                </v-list-item>
              </v-col>
              
              <v-col v-if="selectedPatient.can_nang" cols="12" sm="6" md="4">
                <v-list-item class="pa-0">
                  <template #prepend>
                    <v-icon color="primary">mdi-scale</v-icon>
                  </template>
                  <v-list-item-title class="text-caption text-grey-600">Cân Nặng</v-list-item-title>
                  <v-list-item-subtitle class="text-body-1">
                    {{ selectedPatient.can_nang }} kg
                  </v-list-item-subtitle>
                </v-list-item>
              </v-col>
              
              <v-col v-if="selectedPatient.so_dien_thoai" cols="12" sm="6" md="4">
                <v-list-item class="pa-0">
                  <template #prepend>
                    <v-icon color="primary">mdi-phone</v-icon>
                  </template>
                  <v-list-item-title class="text-caption text-grey-600">Số Điện Thoại</v-list-item-title>
                  <v-list-item-subtitle class="text-body-1">
                    {{ selectedPatient.so_dien_thoai }}
                  </v-list-item-subtitle>
                </v-list-item>
              </v-col>
              
              <v-col v-if="selectedPatient.dia_chi" cols="12">
                <v-list-item class="pa-0">
                  <template #prepend>
                    <v-icon color="primary">mdi-map-marker</v-icon>
                  </template>
                  <v-list-item-title class="text-caption text-grey-600">Địa Chỉ</v-list-item-title>
                  <v-list-item-subtitle class="text-body-1">
                    {{ selectedPatient.dia_chi }}
                  </v-list-item-subtitle>
                </v-list-item>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions class="pa-6 pt-0">
            <v-btn 
              @click="addToWaitingList(selectedPatient)"
              :loading="isAddingToWaitingList"
              color="warning"
              variant="elevated"
              prepend-icon="mdi-clock-plus"
            >
              Thêm vào danh sách chờ
            </v-btn>
            <v-spacer />
            <v-btn @click="selectedPatient = null" variant="outlined">
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
import { ref, onMounted } from 'vue'
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
    const showAddPatientDialog = ref(props.showAddDialog)
    const searchQuery = ref('')
    const searchResults = ref([])
    const selectedPatient = ref(null)
    const isSearching = ref(false)
    const isSubmitting = ref(false)
    const isAddingToWaitingList = ref(false)
    const message = ref(null)
    const showMessage = ref(false)
    
    const newPatient = ref({
      ho_ten: '',
      ngay_sinh: '',
      gioi_tinh: '',
      can_nang: '',
      dia_chi: '',
      so_dien_thoai: ''
    })

    // No need for axios setup - using Supabase client directly

    const displayMessage = (text, type = 'success') => {
      message.value = { text, type }
      showMessage.value = true
    }

    const closeAddPatientDialog = () => {
      showAddPatientDialog.value = false
      emit('show-add-dialog', false)
      newPatient.value = {
        ho_ten: '',
        ngay_sinh: '',
        gioi_tinh: '',
        can_nang: '',
        dia_chi: '',
        so_dien_thoai: ''
      }
    }

    const addPatient = async () => {
      try {
        isSubmitting.value = true
        const result = await patientService.createPatient(newPatient.value)
        
        if (result.success) {
          displayMessage(result.message || 'Thêm bệnh nhân thành công!')
          closeAddPatientDialog()
          emit('patient-added-to-waiting') // Update waiting count
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
      const date = new Date(dateString)
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    return {
      showAddPatientDialog,
      searchQuery,
      searchResults,
      selectedPatient,
      isSearching,
      isSubmitting,
      isAddingToWaitingList,
      message,
      newPatient,
      showMessage,
      displayMessage,
      closeAddPatientDialog,
      addPatient,
      searchPatients,
      selectPatient,
      addToWaitingList,
      formatDate
    }
  }
}
</script>