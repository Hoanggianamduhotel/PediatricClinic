# Clinic BS Khang - Pediatric Clinic Management System

Hệ thống quản lý phòng khám nhi khoa với giao diện tiếp tân hiện đại.

## Tính năng

### Giao diện Tiếp tân
- ✅ Thêm bệnh nhân mới với form Material Design
- ✅ Tìm kiếm bệnh nhân cũ theo tên
- ✅ Hiển thị thông tin bệnh nhân chi tiết
- ✅ Giao diện Vuetify Material Design đẹp mắt

### Thông tin bệnh nhân
- Họ tên
- Ngày sinh (tự động tính tháng tuổi)
- Giới tính
- Cân nặng
- Địa chỉ
- Số điện thoại

## Công nghệ sử dụng

### Frontend
- **Vue.js 3** - Framework chính
- **Vuetify** - Material Design UI components
- **Vite** - Build tool nhanh
- **Axios** - HTTP client

### Backend
- **Node.js + Express** - REST API server
- **PostgreSQL** - Database (Supabase)
- **Drizzle ORM** - Type-safe database operations

## Cách chạy project

### Prerequisites
- Node.js 18+
- PostgreSQL database (khuyến nghị Supabase)

### Cài đặt
```bash
npm install
```

### Thiết lập Database
1. Tạo project Supabase tại https://supabase.com
2. Copy connection string từ Settings > Database
3. Tạo file `.env` với:
```
DATABASE_URL=your_supabase_connection_string
```

### Chạy development
```bash
# Chạy backend (port 3000)
npm run dev:backend

# Chạy frontend (port 5000) 
npm run dev:frontend

# Hoặc chạy cả hai cùng lúc
npm run dev
```

## API Endpoints

### Bệnh nhân
- `POST /api/benhnhan` - Thêm bệnh nhân mới
- `GET /api/benhnhan/search?q=tên` - Tìm kiếm bệnh nhân

## Cấu trúc Project

```
├── src/                    # Frontend Vue.js
│   ├── components/         # Vue components
│   └── main.js            # Entry point
├── server/                 # Backend Express
│   ├── routes/            # API routes
│   ├── db/                # Database schema
│   └── index.js           # Server entry
├── package.json
└── vite.config.js         # Vite configuration
```

## Tác giả

Clinic BS Khang - Pediatric Clinic Management System