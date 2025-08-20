import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService } from '@/services/api'

export const useAppointmentsStore = defineStore('appointments', () => {
  const appointments = ref([])
  const loading = ref(false)
  
  const todaysAppointments = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return appointments.value.filter(apt => apt.date === today)
  })
  
  const fetchAppointments = async (date = null) => {
    loading.value = true
    try {
      const url = date ? `/appointments?date=${date}` : '/appointments'
      const response = await apiService.get(url)
      appointments.value = response.data
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      loading.value = false
    }
  }
  
  const createAppointment = async (appointmentData) => {
    try {
      const response = await apiService.post('/appointments', appointmentData)
      appointments.value.push(response.data)
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
  
  const updateAppointment = async (id, appointmentData) => {
    try {
      const response = await apiService.put(`/appointments/${id}`, appointmentData)
      const index = appointments.value.findIndex(a => a.id === id)
      if (index !== -1) {
        appointments.value[index] = response.data
      }
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
  
  const deleteAppointment = async (id) => {
    try {
      await apiService.delete(`/appointments/${id}`)
      appointments.value = appointments.value.filter(a => a.id !== id)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
  
  const checkInPatient = async (appointmentId) => {
    try {
      const response = await apiService.patch(`/appointments/${appointmentId}/checkin`)
      const index = appointments.value.findIndex(a => a.id === appointmentId)
      if (index !== -1) {
        appointments.value[index] = response.data
      }
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
  
  return {
    appointments,
    loading,
    todaysAppointments,
    fetchAppointments,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    checkInPatient
  }
})
