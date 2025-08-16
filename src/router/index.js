import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/patients',
    name: 'Patients',
    component: () => import('@/views/Patients.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/appointments',
    name: 'Appointments',
    component: () => import('@/views/Appointments.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/medical-records',
    name: 'MedicalRecords',
    component: () => import('@/views/MedicalRecords.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/staff',
    name: 'Staff',
    component: () => import('@/views/Staff.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/billing',
    name: 'Billing',
    component: () => import('@/views/Billing.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router
