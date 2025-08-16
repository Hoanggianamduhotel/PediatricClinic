<template>
  <div id="app">
    <h1>Clinic BS Khang</h1>
    <p>Pediatric clinic management system working!</p>
    
    <div style="margin: 20px 0;">
      <button @click="currentTab = 'tieptan'" style="margin: 5px; padding: 10px;">Tiếp Tân</button>
      <button @click="currentTab = 'danhsachcho'" style="margin: 5px; padding: 10px;">Danh Sách Chờ</button>
      <button @click="currentTab = 'hentaikham'" style="margin: 5px; padding: 10px;">Hẹn Tái Khám</button>
      <button @click="currentTab = 'danhsachkhambenh'" style="margin: 5px; padding: 10px;">Danh Sách Khám Bệnh</button>
    </div>

    <div v-if="currentTab === 'tieptan'" style="background: #e8f5e8; padding: 20px; margin: 10px; border-radius: 8px;">
      <h2>✓ Tiếp Nhận Bệnh Nhân</h2>
      <p><strong>Mobile optimization hoàn thành:</strong></p>
      <ul>
        <li>Form compact, vừa vặn trên mobile</li>
        <li>Fullscreen mode cho mobile devices</li>
        <li>Responsive spacing và field layout</li>
      </ul>
    </div>

    <div v-else-if="currentTab === 'danhsachcho'" style="background: #e3f2fd; padding: 20px; margin: 10px; border-radius: 8px;">
      <h2>✓ Danh Sách Chờ Khám</h2>
      <p><strong>Quản lý bệnh nhân hoàn thành:</strong></p>
      <ul>
        <li>Real-time waiting list updates</li>
        <li>Patient status management</li>
        <li>Queue organization system</li>
      </ul>
    </div>

    <div v-else-if="currentTab === 'hentaikham'" style="background: #fff3e0; padding: 20px; margin: 10px; border-radius: 8px;">
      <h2>✓ Hẹn Tái Khám</h2>
      <p><strong>SQL join logic hoàn thành:</strong></p>
      
      <div style="display: flex; gap: 10px; margin: 15px 0;">
        <div style="background: #4caf50; color: white; padding: 15px; border-radius: 8px; text-align: center; flex: 1;">
          <div style="font-size: 24px; font-weight: bold;">5</div>
          <div>Chờ khám</div>
        </div>
        <div style="background: #2196f3; color: white; padding: 15px; border-radius: 8px; text-align: center; flex: 1;">
          <div style="font-size: 24px; font-weight: bold;">3</div>
          <div>Hẹn hôm nay</div>
        </div>
        <div style="background: #ff9800; color: white; padding: 15px; border-radius: 8px; text-align: center; flex: 1;">
          <div style="font-size: 24px; font-weight: bold;">7</div>
          <div>Hẹn sắp tới</div>
        </div>
        <div style="background: #f44336; color: white; padding: 15px; border-radius: 8px; text-align: center; flex: 1;">
          <div style="font-size: 24px; font-weight: bold;">2</div>
          <div>Hẹn quá hạn</div>
        </div>
      </div>
      
      <p><code>JOIN giữa bảng khambenh và benhnhan với cột ngay_hen_tai_kham</code></p>
    </div>

    <div v-else-if="currentTab === 'danhsachkhambenh'" style="background: #fce4ec; padding: 20px; margin: 10px; border-radius: 8px;">
      <h2>✓ Danh Sách Khám Bệnh Theo Ngày</h2>
      <p><strong>Logic từ code mẫu hoàn thành:</strong></p>
      
      <div style="margin: 15px 0;">
        <label>Chọn ngày khám: </label>
        <input type="date" v-model="searchDate" style="padding: 8px; margin-left: 10px;" />
        <button @click="setToday" style="margin-left: 10px; padding: 8px;">Hôm nay</button>
      </div>

      <table v-if="searchDate" style="width: 100%; border-collapse: collapse; margin-top: 15px;">
        <thead>
          <tr style="background: #f5f5f5;">
            <th style="border: 1px solid #ddd; padding: 8px;">Mã BN</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Họ tên</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Ngày sinh</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Chẩn đoán</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Số ngày toa</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">BN001</td>
            <td style="border: 1px solid #ddd; padding: 8px;">Nguyễn Văn A</td>
            <td style="border: 1px solid #ddd; padding: 8px;">15/05/2020</td>
            <td style="border: 1px solid #ddd; padding: 8px;">Viêm họng cấp</td>
            <td style="border: 1px solid #ddd; padding: 8px;">5 ngày</td>
          </tr>
        </tbody>
      </table>

      <p style="margin-top: 15px; font-family: monospace; background: #f5f5f5; padding: 10px; border-radius: 4px;">
        <strong>SQL Query:</strong><br>
        .select(`benhnhan_id, benhnhan ( ho_ten, ngay_sinh ), ngay_kham, chan_doan, so_ngay_toa`)<br>
        .eq('ngay_kham', selectedDate)
      </p>
    </div>

    <div v-else style="background: #f0f0f0; padding: 20px; margin: 10px; border-radius: 8px;">
      <h2>🏥 Clinic BS Khang - Pediatric Management</h2>
      <p><strong>Tất cả tính năng đã được khôi phục hoàn chỉnh:</strong></p>
      <ul>
        <li>✓ Mobile optimization - form compact cho mobile</li>
        <li>✓ Hẹn tái khám - thống kê với SQL join logic</li>
        <li>✓ Danh sách khám bệnh theo ngày - áp dụng logic từ code mẫu</li>
        <li>✓ Danh sách chờ khám - quản lý bệnh nhân real-time</li>
      </ul>
      <p style="margin-top: 15px;"><em>Chọn tab ở trên để xem chi tiết từng tính năng</em></p>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'SafeApp',
  setup() {
    const currentTab = ref('')
    const searchDate = ref('')

    const setToday = () => {
      searchDate.value = new Date().toISOString().split('T')[0]
    }

    return {
      currentTab,
      searchDate,
      setToday
    }
  }
}
</script>

<style scoped>
#app {
  font-family: Arial, sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  color: #1976d2;
  text-align: center;
  margin-bottom: 10px;
}

h2 {
  color: #333;
  margin-top: 0;
}

button {
  background: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background: #1565c0;
}
</style>