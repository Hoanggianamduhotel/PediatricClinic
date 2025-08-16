import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService } from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token'))
  
  const isAuthenticated = computed(() => !!token.value)
  
  const login = async (credentials) => {
    try {
      const response = await apiService.post('/auth/login', credentials)
      token.value = response.token
      user.value = response.user
      localStorage.setItem('token', response.token)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
  
  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
  }
  
  const checkAuth = async () => {
    if (!token.value) return
    
    try {
      const response = await apiService.get('/auth/me')
      user.value = response.user
    } catch (error) {
      logout()
    }
  }
  
  return {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    checkAuth
  }
})
