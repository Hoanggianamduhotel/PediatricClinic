<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Quản lý thanh toán</h1>
        <p class="text-gray-600">Hóa đơn và thanh toán</p>
      </div>
      <button
        @click="showForm = true"
        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
      >
        <i data-feather="plus" class="w-4 h-4 mr-2"></i>
        Tạo hóa đơn
      </button>
    </div>

    <!-- Statistics -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-2 bg-green-100 rounded-lg">
            <i data-feather="dollar-sign" class="w-6 h-6 text-green-600"></i>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Doanh thu hôm nay</p>
            <p class="text-2xl font-bold text-gray-900">{{ formatCurrency(stats.todayRevenue) }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-2 bg-blue-100 rounded-lg">
            <i data-feather="file-text" class="w-6 h-6 text-blue-600"></i>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Hóa đơn hôm nay</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.todayInvoices }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-2 bg-yellow-100 rounded-lg">
            <i data-feather="clock" class="w-6 h-6 text-yellow-600"></i>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Chưa thanh toán</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.pendingPayments }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-2 bg-purple-100 rounded-lg">
            <i data-feather="trending-up" class="w-6 h-6 text-purple-600"></i>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Doanh thu tháng</p>
            <p class="text-2xl font-bold text-gray-900">{{ formatCurrency(stats.monthlyRevenue) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filter -->
    <div class="mb-6 bg-white p-4 rounded-lg shadow">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Tên bệnh nhân, số hóa đơn..."
            @input="handleSearch"
            class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
          <select
            v-model="statusFilter"
            @change="handleFilter"
            class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả</option>
            <option value="paid">Đã thanh toán</option>
            <option value="pending">Chờ thanh toán</option>
            <option value="overdue">Quá hạn</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Từ ngày</label>
          <input
            v-model="dateFrom"
            type="date"
            @change="handleFilter"
            class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Đến ngày</label>
          <input
            v-model="dateTo"
            type="date"
            @change="handleFilter"
            class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>

    <!-- Invoices List -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Số hóa đơn
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bệnh nhân
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ngày tạo
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Số tiền
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
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
            <tr v-else-if="invoices.length === 0">
              <td colspan="6" class="px-6 py-4 text-center text-gray-500">
                Không tìm thấy hóa đơn nào
              </td>
            </tr>
            <tr v-for="invoice in invoices" :key="invoice.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                #{{ invoice.invoice_number }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <div class="text-sm font-medium text-gray-900">{{ invoice.patient_name }}</div>
                  <div class="text-sm text-gray-500">{{ invoice.patient_phone }}</div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatDate(invoice.created_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatCurrency(invoice.total_amount) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="getStatusClass(invoice.status)"
                  class="px-2 py-1 text-xs font-medium rounded-full"
                >
                  {{ getStatusText(invoice.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  @click="viewInvoice(invoice)"
                  class="text-blue-600 hover:text-blue-900 mr-3"
                >
                  Xem
                </button>
                <button
                  v-if="invoice.status === 'pending'"
                  @click="markAsPaid(invoice.id)"
                  class="text-green-600 hover:text-green-900 mr-3"
                >
                  Thanh toán
                </button>
                <button
                  @click="editInvoice(invoice)"
                  class="text-gray-600 hover:text-gray-900 mr-3"
                >
                  Sửa
                </button>
                <button
                  @click="deleteInvoice(invoice.id)"
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

    <!-- Invoice Form Modal -->
    <div
      v-if="showForm"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    >
      <div class="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            {{ selectedInvoice ? 'Sửa hóa đơn' : 'Tạo hóa đơn mới' }}
          </h3>
          
          <form @submit.prevent="handleSave" class="space-y-4">
            <!-- Invoice form fields here -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Bệnh nhân</label>
                <select
                  v-model="form.patient_id"
                  required
                  class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Chọn bệnh nhân</option>
                  <option v-for="patient in patients" :key="patient.id" :value="patient.id">
                    {{ patient.name }} - {{ patient.phone }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Ngày tạo</label>
                <input
                  v-model="form.created_at"
                  type="date"
                  required
                  class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <!-- Service items -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Dịch vụ</label>
              <div v-for="(item, index) in form.items" :key="index" class="flex items-center space-x-2 mb-2">
                <input
                  v-model="item.description"
                  type="text"
                  placeholder="Mô tả dịch vụ"
                  required
                  class="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  v-model="item.quantity"
                  type="number"
                  placeholder="SL"
                  min="1"
                  required
                  class="w-16 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  v-model="item.price"
                  type="number"
                  placeholder="Đơn giá"
                  min="0"
                  required
                  class="w-24 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  @click="removeItem(index)"
                  class="text-red-600 hover:text-red-800"
                >
                  <i data-feather="x" class="w-4 h-4"></i>
                </button>
              </div>
              <button
                type="button"
                @click="addItem"
                class="text-blue-600 hover:text-blue-800 text-sm"
              >
                + Thêm dịch vụ
              </button>
            </div>

            <div class="text-right">
              <p class="text-lg font-semibold">
                Tổng cộng: {{ formatCurrency(calculateTotal()) }}
              </p>
            </div>

            <div class="flex justify-end space-x-2 pt-4">
              <button
                type="button"
                @click="closeForm"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Hủy
              </button>
              <button
                type="submit"
                :disabled="saving"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {{ saving ? 'Đang lưu...' : 'Lưu' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { apiService } from '@/services/api'
import { formatDate } from '@/utils/dateUtils'

const invoices = ref([])
const patients = ref([])
const loading = ref(false)
const saving = ref(false)
const showForm = ref(false)
const selectedInvoice = ref(null)
const searchQuery = ref('')
const statusFilter = ref('')
const dateFrom = ref('')
const dateTo = ref('')

const stats = ref({
  todayRevenue: 0,
  todayInvoices: 0,
  pendingPayments: 0,
  monthlyRevenue: 0
})

const form = ref({
  patient_id: '',
  created_at: new Date().toISOString().split('T')[0],
  items: [
    { description: '', quantity: 1, price: 0 }
  ]
})

const fetchInvoices = async (params = {}) => {
  loading.value = true
  try {
    const queryParams = new URLSearchParams(params).toString()
    const response = await apiService.get(`/billing?${queryParams}`)
    invoices.value = response.data
  } catch (error) {
    console.error('Error fetching invoices:', error)
  } finally {
    loading.value = false
  }
}

const fetchPatients = async () => {
  try {
    const response = await apiService.get('/patients')
    patients.value = response.data
  } catch (error) {
    console.error('Error fetching patients:', error)
  }
}

const fetchStats = async () => {
  try {
    const response = await apiService.get('/billing/stats')
    stats.value = response.data
  } catch (error) {
    console.error('Error fetching billing stats:', error)
  }
}

const handleSearch = () => {
  const params = {}
  if (searchQuery.value.trim()) {
    params.search = searchQuery.value.trim()
  }
  if (statusFilter.value) params.status = statusFilter.value
  if (dateFrom.value) params.dateFrom = dateFrom.value
  if (dateTo.value) params.dateTo = dateTo.value
  
  fetchInvoices(params)
}

const handleFilter = () => {
  handleSearch()
}

const viewInvoice = (invoice) => {
  // Implement view invoice functionality
  console.log('View invoice:', invoice)
}

const editInvoice = (invoice) => {
  selectedInvoice.value = invoice
  form.value = {
    patient_id: invoice.patient_id,
    created_at: invoice.created_at,
    items: invoice.items || [{ description: '', quantity: 1, price: 0 }]
  }
  showForm.value = true
}

const markAsPaid = async (id) => {
  if (confirm('Đánh dấu hóa đơn này đã thanh toán?')) {
    try {
      await apiService.patch(`/billing/${id}/pay`)
      await fetchInvoices()
      await fetchStats()
    } catch (error) {
      alert('Lỗi: ' + error.message)
    }
  }
}

const deleteInvoice = async (id) => {
  if (confirm('Bạn có chắc chắn muốn xóa hóa đơn này?')) {
    try {
      await apiService.delete(`/billing/${id}`)
      await fetchInvoices()
      await fetchStats()
    } catch (error) {
      alert('Lỗi: ' + error.message)
    }
  }
}

const addItem = () => {
  form.value.items.push({ description: '', quantity: 1, price: 0 })
}

const removeItem = (index) => {
  if (form.value.items.length > 1) {
    form.value.items.splice(index, 1)
  }
}

const calculateTotal = () => {
  return form.value.items.reduce((total, item) => {
    return total + (item.quantity * item.price)
  }, 0)
}

const handleSave = async () => {
  saving.value = true
  try {
    const invoiceData = {
      ...form.value,
      total_amount: calculateTotal()
    }
    
    if (selectedInvoice.value) {
      await apiService.put(`/billing/${selectedInvoice.value.id}`, invoiceData)
    } else {
      await apiService.post('/billing', invoiceData)
    }
    
    closeForm()
    await fetchInvoices()
    await fetchStats()
  } catch (error) {
    alert('Lỗi: ' + error.message)
  } finally {
    saving.value = false
  }
}

const closeForm = () => {
  showForm.value = false
  selectedInvoice.value = null
  form.value = {
    patient_id: '',
    created_at: new Date().toISOString().split('T')[0],
    items: [{ description: '', quantity: 1, price: 0 }]
  }
}

const getStatusClass = (status) => {
  const classes = {
    paid: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    overdue: 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getStatusText = (status) => {
  const texts = {
    paid: 'Đã thanh toán',
    pending: 'Chờ thanh toán',
    overdue: 'Quá hạn'
  }
  return texts[status] || status
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount)
}

onMounted(async () => {
  await Promise.all([
    fetchInvoices(),
    fetchPatients(),
    fetchStats()
  ])
  
  if (window.feather) {
    window.feather.replace()
  }
})
</script>
