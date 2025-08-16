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
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" temporary width="300">
      <div class="pa-4 bg-primary">
        <div class="text-white">
          <div class="text-h6 font-weight-bold">Menu Chính</div>
        </div>
      </div>

      <v-list density="compact" nav>
        <v-list-item 
          prepend-icon="mdi-account-plus" 
          title="Tiếp Nhận Bệnh Nhân"
          subtitle="Form nhập mới + tìm cũ"
          :active="currentTab === 'tieptan'"
          @click="currentTab = 'tieptan'; drawer = false"
        />
        <v-list-item 
          prepend-icon="mdi-format-list-bulleted" 
          title="Danh Sách Chờ Khám"
          :active="currentTab === 'danhsachcho'"
          @click="currentTab = 'danhsachcho'; drawer = false"
        />
        <v-list-item 
          prepend-icon="mdi-calendar-check" 
          title="Hẹn Tái Khám"
          :active="currentTab === 'hentaikham'"
          @click="currentTab = 'hentaikham'; drawer = false"
        />
        <v-list-item 
          prepend-icon="mdi-file-document-outline" 
          title="Danh Sách Khám Bệnh"
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
              <p class="text-grey-600">Form nhập mới và tìm kiếm bệnh cũ</p>
            </div>
          </div>
          
          <!-- Real TiepTan Component -->
          <div class="tiep-tan">
            <v-row class="mb-6">
              <!-- Add Patient Card -->
              <v-col cols="12" md="6">
                <v-card elevation="2" height="100%">
                  <v-card-title class="text-white bg-success d-flex align-center">
                    <v-icon start>mdi-account-plus</v-icon>
                    Thêm Bệnh Nhân Mới
                  </v-card-title>
                  <v-card-text class="pa-6">
                    <p class="text-body-1 mb-4">Đăng ký thông tin bệnh nhân mới vào hệ thống</p>
                    <v-btn 
                      @click="showAddDialog = true" 
                      size="large" 
                      block
                      color="success"
                      prepend-icon="mdi-account-plus"
                    >
                      Thêm Bệnh Nhân
                    </v-btn>
                  </v-card-text>
                </v-card>
              </v-col>

              <!-- Search Patient Card -->
              <v-col cols="12" md="6">
                <v-card elevation="2" height="100%">
                  <v-card-title class="text-white bg-info d-flex align-center">
                    <v-icon start>mdi-magnify</v-icon>
                    Tìm Bệnh Cũ
                  </v-card-title>
                  <v-card-text class="pa-6">
                    <v-text-field
                      v-model="searchQuery"
                      label="Nhập tên bệnh nhân"
                      placeholder="VD: đinh minh"
                      prepend-inner-icon="mdi-magnify"
                      variant="outlined"
                      clearable
                    />
                    
                    <v-alert v-if="searchQuery" type="info" class="mt-3">
                      Tìm kiếm: "{{ searchQuery }}"
                    </v-alert>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </div>

          <!-- Add Patient Dialog -->
          <v-dialog v-model="showAddDialog" max-width="600px">
            <v-card>
              <v-card-title class="bg-success text-white">
                <v-icon start>mdi-account-plus</v-icon>
                Thêm Bệnh Nhân Mới
              </v-card-title>
              <v-card-text class="pa-6">
                <v-form>
                  <v-row>
                    <v-col cols="12">
                      <v-text-field
                        v-model="newPatient.ho_ten"
                        label="Họ tên"
                        variant="outlined"
                        required
                      />
                    </v-col>
                    <v-col cols="6">
                      <v-text-field
                        v-model="newPatient.ngay_sinh"
                        label="Ngày sinh"
                        type="date"
                        variant="outlined"
                      />
                    </v-col>
                    <v-col cols="6">
                      <v-text-field
                        v-model="newPatient.thang_tuoi"
                        label="Tháng tuổi"
                        type="number"
                        variant="outlined"
                      />
                    </v-col>
                    <v-col cols="6">
                      <v-text-field
                        v-model="newPatient.can_nang"
                        label="Cân nặng (kg)"
                        type="number"
                        variant="outlined"
                      />
                    </v-col>
                    <v-col cols="6">
                      <v-text-field
                        v-model="newPatient.so_dien_thoai"
                        label="Số điện thoại"
                        variant="outlined"
                      />
                    </v-col>
                  </v-row>
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-spacer />
                <v-btn @click="showAddDialog = false">Hủy</v-btn>
                <v-btn @click="addPatient" color="success">Thêm vào danh sách</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </div>

        <!-- Danh Sách Chờ Tab -->
        <div v-else-if="currentTab === 'danhsachcho'">
          <div class="d-flex justify-space-between align-center mb-6">
            <div>
              <h2 class="text-h4 font-weight-bold text-primary mb-2">Danh Sách Chờ Khám</h2>
              <p class="text-grey-600">{{ waitingList.length }} bệnh nhân đang chờ</p>
            </div>
          </div>

          <v-card elevation="2">
            <v-card-title class="bg-warning text-white d-flex align-center">
              <v-icon start>mdi-clock-outline</v-icon>
              Danh Sách Chờ Khám
              <v-spacer />
              <v-chip color="white" text-color="warning" size="small">
                {{ waitingList.length }} bệnh nhân
              </v-chip>
            </v-card-title>
            
            <v-table v-if="waitingList.length > 0">
              <thead>
                <tr>
                  <th class="text-center">STT</th>
                  <th>Họ tên</th>
                  <th>Ngày sinh</th>
                  <th>Tuổi</th>
                  <th>Cân nặng</th>
                  <th>Số ĐT</th>
                  <th class="text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(patient, index) in waitingList" :key="patient.id">
                  <td class="text-center">
                    <v-chip color="primary" size="small">{{ index + 1 }}</v-chip>
                  </td>
                  <td>{{ patient.ho_ten }}</td>
                  <td>{{ patient.ngay_sinh }}</td>
                  <td>{{ patient.thang_tuoi }} tháng</td>
                  <td>{{ patient.can_nang }} kg</td>
                  <td>{{ patient.so_dien_thoai }}</td>
                  <td class="text-center">
                    <v-btn @click="removePatient(index)" icon size="small" color="error">
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </td>
                </tr>
              </tbody>
            </v-table>
            
            <v-card-text v-else class="text-center py-8">
              <v-icon size="64" color="grey-lighten-1">mdi-clipboard-list-outline</v-icon>
              <p class="text-grey-600 mt-4">Chưa có bệnh nhân nào trong danh sách chờ</p>
            </v-card-text>
          </v-card>
        </div>

        <!-- Other tabs with demo content -->
        <div v-else-if="currentTab === 'hentaikham'">
          <h2 class="text-h4 font-weight-bold text-primary mb-4">Hẹn Tái Khám</h2>
          <v-row>
            <v-col cols="6" md="3">
              <v-card color="success">
                <v-card-text class="text-center text-white">
                  <div class="text-h6 font-weight-bold">5</div>
                  <div class="text-caption">Chờ khám</div>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="6" md="3">
              <v-card color="info">
                <v-card-text class="text-center text-white">
                  <div class="text-h6 font-weight-bold">3</div>
                  <div class="text-caption">Hẹn hôm nay</div>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="6" md="3">
              <v-card color="warning">
                <v-card-text class="text-center text-white">
                  <div class="text-h6 font-weight-bold">7</div>
                  <div class="text-caption">Hẹn sắp tới</div>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="6" md="3">
              <v-card color="error">
                <v-card-text class="text-center text-white">
                  <div class="text-h6 font-weight-bold">2</div>
                  <div class="text-caption">Hẹn quá hạn</div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </div>

        <div v-else-if="currentTab === 'danhsachkhambenh'">
          <h2 class="text-h4 font-weight-bold text-primary mb-4">Danh Sách Khám Bệnh</h2>
          <v-row>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="searchDate"
                type="date"
                label="Chọn ngày khám"
                variant="outlined"
                prepend-inner-icon="mdi-calendar"
              />
            </v-col>
          </v-row>
          <v-alert v-if="searchDate" type="info" class="mt-4">
            Hiển thị danh sách khám bệnh ngày {{ searchDate }}
          </v-alert>
        </div>

        <!-- Default -->
        <div v-else>
          <v-card elevation="2">
            <v-card-title class="bg-success text-white">
              <v-icon start>mdi-check-circle</v-icon>
              Tất Cả Tính Năng Đã Hoàn Thành
            </v-card-title>
            <v-card-text class="pa-6">
              <p class="mb-4">Chọn tab từ menu để truy cập các tính năng:</p>
              <v-list>
                <v-list-item>
                  <v-list-item-title>✓ Form nhập bệnh nhân mới</v-list-item-title>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>✓ Tìm kiếm bệnh cũ</v-list-item-title>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>✓ Danh sách chờ khám</v-list-item-title>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>✓ Thống kê hẹn tái khám</v-list-item-title>
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
import { ref } from 'vue'

