import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiService } from '@/services/api'

export const usePatientsStore = defineStore('patients', () => {
  const patients = ref([])
  const loading = ref(false)
  const searchQuery = ref('')
  
  const fetchPatients = async () => {
    loading.value = true
    try {
      const response = await apiService.get('/patients')
      patients.value = response.data
    } catch (error) {
      console.error('Error fetching patients:', error)
    } finally {
      loading.value = false
    }
  }
  
  const searchPatients = async (query) => {
    loading.value = true
    try {
      const response = await apiService.get(`/patients/search?q=${query}`)
      patients.value = response.data
    } catch (error) {
      console.error('Error searching patients:', error)
    } finally {
      loading.value = false
    }
  }
  
  const createPatient = async (patientData) => {
    try {
      const response = await apiService.post('/patients', patientData)
      patients.value.push(response.data)
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
  
  const updatePatient = async (id, patientData) => {
    try {
      const response = await apiService.put(`/patients/${id}`, patientData)
      const index = patients.value.findIndex(p => p.id === id)
      if (index !== -1) {
        patients.value[index] = response.data
      }
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
  
  const deletePatient = async (id) => {
    try {
      await apiService.delete(`/patients/${id}`)
      patients.value = patients.value.filter(p => p.id !== id)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
  
  return {
    patients,
    loading,
    searchQuery,
    fetchPatients,
    searchPatients,
    createPatient,
    updatePatient,
    deletePatient
  }
})
