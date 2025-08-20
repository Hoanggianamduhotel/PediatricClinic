import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTiepTanStore = defineStore('tieptan', () => {
  // Dialog states
  const showPatientActionDialog = ref(false)
  const showAddPatientDialog = ref(false)
  const showSearchDialog = ref(false)
  
  // Form data
  const newPatient = ref({
    ho_ten: '',
    ngay_sinh: '',
    gioi_tinh: '',
    can_nang: '',
    dia_chi: '',
    so_dien_thoai: ''
  })
  
  const displayNgaySinh = ref('')
  const searchQuery = ref('')
  const searchResults = ref([])
  const selectedPatient = ref(null)
  
  // Loading states
  const isSubmitting = ref(false)
  const isAddingToWaitingList = ref(false)
  
  // Actions
  const openPatientActionDialog = () => {
    console.log('Pinia: Opening patient action dialog')
    showPatientActionDialog.value = true
    showAddPatientDialog.value = false
    showSearchDialog.value = false
  }
  
  const openAddPatientDialog = () => {
    console.log('Pinia: Opening add patient dialog')
    showAddPatientDialog.value = true
    showPatientActionDialog.value = false
    showSearchDialog.value = false
  }
  
  const openSearchDialog = () => {
    console.log('Pinia: Opening search dialog')
    showSearchDialog.value = true
    showAddPatientDialog.value = false
    showPatientActionDialog.value = false
  }
  
  const closeAllDialogs = () => {
    console.log('Pinia: Closing all dialogs')
    showPatientActionDialog.value = false
    showAddPatientDialog.value = false
    showSearchDialog.value = false
  }
  
  const resetAllData = () => {
    console.log('Pinia: Resetting all data')
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
    isSubmitting.value = false
    isAddingToWaitingList.value = false
  }
  
  const resetAndCloseAll = () => {
    console.log('Pinia: Reset and close all')
    closeAllDialogs()
    resetAllData()
  }
  
  const setSelectedPatient = (patient) => {
    console.log('Pinia: Setting selected patient:', patient)
    selectedPatient.value = patient
  }
  
  const setSearchResults = (results) => {
    console.log('Pinia: Setting search results:', results.length, 'items')
    searchResults.value = results
  }
  
  const setLoading = (type, value) => {
    console.log(`Pinia: Setting ${type} loading to:`, value)
    if (type === 'submitting') {
      isSubmitting.value = value
    } else if (type === 'addingToWaiting') {
      isAddingToWaitingList.value = value
    }
  }
  
  return {
    // States
    showPatientActionDialog,
    showAddPatientDialog,
    showSearchDialog,
    newPatient,
    displayNgaySinh,
    searchQuery,
    searchResults,
    selectedPatient,
    isSubmitting,
    isAddingToWaitingList,
    
    // Actions
    openPatientActionDialog,
    openAddPatientDialog,
    openSearchDialog,
    closeAllDialogs,
    resetAllData,
    resetAndCloseAll,
    setSelectedPatient,
    setSearchResults,
    setLoading
  }
})