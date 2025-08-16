/**
 * Date utility functions for the clinic management system
 */

/**
 * Format date to Vietnamese format (DD/MM/YYYY)
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export function formatDate(date) {
  if (!date) return ''
  
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  
  const day = d.getDate().toString().padStart(2, '0')
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const year = d.getFullYear()
  
  return `${day}/${month}/${year}`
}

/**
 * Format date to short Vietnamese format (DD/MM)
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export function formatDateShort(date) {
  if (!date) return ''
  
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  
  const day = d.getDate().toString().padStart(2, '0')
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  
  return `${day}/${month}`
}

/**
 * Format date and time to Vietnamese format (DD/MM/YYYY HH:mm)
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted datetime string
 */
export function formatDateTime(date) {
  if (!date) return ''
  
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  
  const day = d.getDate().toString().padStart(2, '0')
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const year = d.getFullYear()
  const hours = d.getHours().toString().padStart(2, '0')
  const minutes = d.getMinutes().toString().padStart(2, '0')
  
  return `${day}/${month}/${year} ${hours}:${minutes}`
}

/**
 * Format time to HH:mm format
 * @param {string|Date} date - Date or time string to format
 * @returns {string} Formatted time string
 */
export function formatTime(date) {
  if (!date) return ''
  
  let d
  if (typeof date === 'string' && date.includes(':')) {
    // If it's already a time string, return as is (after validation)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    if (timeRegex.test(date)) return date
    
    // Try to parse as date
    d = new Date(`2000-01-01 ${date}`)
  } else {
    d = new Date(date)
  }
  
  if (isNaN(d.getTime())) return ''
  
  const hours = d.getHours().toString().padStart(2, '0')
  const minutes = d.getMinutes().toString().padStart(2, '0')
  
  return `${hours}:${minutes}`
}

/**
 * Get relative time string (e.g., "2 ngày trước", "1 giờ trước")
 * @param {string|Date} date - Date to compare
 * @returns {string} Relative time string
 */
export function getRelativeTime(date) {
  if (!date) return ''
  
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  
  const now = new Date()
  const diffInSeconds = Math.floor((now - d) / 1000)
  
  if (diffInSeconds < 60) {
    return 'Vừa xong'
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} phút trước`
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} giờ trước`
  }
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 30) {
    return `${diffInDays} ngày trước`
  }
  
  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) {
    return `${diffInMonths} tháng trước`
  }
  
  const diffInYears = Math.floor(diffInMonths / 12)
  return `${diffInYears} năm trước`
}

/**
 * Calculate age from date of birth
 * @param {string|Date} dateOfBirth - Date of birth
 * @returns {number} Age in years
 */
export function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return 0
  
  const dob = new Date(dateOfBirth)
  if (isNaN(dob.getTime())) return 0
  
  const today = new Date()
  let age = today.getFullYear() - dob.getFullYear()
  const monthDiff = today.getMonth() - dob.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--
  }
  
  return Math.max(0, age)
}

/**
 * Get age with appropriate unit (months for babies, years for older children)
 * @param {string|Date} dateOfBirth - Date of birth
 * @returns {string} Age with unit (e.g., "6 tháng tuổi", "3 tuổi")
 */
export function getAgeWithUnit(dateOfBirth) {
  if (!dateOfBirth) return ''
  
  const dob = new Date(dateOfBirth)
  if (isNaN(dob.getTime())) return ''
  
  const today = new Date()
  const ageInMonths = (today.getFullYear() - dob.getFullYear()) * 12 + today.getMonth() - dob.getMonth()
  
  if (ageInMonths < 24) {
    return `${ageInMonths} tháng tuổi`
  }
  
  const ageInYears = calculateAge(dateOfBirth)
  return `${ageInYears} tuổi`
}

/**
 * Check if date is today
 * @param {string|Date} date - Date to check
 * @returns {boolean} True if date is today
 */
export function isToday(date) {
  if (!date) return false
  
  const d = new Date(date)
  if (isNaN(d.getTime())) return false
  
  const today = new Date()
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  )
}

/**
 * Check if date is tomorrow
 * @param {string|Date} date - Date to check
 * @returns {boolean} True if date is tomorrow
 */
export function isTomorrow(date) {
  if (!date) return false
  
  const d = new Date(date)
  if (isNaN(d.getTime())) return false
  
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  return (
    d.getDate() === tomorrow.getDate() &&
    d.getMonth() === tomorrow.getMonth() &&
    d.getFullYear() === tomorrow.getFullYear()
  )
}

/**
 * Get start and end of day
 * @param {string|Date} date - Date
 * @returns {object} Object with startOfDay and endOfDay
 */
export function getDayBounds(date = new Date()) {
  const d = new Date(date)
  const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const endOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999)
  
  return { startOfDay, endOfDay }
}

/**
 * Get start and end of week (Monday to Sunday)
 * @param {string|Date} date - Date
 * @returns {object} Object with startOfWeek and endOfWeek
 */
export function getWeekBounds(date = new Date()) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust for Monday start
  
  const startOfWeek = new Date(d.setDate(diff))
  startOfWeek.setHours(0, 0, 0, 0)
  
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(endOfWeek.getDate() + 6)
  endOfWeek.setHours(23, 59, 59, 999)
  
  return { startOfWeek, endOfWeek }
}

/**
 * Get start and end of month
 * @param {string|Date} date - Date
 * @returns {object} Object with startOfMonth and endOfMonth
 */
export function getMonthBounds(date = new Date()) {
  const d = new Date(date)
  const startOfMonth = new Date(d.getFullYear(), d.getMonth(), 1)
  const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999)
  
  return { startOfMonth, endOfMonth }
}

/**
 * Convert date to ISO date string (YYYY-MM-DD)
 * @param {string|Date} date - Date to convert
 * @returns {string} ISO date string
 */
export function toISODateString(date) {
  if (!date) return ''
  
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  
  return d.toISOString().split('T')[0]
}

/**
 * Parse ISO date string to Date object
 * @param {string} dateString - ISO date string (YYYY-MM-DD)
 * @returns {Date|null} Date object or null if invalid
 */
export function parseISODateString(dateString) {
  if (!dateString) return null
  
  const d = new Date(dateString + 'T00:00:00')
  return isNaN(d.getTime()) ? null : d
}

/**
 * Get Vietnamese day name
 * @param {string|Date} date - Date
 * @returns {string} Vietnamese day name
 */
export function getVietnameseDayName(date) {
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  
  const days = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy']
  return days[d.getDay()]
}

/**
 * Get Vietnamese month name
 * @param {string|Date} date - Date
 * @returns {string} Vietnamese month name
 */
export function getVietnameseMonthName(date) {
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  
  const months = [
    'Tháng một', 'Tháng hai', 'Tháng ba', 'Tháng tư', 'Tháng năm', 'Tháng sáu',
    'Tháng bảy', 'Tháng tám', 'Tháng chín', 'Tháng mười', 'Tháng mười một', 'Tháng mười hai'
  ]
  return months[d.getMonth()]
}
