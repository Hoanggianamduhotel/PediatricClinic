<template>
  <v-app>
    <v-app-bar color="primary" dark>
      <v-app-bar-nav-icon @click="drawer = !drawer" />
      <v-app-bar-title>Clinic BS Khang - Test</v-app-bar-title>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" temporary>
      <v-list>
        <v-list-item 
          title="Tiếp Tân"
          @click="currentTab = 'tieptan'; drawer = false"
        />
        <v-list-item 
          title="Danh Sách Chờ"
          @click="currentTab = 'danhsachcho'; drawer = false"
        />
        <v-list-item 
          title="Hẹn Tái Khám"
          @click="currentTab = 'hentaikham'; drawer = false"
        />
        <v-list-item 
          title="Danh Sách Khám Bệnh"
          @click="currentTab = 'danhsachkhambenh'; drawer = false"
        />
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <v-container>
        <div v-if="currentTab === 'tieptan'">
          <h2>Tiếp Nhận Bệnh Nhân</h2>
          <TiepTan />
        </div>
        
        <div v-else-if="currentTab === 'danhsachcho'">
          <h2>Danh Sách Chờ</h2>
          <DanhSachCho />
        </div>
        
        <div v-else-if="currentTab === 'hentaikham'">
          <h2>Hẹn Tái Khám</h2>
          <HenTaiKham />
        </div>
        
        <div v-else-if="currentTab === 'danhsachkhambenh'">
          <h2>Danh Sách Khám Bệnh</h2>
          <DanhSachKhamBenh />
        </div>
        
        <div v-else>
          <h2>Chọn chức năng từ menu</h2>
          <v-alert type="success">
            Tất cả tính năng đã được khôi phục:
            <ul>
              <li>Mobile optimization</li>
              <li>Hẹn tái khám thống kê</li>
              <li>Danh sách khám bệnh theo ngày</li>
            </ul>
          </v-alert>
        </div>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import { ref } from 'vue'
import TiepTan from './components/TiepTan.vue'
import DanhSachCho from './components/DanhSachCho.vue'
import HenTaiKham from './components/HenTaiKham.vue'
import DanhSachKhamBenh from './components/DanhSachKhamBenh.vue'

export default {
  name: 'TestApp',
  components: {
    TiepTan,
    DanhSachCho,
    HenTaiKham,
    DanhSachKhamBenh
  },
  setup() {
    const drawer = ref(false)
    const currentTab = ref('')

    return {
      drawer,
      currentTab
    }
  }
}
</script>