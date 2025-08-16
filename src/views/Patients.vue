<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Quản lý bệnh nhân</h1>
        <p class="text-gray-600">Danh sách và thông tin bệnh nhân</p>
      </div>
      <button
        @click="showForm = true"
        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
      >
        <i data-feather="plus" class="w-4 h-4 mr-2"></i>
        Thêm bệnh nhân
      </button>
    </div>

    <!-- Search -->
    <PatientSearch @search="handleSearch" />

    <!-- Patients List -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bệnh nhân
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ngày sinh
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phụ huynh
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Điện thoại
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lần khám cuối
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="loading">
              <td colspan="6" class="px-6 py-4 text-center text-gray-500">
                Đang tải...
              </td>
            </tr>
            <tr v-else-if="patients.length === 0">
              <td colspan="6" class="px-6 py-4 text-center text-gray-500">
                Không tìm thấy bệnh nhân nào
              </td>
            </tr>
            <tr v-for="patient in patients" :key="patient.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <div class="text-sm font-medium text-gray-900">{{ patient.name }}</div>
                  <div class="text-sm text-gray-500">{{ patient.gender === 'male' ? 'Nam' : 'Nữ' }}</div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatDate(patient.date_of_birth) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ patient.parent_name }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ patient.phone }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ patient.last_visit ? formatDate(patient.last_visit) : 'Chưa khám' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  @click="editPatient(patient)"
                  class="text-blue-600 hover:text-blue-900 mr-3"
                >
                  Sửa
                </button>
                <button
                  @click="deletePatient(patient.id)"
                  class="text-red-600 hover:text-red-900"
                >
                  Xóa
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Patient Form Modal -->
    <PatientForm
      v-if="showForm"
      :patient="selectedPatient"
      @close="closeForm"
      @save="handleSave"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePatientsStore } from '@/stores/patients'
import PatientForm from '@/components/PatientForm.vue'
import PatientSearch from '@/components/PatientSearch.vue'
import { formatDate } from '@/utils/dateUtils'

const patientsStore = usePatientsStore()
const showForm = ref(false)
const selectedPatient = ref(null)

const patients = computed(() => patientsStore.patients)
const loading = computed(() => patientsStore.loading)

const handleSearch = (query) => {
  if (query.trim()) {
    patientsStore.searchPatients(query)
  } else {
    patientsStore.fetchPatients()
  }
}

const editPatient = (patient) => {
  selectedPatient.value = patient
  showForm.value = true
}

const deletePatient = async (id) => {
  if (confirm('Bạn có chắc chắn muốn xóa bệnh nhân này?')) {
    const result = await patientsStore.deletePatient(id)
    if (!result.success) {
      alert('Lỗi: ' + result.error)
    }
  }
}

const closeForm = () => {
  showForm.value = false
  selectedPatient.value = null
}

const handleSave = () => {
  closeForm()
  patientsStore.fetchPatients()
}

onMounted(async () => {
  await patientsStore.fetchPatients()
  
  if (window.feather) {
    window.feather.replace()
  }
})
</script>
