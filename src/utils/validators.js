/**
 * Validation utility functions for form inputs
 */

/**
 * Validate Vietnamese phone number
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid
 */
export function validatePhone(phone) {
  if (!phone) return false
  
  // Remove all non-digit characters
  const cleanPhone = phone.replace(/\D/g, '')
  
  // Vietnamese phone number patterns:
  // - Mobile: 03x, 05x, 07x, 08x, 09x (10 digits total)
  // - Landline: 024, 028, etc. (10-11 digits total)
  const mobilePattern = /^(03|05|07|08|09)\d{8}$/
  const landlinePattern = /^(02[0-9])\d{7,8}$/
  
  return mobilePattern.test(cleanPhone) || landlinePattern.test(cleanPhone)
}

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
export function validateEmail(email) {
  if (!email) return false
  
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailPattern.test(email)
}

/**
 * Validate required field
 * @param {any} value - Value to validate
 * @returns {boolean} True if not empty
 */
export function validateRequired(value) {
  if (typeof value === 'string') {
    return value.trim().length > 0
  }
  return value !== null && value !== undefined && value !== ''
}

/**
 * Validate name (Vietnamese name with accents)
 * @param {string} name - Name to validate
 * @returns {boolean} True if valid
 */
export function validateName(name) {
  if (!name) return false
  
  // Allow Vietnamese characters, spaces, and common punctuation
  const namePattern = /^[a-zA-ZàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ\s'-]+$/
  return namePattern.test(name.trim()) && name.trim().length >= 2
}

/**
 * Validate date of birth (must be in the past and not too old)
 * @param {string|Date} dateOfBirth - Date to validate
 * @returns {object} Validation result with isValid and message
 */
export function validateDateOfBirth(dateOfBirth) {
  if (!dateOfBirth) {
    return { isValid: false, message: 'Ngày sinh là bắt buộc' }
  }
  
  const dob = new Date(dateOfBirth)
  const today = new Date()
  
  if (isNaN(dob.getTime())) {
    return { isValid: false, message: 'Ngày sinh không hợp lệ' }
  }
  
  if (dob >= today) {
    return { isValid: false, message: 'Ngày sinh phải là ngày trong quá khứ' }
  }
  
  // Check if age is reasonable (not more than 120 years)
  const age = today.getFullYear() - dob.getFullYear()
  if (age > 120) {
    return { isValid: false, message: 'Ngày sinh quá xa trong quá khứ' }
  }
  
  return { isValid: true, message: '' }
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} Validation result with isValid, strength, and message
 */
export function validatePassword(password) {
  if (!password) {
    return { isValid: false, strength: 'weak', message: 'Mật khẩu là bắt buộc' }
  }
  
  if (password.length < 6) {
    return { isValid: false, strength: 'weak', message: 'Mật khẩu phải có ít nhất 6 ký tự' }
  }
  
  let strength = 'weak'
  let score = 0
  
  // Check length
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  
  // Check for uppercase
  if (/[A-Z]/.test(password)) score++
  
  // Check for lowercase
  if (/[a-z]/.test(password)) score++
  
  // Check for numbers
  if (/\d/.test(password)) score++
  
  // Check for special characters
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++
  
  if (score >= 4) strength = 'strong'
  else if (score >= 2) strength = 'medium'
  
  return { 
    isValid: true, 
    strength, 
    message: strength === 'weak' ? 'Mật khẩu yếu' : strength === 'medium' ? 'Mật khẩu trung bình' : 'Mật khẩu mạnh'
  }
}

/**
 * Validate appointment time (must be in business hours and future)
 * @param {string} date - Date string (YYYY-MM-DD)
 * @param {string} time - Time string (HH:MM)
 * @returns {object} Validation result
 */
export function validateAppointmentTime(date, time) {
  if (!date || !time) {
    return { isValid: false, message: 'Ngày và giờ hẹn là bắt buộc' }
  }
  
  const appointmentDateTime = new Date(`${date}T${time}:00`)
  const now = new Date()
  
  if (isNaN(appointmentDateTime.getTime())) {
    return { isValid: false, message: 'Ngày giờ hẹn không hợp lệ' }
  }
  
  // Must be in the future (at least 30 minutes from now)
  const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000)
  if (appointmentDateTime <= thirtyMinutesFromNow) {
    return { isValid: false, message: 'Lịch hẹn phải cách ít nhất 30 phút từ bây giờ' }
  }
  
  // Must be within business hours (8:00 - 17:00)
  const hours = appointmentDateTime.getHours()
  if (hours < 8 || hours >= 17) {
    return { isValid: false, message: 'Lịch hẹn phải trong giờ làm việc (8:00 - 17:00)' }
  }
  
  // Must be on weekdays (Monday to Saturday)
  const dayOfWeek = appointmentDateTime.getDay()
  if (dayOfWeek === 0) { // Sunday
    return { isValid: false, message: 'Không thể đặt lịch hẹn vào Chủ nhật' }
  }
  
  return { isValid: true, message: '' }
}

