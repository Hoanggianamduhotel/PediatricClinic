<template>
  <div id="app">
    <h1>Clinic BS Khang - Test</h1>
    <p>Ứng dụng đang hoạt động!</p>
    <button @click="testClick">Test Button</button>
    <p v-if="clicked">Button đã được click!</p>
    
    <div style="margin-top: 20px; padding: 10px; border: 1px solid #ccc;">
      <h3>Tính năng đã hoàn thành:</h3>
      <ul>
        <li>✓ Mobile optimization cho form nhập bệnh nhân</li>
        <li>✓ Thống kê hẹn tái khám với SQL join logic</li>
        <li>✓ Danh sách khám bệnh theo ngày với cột ngay_kham</li>
        <li>✓ Logic SQL: benhnhan ( ho_ten, ngay_sinh, so_dien_thoai )</li>
      </ul>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'MinimalApp',
  setup() {
    const clicked = ref(false)
    
    const testClick = () => {
      clicked.value = true
      console.log('Button clicked!')
    }
    
    return {
      clicked,
      testClick
    }
  }
}
</script>

<style>
#app {
  font-family: Arial, sans-serif;
  max-width: 800px;
  margin: 40px auto;
  padding: 20px;
}

button {
  background: #1976d2;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background: #1565c0;
}
</style>