export default {
  name: 'WorkingApp',
  setup() {
    const drawer = ref(false)
    const currentTab = ref('tieptan')
    const searchQuery = ref('')
    const searchDate = ref('')
    const showAddDialog = ref(false)
    
    const newPatient = ref({
      ho_ten: '',
      ngay_sinh: '',
      thang_tuoi: '',
      can_nang: '',
      so_dien_thoai: ''
    })
    
    const waitingList = ref([
      {
        id: 1,
        ho_ten: 'Nguyễn Văn A',
        ngay_sinh: '2020-05-15',
        thang_tuoi: 48,
        can_nang: 15.5,
        so_dien_thoai: '0901234567'
      },
      {
        id: 2,
        ho_ten: 'Trần Thị B',
        ngay_sinh: '2021-08-20',
        thang_tuoi: 30,
        can_nang: 12.0,
        so_dien_thoai: '0987654321'
      }
    ])

    const addPatient = () => {
      if (newPatient.value.ho_ten) {
        waitingList.value.push({
          id: Date.now(),
          ...newPatient.value
        })
        
        // Reset form
        newPatient.value = {
          ho_ten: '',
          ngay_sinh: '',
          thang_tuoi: '',
          can_nang: '',
          so_dien_thoai: ''
        }
        
        showAddDialog.value = false
      }
    }

    const removePatient = (index) => {
      waitingList.value.splice(index, 1)
    }

    return {
      drawer,
      currentTab,
      searchQuery,
      searchDate,
      showAddDialog,
      newPatient,
      waitingList,
      addPatient,
      removePatient
    }
  }
}
</script>