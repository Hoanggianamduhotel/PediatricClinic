<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Quản lý lịch hẹn</h1>
        <p class="text-gray-600">Lên lịch và quản lý cuộc hẹn</p>
      </div>
      <button
        @click="showForm = true"
        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
      >
        <i data-feather="plus" class="w-4 h-4 mr-2"></i>
        Đặt lịch hẹn
      </button>
    </div>

    <!-- Date Filter -->
    <div class="mb-6 bg-white p-4 rounded-lg shadow">
      <div class="flex items-center space-x-4">
        <label class="text-sm font-medium text-gray-700">Ngày:</label>
        <input
          v-model="selectedDate"
          type="date"
          @change="handleDateChange"
          class="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          @click="goToToday"
          class="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
        >
          Hôm nay
        </button>
      </div>
    </div>

    <!-- Calendar View -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2">
        <Calendar
          :appointments="appointments"
          :selected-date="selectedDate"
          @date-selected="handleDateSelected"
          @appointment-clicked="editAppointment"
        />
      </div>

      <!-- Appointments List -->
      <div class="bg-white rounded-lg shadow">
        <div class="p-4 border-b">
          <h3 class="text-lg font-semibold text-gray-900">
            Lịch hẹn ngày {{ formatDate(selectedDate) }}
          </h3>
        </div>
        <div class="p-4">
          <div v-if="loading" class="text-center text-gray-500 py-8">
            Đang tải...
          </div>
          <div v-else-if="dayAppointments.length === 0" class="text-center text-gray-500 py-8">
            Không có lịch hẹn nào
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="appointment in dayAppointments"
              :key="appointment.id"
              class="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
              @click="editAppointment(appointment)"
            >
              <div class="flex justify-between items-start">
                <div>
                  <p class="font-medium text-gray-900">{{ appointment.patient_name }}</p>
                  <p class="text-sm text-gray-600">{{ appointment.time }}</p>
                  <p class="text-sm text-gray-500">{{ appointment.reason }}</p>
                </div>
                <span
                  :class="getStatusClass(appointment.status)"
                  class="px-2 py-1 text-xs font-medium rounded-full"
                >
                  {{ getStatusText(appointment.status) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Appointment Form Modal -->
    <AppointmentForm
      v-if="showForm"
      :appointment="selectedAppointment"
      @close="closeForm"
      @save="handleSave"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAppointmentsStore } from '@/stores/appointments'
import AppointmentForm from '@/components/AppointmentForm.vue'
import Calendar from '@/components/Calendar.vue'
import { formatDate } from '@/utils/dateUtils'

const appointmentsStore = useAppointmentsStore()
const showForm = ref(false)
const selectedAppointment = ref(null)
const selectedDate = ref(new Date().toISOString().split('T')[0])

const appointments = computed(() => appointmentsStore.appointments)
const loading = computed(() => appointmentsStore.loading)

const dayAppointments = computed(() => {
  return appointments.value.filter(apt => apt.date === selectedDate.value)
    .sort((a, b) => a.time.localeCompare(b.time))
})

const handleDateChange = () => {
  appointmentsStore.fetchAppointments(selectedDate.value)
}

const handleDateSelected = (date) => {
  selectedDate.value = date
  appointmentsStore.fetchAppointments(date)
}

const goToToday = () => {
  selectedDate.value = new Date().toISOString().split('T')[0]
  appointmentsStore.fetchAppointments(selectedDate.value)
}

const editAppointment = (appointment) => {
  selectedAppointment.value = appointment
  showForm.value = true
}

const closeForm = () => {
  showForm.value = false
  selectedAppointment.value = null
}

const handleSave = () => {
  closeForm()
  appointmentsStore.fetchAppointments(selectedDate.value)
}

const getStatusClass = (status) => {
  const classes = {
    scheduled: 'bg-yellow-100 text-yellow-800',
    'checked-in': 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getStatusText = (status) => {
  const texts = {
    scheduled: 'Đã đặt lịch',
    'checked-in': 'Đã check-in',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy'
  }
  return texts[status] || status
}

onMounted(async () => {
  await appointmentsStore.fetchAppointments(selectedDate.value)
  
  if (window.feather) {
    window.feather.replace()
  }
})
</script>
