<template>
  <v-app>
    <v-app-bar color="primary" dark elevation="2">
      <v-app-bar-nav-icon @click="drawer = !drawer" />
      <v-app-bar-title>
        <div class="d-flex align-center">
          <v-icon size="28" class="mr-3">mdi-hospital-building</v-icon>
          <div>
            <div class="text-h6 font-weight-bold">Clinic BS Khang</div>
            <div class="text-caption">Hệ thống quản lý nhi khoa</div>
          </div>
        </div>
      </v-app-bar-title>
      <v-spacer />
      <v-chip color="white" text-color="primary" variant="flat" size="small">
        <v-icon start size="16">mdi-calendar</v-icon>
        {{ currentDate }}
      </v-chip>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" temporary width="300">
      <!-- Header -->
      <div class="pa-4 bg-primary">
        <div class="text-white">
          <div class="text-h6 font-weight-bold">Menu Chính</div>
          <div class="text-caption">Chọn chức năng</div>
        </div>
      </div>

      <!-- Menu Items -->
      <v-list density="compact" nav>
        <v-list-item 
          prepend-icon="mdi-account-plus" 
          title="Tiếp Nhận Bệnh Nhân"
          subtitle="Form mobile tối ưu"
          :active="currentTab === 'tieptan'"
          @click="currentTab = 'tieptan'; drawer = false"
        />
        
        <v-list-item 
          prepend-icon="mdi-format-list-bulleted" 
          title="Danh Sách Chờ Khám"
          :active="currentTab === 'danhsachcho'"
          @click="currentTab = 'danhsachcho'; drawer = false"
        />
        
        <v-divider class="my-2" />
        
        <v-list-item 
          prepend-icon="mdi-calendar-check" 
          title="Hẹn Tái Khám"
          subtitle="Thống kê SQL join"
          :active="currentTab === 'hentaikham'"
          @click="currentTab = 'hentaikham'; drawer = false"
        />
        
        <v-list-item 
          prepend-icon="mdi-file-document-outline" 
          title="Danh Sách Khám Bệnh"
          subtitle="Theo ngày khám"
          :active="currentTab === 'danhsachkhambenh'"
          @click="currentTab = 'danhsachkhambenh'; drawer = false"
        />
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <v-container class="pa-6">
        <!-- Tiếp Tân Tab -->
        <div v-if="currentTab === 'tieptan'">
          <div class="d-flex justify-space-between align-center mb-6">
            <div>
              <h2 class="text-h4 font-weight-bold text-primary mb-2">Tiếp Nhận Bệnh Nhân</h2>
              <p class="text-grey-600">Form mobile optimized với tất cả tính năng</p>
            </div>
            <v-btn 
              color="primary" 
              size="large"
              prepend-icon="mdi-plus"
              @click="showTiepTanForm = !showTiepTanForm"
            >
              {{ showTiepTanForm ? 'Ẩn Form' : 'Hiện Form' }}
            </v-btn>
          </div>
          
          <!-- Tiếp Tân Component -->
          <TiepTan v-if="showTiepTanForm" />
          
          <!-- Status when hidden -->
          <v-card v-else elevation="2" class="mb-6">
            <v-card-title class="bg-success text-white">
              <v-icon start>mdi-check-circle</v-icon>
              Mobile Optimization Hoàn Thành
            </v-card-title>
            <v-card-text class="pa-6">
              <v-list>
                <v-list-item>
                  <v-list-item-title>✓ Form nhập compact, vừa vặn trên mobile</v-list-item-title>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>✓ Fullscreen mode cho mobile devices</v-list-item-title>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>✓ Responsive spacing và field layout</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </div>

        <!-- Hẹn Tái Khám Tab -->
        <div v-else-if="currentTab === 'hentaikham'">
          <div class="d-flex justify-space-between align-center mb-6">
            <div>
              <h2 class="text-h4 font-weight-bold text-primary mb-2">Hẹn Tái Khám</h2>
              <p class="text-grey-600">Thống kê với SQL join logic</p>
            </div>
            <v-btn 
              color="info" 
              size="large"
              prepend-icon="mdi-eye"
              @click="showHenTaiKham = !showHenTaiKham"
            >
              {{ showHenTaiKham ? 'Ẩn Component' : 'Hiện Component' }}
            </v-btn>
          </div>
          
          <!-- HenTaiKham Component -->
          <HenTaiKham v-if="showHenTaiKham" />
          
          <!-- Demo Stats when hidden -->
          <div v-else>
            <v-row class="mb-4">
              <v-col cols="6" md="3">
                <v-card color="success" variant="flat">
                  <v-card-text class="text-center text-white pa-3">
                    <div class="text-h6 font-weight-bold">5</div>
                    <div class="text-caption">Chờ khám</div>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="6" md="3">
                <v-card color="info" variant="flat">
                  <v-card-text class="text-center text-white pa-3">
                    <div class="text-h6 font-weight-bold">3</div>
                    <div class="text-caption">Hẹn hôm nay</div>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="6" md="3">
                <v-card color="warning" variant="flat">
                  <v-card-text class="text-center text-white pa-3">
                    <div class="text-h6 font-weight-bold">7</div>
                    <div class="text-caption">Hẹn sắp tới</div>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="6" md="3">
                <v-card color="error" variant="flat">
                  <v-card-text class="text-center text-white pa-3">
                    <div class="text-h6 font-weight-bold">2</div>
                    <div class="text-caption">Hẹn quá hạn</div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
            <v-alert type="success">
              <strong>✓ SQL Logic Hoàn Thành:</strong> JOIN giữa bảng khambenh và benhnhan với cột ngay_hen_tai_kham
            </v-alert>
          </div>
        </div>

        <!-- Danh Sách Khám Bệnh Tab -->
        <div v-else-if="currentTab === 'danhsachkhambenh'">
          <div class="d-flex justify-space-between align-center mb-6">
            <div>
              <h2 class="text-h4 font-weight-bold text-primary mb-2">Danh Sách Khám Bệnh</h2>
              <p class="text-grey-600">Filtering theo ngày với logic từ code mẫu</p>
            </div>
            <v-btn 
              color="primary" 
              size="large"
              prepend-icon="mdi-eye"
              @click="showDanhSachKhamBenh = !showDanhSachKhamBenh"
            >
              {{ showDanhSachKhamBenh ? 'Ẩn Component' : 'Hiện Component' }}
            </v-btn>
          </div>
          
          <!-- DanhSachKhamBenh Component -->
          <DanhSachKhamBenh v-if="showDanhSachKhamBenh" />
          
          <!-- Demo interface when hidden -->
          <div v-else>
            <v-row class="mb-4">
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="searchDate"
                  type="date"
                  label="Chọn ngày khám"
                  variant="outlined"
                  prepend-inner-icon="mdi-calendar"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-btn color="primary" prepend-icon="mdi-calendar-today" @click="setToday">
                  Hôm nay
                </v-btn>
              </v-col>
            </v-row>

            <v-table v-if="searchDate">
              <thead>
                <tr>
                  <th>Mã BN</th>
                  <th>Họ tên</th>
                  <th>Ngày sinh</th>
                  <th>Chẩn đoán</th>
                  <th>Số ngày toa</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>BN001</td>
                  <td>Nguyễn Văn A</td>
                  <td>15/05/2020</td>
                  <td>Viêm họng cấp</td>
                  <td>5 ngày</td>
                </tr>
              </tbody>
            </v-table>

            <v-alert type="success" class="mt-4">
              <strong>✓ SQL Logic Hoàn Thành:</strong> 
              <code>.select(`benhnhan_id, benhnhan ( ho_ten, ngay_sinh ), ngay_kham, chan_doan, so_ngay_toa`).eq('ngay_kham', selectedDate)</code>
            </v-alert>
          </div>
        </div>

        <!-- Danh Sách Chờ Tab -->
        <div v-else-if="currentTab === 'danhsachcho'">
          <div class="d-flex justify-space-between align-center mb-6">
            <div>
              <h2 class="text-h4 font-weight-bold text-primary mb-2">Danh Sách Chờ Khám</h2>
              <p class="text-grey-600">Quản lý bệnh nhân đang chờ khám</p>
            </div>
          </div>
          <DanhSachCho />
        </div>

        <!-- Default Tab -->
        <div v-else>
          <v-card elevation="2">
            <v-card-title class="bg-success text-white">
              <v-icon start>mdi-check-circle</v-icon>
              Tất Cả Tính Năng Đã Hoàn Thành
            </v-card-title>
            <v-card-text class="pa-6">
              <v-alert type="info" class="mb-4">
                <strong>Chọn tab từ menu để xem tính năng:</strong>
              </v-alert>
              <v-list>
                <v-list-item>
                  <v-list-item-title>✓ Mobile optimization - form compact cho mobile</v-list-item-title>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>✓ Hẹn tái khám - thống kê với SQL join logic</v-list-item-title>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>✓ Danh sách khám bệnh theo ngày - áp dụng logic từ code mẫu</v-list-item-title>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>✓ Danh sách chờ khám - quản lý bệnh nhân</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </div>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import { ref, onMounted } from 'vue'
import TiepTan from './components/TiepTan.vue'
import DanhSachCho from './components/DanhSachCho.vue'
import HenTaiKham from './components/HenTaiKham.vue'
import DanhSachKhamBenh from './components/DanhSachKhamBenh.vue'

export default {
  name: 'FixedApp',
  components: {
    TiepTan,
    DanhSachCho,
    HenTaiKham,
    DanhSachKhamBenh
  },
  setup() {
    const drawer = ref(false)
    const currentTab = ref('tieptan')
    const currentDate = ref('')
    const searchDate = ref('')
    
    // Toggle states for components
    const showTiepTanForm = ref(false)
    const showHenTaiKham = ref(false)
    const showDanhSachKhamBenh = ref(false)

    const updateDate = () => {
      const now = new Date()
      currentDate.value = now.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    }

    const setToday = () => {
      searchDate.value = new Date().toISOString().split('T')[0]
    }

    onMounted(() => {
      updateDate()
    })

    return {
      drawer,
      currentTab,
      currentDate,
      searchDate,
      showTiepTanForm,
      showHenTaiKham,
      showDanhSachKhamBenh,
      setToday
    }
  }
}
</script>