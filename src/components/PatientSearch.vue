<template>
  <div class="mb-6 bg-white rounded-lg shadow p-4">
    <div class="flex flex-col md:flex-row gap-4">
      <div class="flex-1">
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Tìm kiếm bệnh nhân theo tên, số điện thoại..."
            @input="handleSearchInput"
            @keyup.enter="handleSearch"
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i data-feather="search" class="w-5 h-5 text-gray-400"></i>
          </div>
          
          <!-- Clear button -->
          <button
            v-if="searchQuery"
            @click="clearSearch"
            class="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <i data-feather="x" class="w-5 h-5 text-gray-400 hover:text-gray-600"></i>
          </button>
        </div>
      </div>
      
      <div class="flex gap-2">
        <div class="relative">
          <select
            v-model="ageFilter"
            @change="handleFilter"
            class="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả độ tuổi</option>
            <option value="0-1">0-1 tuổi</option>
            <option value="1-5">1-5 tuổi</option>
            <option value="5-12">5-12 tuổi</option>
            <option value="12+">Trên 12 tuổi</option>
          </select>
          <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <i data-feather="chevron-down" class="w-4 h-4 text-gray-400"></i>
          </div>
        </div>
        
        <div class="relative">
          <select
            v-model="genderFilter"
            @change="handleFilter"
            class="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả giới tính</option>
            <option value="male">Nam</option>
            <option value="female">Nữ</option>
          </select>
          <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <i data-feather="chevron-down" class="w-4 h-4 text-gray-400"></i>
          </div>
        </div>
        
        <button
          @click="handleSearch"
          class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
        >
          <i data-feather="search" class="w-4 h-4 mr-2"></i>
          Tìm kiếm
        </button>
      </div>
    </div>
    
    <!-- Quick filters -->
    <div class="flex flex-wrap gap-2 mt-4">
      <span class="text-sm font-medium text-gray-700 mr-2">Lọc nhanh:</span>
      
      <button
        @click="setQuickFilter('recent')"
        :class="[
          'px-3 py-1 text-xs rounded-full border transition-colors',
          quickFilter === 'recent' 
            ? 'bg-blue-100 text-blue-800 border-blue-300' 
            : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
        ]"
      >
        Khám gần đây
      </button>
      
      <button
        @click="setQuickFilter('new')"
        :class="[
          'px-3 py-1 text-xs rounded-full border transition-colors',
          quickFilter === 'new' 
            ? 'bg-green-100 text-green-800 border-green-300' 
            : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
        ]"
      >
        Bệnh nhân mới
      </button>
      
      <button
        @click="setQuickFilter('followup')"
        :class="[
          'px-3 py-1 text-xs rounded-full border transition-colors',
          quickFilter === 'followup' 
            ? 'bg-yellow-100 text-yellow-800 border-yellow-300' 
            : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
        ]"
      >
        Cần tái khám
      </button>
      
      <button
        v-if="hasActiveFilters"
        @click="clearAllFilters"
        class="px-3 py-1 text-xs rounded-full bg-red-100 text-red-800 border border-red-300 hover:bg-red-200"
      >
        <i data-feather="x" class="w-3 h-3 mr-1 inline"></i>
        Xóa bộ lọc
      </button>
    </div>
    
    <!-- Search results summary -->
    <div v-if="showResultsSummary" class="mt-3 text-sm text-gray-600">
      {{ resultsSummaryText }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

const emit = defineEmits(['search'])

const searchQuery = ref('')
const ageFilter = ref('')
const genderFilter = ref('')
const quickFilter = ref('')
const searchTimeout = ref(null)

const showResultsSummary = ref(false)
const resultsCount = ref(0)

const hasActiveFilters = computed(() => {
  return searchQuery.value || ageFilter.value || genderFilter.value || quickFilter.value
})

const resultsSummaryText = computed(() => {
  if (!showResultsSummary.value) return ''
  
  let text = `Tìm thấy ${resultsCount.value} kết quả`
  
  const filters = []
  if (searchQuery.value) filters.push(`"${searchQuery.value}"`)
  if (ageFilter.value) filters.push(`độ tuổi ${ageFilter.value}`)
  if (genderFilter.value) filters.push(genderFilter.value === 'male' ? 'nam' : 'nữ')
  if (quickFilter.value) {
    const quickFilterTexts = {
      recent: 'khám gần đây',
      new: 'bệnh nhân mới',
      followup: 'cần tái khám'
    }
    filters.push(quickFilterTexts[quickFilter.value])
  }
  
  if (filters.length > 0) {
    text += ` cho: ${filters.join(', ')}`
  }
  
  return text
})

const handleSearchInput = () => {
  // Debounce search input
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
  
  searchTimeout.value = setTimeout(() => {
    if (searchQuery.value.length >= 2 || searchQuery.value.length === 0) {
      handleSearch()
    }
  }, 500)
}

const handleSearch = () => {
  const searchParams = {
    query: searchQuery.value,
    age: ageFilter.value,
    gender: genderFilter.value,
    quick: quickFilter.value
  }
  
  showResultsSummary.value = hasActiveFilters.value
  emit('search', searchParams)
}

const handleFilter = () => {
  handleSearch()
}

const setQuickFilter = (filter) => {
  if (quickFilter.value === filter) {
    quickFilter.value = ''
  } else {
    quickFilter.value = filter
  }
  handleSearch()
}

const clearSearch = () => {
  searchQuery.value = ''
  handleSearch()
}

const clearAllFilters = () => {
  searchQuery.value = ''
  ageFilter.value = ''
  genderFilter.value = ''
  quickFilter.value = ''
  showResultsSummary.value = false
  handleSearch()
}

// Update results count (this would typically come from the parent component)
const updateResultsCount = (count) => {
  resultsCount.value = count
}

// Expose method for parent component to update results count
defineExpose({
  updateResultsCount
})

onMounted(() => {
  if (window.feather) {
    window.feather.replace()
  }
})
</script>