/**
 * Validate vital signs (weight, height, temperature, etc.)
 * @param {object} vitals - Object containing vital signs
 * @returns {object} Validation result
 */
export function validateVitalSigns(vitals) {
  const errors = {}
  
  if (vitals.weight) {
    const weight = parseFloat(vitals.weight)
    if (isNaN(weight) || weight <= 0 || weight > 200) {
      errors.weight = 'Cân nặng không hợp lệ (0-200kg)'
    }
  }
  
  if (vitals.height) {
    const height = parseFloat(vitals.height)
    if (isNaN(height) || height <= 0 || height > 250) {
      errors.height = 'Chiều cao không hợp lệ (0-250cm)'
    }
  }
  
  if (vitals.temperature) {
    const temp = parseFloat(vitals.temperature)
    if (isNaN(temp) || temp < 30 || temp > 45) {
      errors.temperature = 'Nhiệt độ không hợp lệ (30-45°C)'
    }
  }
  
  if (vitals.blood_pressure) {
    const bpPattern = /^\d{2,3}\/\d{2,3}$/
    if (!bpPattern.test(vitals.blood_pressure)) {
      errors.blood_pressure = 'Huyết áp không đúng định dạng (VD: 120/80)'
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Validate medication dosage
 * @param {string} dosage - Dosage string
 * @returns {boolean} True if valid
 */
export function validateDosage(dosage) {
  if (!dosage) return false
  
  // Allow various dosage formats: "1 viên", "5ml", "2 lần/ngày", etc.
  const dosagePattern = /^[\d\w\s\/\-.,()]+$/
  return dosagePattern.test(dosage.trim()) && dosage.trim().length >= 1
}

/**
 * Validate invoice amount
 * @param {number|string} amount - Amount to validate
 * @returns {object} Validation result
 */
export function validateAmount(amount) {
  if (!amount && amount !== 0) {
    return { isValid: false, message: 'Số tiền là bắt buộc' }
  }
  
  const numAmount = parseFloat(amount)
  
  if (isNaN(numAmount)) {
    return { isValid: false, message: 'Số tiền không hợp lệ' }
  }
  
  if (numAmount < 0) {
    return { isValid: false, message: 'Số tiền không được âm' }
  }
  
  if (numAmount > 100000000) { // 100 million VND
    return { isValid: false, message: 'Số tiền quá lớn' }
  }
  
  return { isValid: true, message: '' }
}

/**
 * Validate text length
 * @param {string} text - Text to validate
 * @param {number} minLength - Minimum length
 * @param {number} maxLength - Maximum length
 * @returns {object} Validation result
 */
export function validateTextLength(text, minLength = 0, maxLength = 1000) {
  if (!text) text = ''
  
  if (text.length < minLength) {
    return { isValid: false, message: `Cần ít nhất ${minLength} ký tự` }
  }
  
  if (text.length > maxLength) {
    return { isValid: false, message: `Không được vượt quá ${maxLength} ký tự` }
  }
  
  return { isValid: true, message: '' }
}

/**
 * Sanitize and validate HTML input to prevent XSS
 * @param {string} input - HTML input to sanitize
 * @returns {string} Sanitized input
 */
export function sanitizeHtml(input) {
  if (!input) return ''
  
  // Remove script tags and their content
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  
  // Remove on* event attributes
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
  
  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '')
  
  return sanitized.trim()
}

/**
 * Create a comprehensive form validator
 * @param {object} rules - Validation rules object
 * @returns {function} Validator function
 */
export function createValidator(rules) {
  return function validate(data) {
    const errors = {}
    let isValid = true
    
    for (const [field, fieldRules] of Object.entries(rules)) {
      const value = data[field]
      
      for (const rule of fieldRules) {
        const result = rule.validator(value, data)
        
        if (!result.isValid) {
          errors[field] = rule.message || result.message
          isValid = false
          break // Stop at first error for this field
        }
      }
    }
    
    return { isValid, errors }
  }
}

// Common validation rule factories
export const required = (message = 'Trường này là bắt buộc') => ({
  validator: (value) => ({ isValid: validateRequired(value) }),
  message
})

export const email = (message = 'Email không hợp lệ') => ({
  validator: (value) => ({ isValid: !value || validateEmail(value) }),
  message
})

export const phone = (message = 'Số điện thoại không hợp lệ') => ({
  validator: (value) => ({ isValid: !value || validatePhone(value) }),
  message
})

export const minLength = (min, message) => ({
  validator: (value) => ({
    isValid: !value || value.length >= min
  }),
  message: message || `Cần ít nhất ${min} ký tự`
})

export const maxLength = (max, message) => ({
  validator: (value) => ({
    isValid: !value || value.length <= max
  }),
  message: message || `Không được vượt quá ${max} ký tự`
})
