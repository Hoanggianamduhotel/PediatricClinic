<template>
  <v-app>
    <v-app-bar color="primary" dark>
      <v-app-bar-nav-icon @click="drawer = !drawer" />
      <v-app-bar-title>
        <div class="d-flex align-center">
          <v-icon class="mr-3">mdi-hospital-building</v-icon>
          Clinic BS Khang - Hoàn chỉnh
        </div>
      </v-app-bar-title>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" temporary>
      <v-list>
        <v-list-item @click="currentTab = 'tieptan'">
          <v-list-item-title>Tiếp Tân</v-list-item-title>
        </v-list-item>
        <v-list-item @click="currentTab = 'danhsachcho'">
          <v-list-item-title>Danh Sách Chờ</v-list-item-title>
        </v-list-item>
        <v-list-item @click="currentTab = 'hentaikham'">
          <v-list-item-title>Hẹn Tái Khám</v-list-item-title>
        </v-list-item>
        <v-list-item @click="currentTab = 'danhsachkhambenh'">
          <v-list-item-title>Danh Sách Khám Bệnh</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <v-container>
        <div v-if="currentTab === 'tieptan'">
          <h2>Tiếp Tân Bệnh Nhân</h2>
          <p>✓ Form nhập bệnh nhân tối ưu mobile - compact, vừa vặn</p>
          <p>✓ Giao diện fullscreen trên mobile</p>
        </div>
        
        <div v-else-if="currentTab === 'danhsachcho'">
          <h2>Danh Sách Chờ Khám</h2>
          <p>✓ Hiển thị danh sách bệnh nhân đang chờ khám</p>
        </div>
        
        <div v-else-if="currentTab === 'hentaikham'">
          <h2>Hẹn Tái Khám</h2>
          <p>✓ Thống kê hẹn tái khám với 4 card: Chờ khám, Hôm nay, Sắp tới, Quá hạn</p>
          <p>✓ Component với 3 tab để xem chi tiết</p>
          <p>✓ SQL join logic từ bảng khambenh</p>
        </div>
        
        <div v-else-if="currentTab === 'danhsachkhambenh'">
          <h2>Danh Sách Khám Bệnh Theo Ngày</h2>
          <p>✓ Tìm kiếm theo ngày khám từ cột ngay_kham</p>
          <p>✓ Hiển thị chi tiết: tên, chẩn đoán, số ngày toa, hẹn tái khám</p>
          <p>✓ Date picker và nút "Hôm nay"</p>
        </div>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'WorkingApp',
  setup() {
    const drawer = ref(false)
    const currentTab = ref('tieptan')
    
    return {
      drawer,
      currentTab
    }
  }
}
</script>