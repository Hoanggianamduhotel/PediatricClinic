<template>
  <div class="bg-white rounded-lg shadow">
    <div class="p-4 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900">{{ monthYear }}</h3>
        <div class="flex space-x-1">
          <button
            @click="previousMonth"
            class="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
          >
            <i data-feather="chevron-left" class="w-5 h-5"></i>
          </button>
          <button
            @click="nextMonth"
            class="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
          >
            <i data-feather="chevron-right" class="w-5 h-5"></i>
          </button>
        </div>
      </div>
    </div>

    <div class="p-4">
      <!-- Days of week header -->
      <div class="grid grid-cols-7 gap-1 mb-2">
        <div
          v-for="day in daysOfWeek"
          :key="day"
          class="p-2 text-xs font-medium text-gray-500 text-center"
        >
          {{ day }}
        </div>
      </div>

      <!-- Calendar grid -->
      <div class="grid grid-cols-7 gap-1">
        <div
          v-for="date in calendarDates"
          :key="`${date.year}-${date.month}-${date.date}`"
          @click="selectDate(date)"
          :class="[
            'relative p-2 text-sm cursor-pointer rounded-md transition-colors min-h-[80px] border border-transparent',
            {
              'text-gray-400': !date.isCurrentMonth,
              'bg-blue-600 text-white': isSelectedDate(date),
              'bg-blue-50 border-blue-200': isToday(date) && !isSelectedDate(date),
              'hover:bg-gray-100': date.isCurrentMonth && !isSelectedDate(date)
            }
          ]"
        >
          <span class="font-medium">{{ date.date }}</span>
          
          <!-- Appointments indicator -->
          <div v-if="getDateAppointments(date).length > 0" class="mt-1">
            <div
              v-for="appointment in getDateAppointments(date).slice(0, 2)"
              :key="appointment.id"
              @click.stop="$emit('appointmentClicked', appointment)"
              :class="[
                'text-xs p-1 rounded mb-1 truncate cursor-pointer',
                getAppointmentClass(appointment.status)
              ]"
              :title="`${appointment.time} - ${appointment.patient_name}`"
            >
              {{ appointment.time }} {{ appointment.patient_name }}
            </div>
            
            <div
              v-if="getDateAppointments(date).length > 2"
              class="text-xs text-gray-500"
            >
              +{{ getDateAppointments(date).length - 2 }} khác
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Legend -->
    <div class="px-4 pb-4">
      <div class="flex flex-wrap items-center gap-4 text-xs">
        <div class="flex items-center">
          <div class="w-3 h-3 bg-yellow-200 rounded mr-2"></div>
          <span class="text-gray-600">Đã đặt lịch</span>
        </div>
        <div class="flex items-center">
          <div class="w-3 h-3 bg-blue-200 rounded mr-2"></div>
          <span class="text-gray-600">Đã check-in</span>
        </div>
        <div class="flex items-center">
          <div class="w-3 h-3 bg-green-200 rounded mr-2"></div>
          <span class="text-gray-600">Hoàn thành</span>
        </div>
        <div class="flex items-center">
          <div class="w-3 h-3 bg-red-200 rounded mr-2"></div>
          <span class="text-gray-600">Đã hủy</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

const props = defineProps({
  appointments: {
    type: Array,
    default: () => []
  },
  selectedDate: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['dateSelected', 'appointmentClicked'])

const currentDate = ref(new Date())
const daysOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

const monthYear = computed(() => {
  const date = currentDate.value
  const months = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ]
  return `${months[date.getMonth()]} ${date.getFullYear()}`
})

const calendarDates = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  
  // Get first day of month and how many days in month
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()
  
  const dates = []
  
  // Add days from previous month
  const prevMonth = new Date(year, month - 1, 0)
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const date = prevMonth.getDate() - i
    dates.push({
      date,
      month: month - 1,
      year: month === 0 ? year - 1 : year,
      isCurrentMonth: false
    })
  }
  
  // Add days from current month
  for (let date = 1; date <= daysInMonth; date++) {
    dates.push({
      date,
      month,
      year,
      isCurrentMonth: true
    })
  }
  
  // Add days from next month to fill the grid
  const remaining = 42 - dates.length
  for (let date = 1; date <= remaining; date++) {
    dates.push({
      date,
      month: month + 1,
      year: month === 11 ? year + 1 : year,
      isCurrentMonth: false
    })
  }
  
  return dates
})

const selectDate = (date) => {
  const dateString = `${date.year}-${String(date.month + 1).padStart(2, '0')}-${String(date.date).padStart(2, '0')}`
  emit('dateSelected', dateString)
}

const isSelectedDate = (date) => {
  if (!props.selectedDate) return false
  const dateString = `${date.year}-${String(date.month + 1).padStart(2, '0')}-${String(date.date).padStart(2, '0')}`
  return dateString === props.selectedDate
}

const isToday = (date) => {
  const today = new Date()
  return (
    date.date === today.getDate() &&
    date.month === today.getMonth() &&
    date.year === today.getFullYear()
  )
}

const getDateAppointments = (date) => {
  const dateString = `${date.year}-${String(date.month + 1).padStart(2, '0')}-${String(date.date).padStart(2, '0')}`
  return props.appointments.filter(apt => apt.date === dateString)
}

const getAppointmentClass = (status) => {
  const classes = {
    scheduled: 'bg-yellow-200 text-yellow-800',
    'checked-in': 'bg-blue-200 text-blue-800',
    completed: 'bg-green-200 text-green-800',
    cancelled: 'bg-red-200 text-red-800'
  }
  return classes[status] || 'bg-gray-200 text-gray-800'
}

const previousMonth = () => {
  const newDate = new Date(currentDate.value)
  newDate.setMonth(newDate.getMonth() - 1)
  currentDate.value = newDate
}

const nextMonth = () => {
  const newDate = new Date(currentDate.value)
  newDate.setMonth(newDate.getMonth() + 1)
  currentDate.value = newDate
}

// Watch for selectedDate changes to update current month view
watch(() => props.selectedDate, (newDate) => {
  if (newDate) {
    const date = new Date(newDate)
    currentDate.value = new Date(date.getFullYear(), date.getMonth(), 1)
  }
})

onMounted(() => {
  if (window.feather) {
    window.feather.replace()
  }
})
</script>
