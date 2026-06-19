# DNU KTX Frontend - API Integration Setup

## 📋 Cấu trúc mới

### 1. **api.service.ts** - HTTP Client Service
- Quản lý tất cả API calls qua axios
- Endpoints cho: Rooms, Invoices, Maintenance, Applications, News, Transfers, Auth
- Error handling tự động
- Base URL có thể config qua environment variables

### 2. **App.vue** - Global Data Provider
- Load dữ liệu từ API trong `onMounted`
- Fallback sang mock data nếu API fails
- Provide `appData` (data + loading state) + `appActions` (functions)
- Tất cả Portal components (Admin, Student, Staff) tự động nhận dữ liệu

### 3. **Environment Config**
- `.env.development` - Config cho development
- `.env.production` - Config cho production

---

## 🚀 Setup Instructions

### Step 1: Cấu hình Backend API URL
```bash
# File: frontend/.env.development
VITE_API_URL=http://localhost:5000/api
```

Nếu backend chạy trên port khác:
```
VITE_API_URL=http://192.168.x.x:5000/api
```

### Step 2: Đảm bảo Backend có các endpoints tương ứng

Backend của bạn cần có các endpoints sau:

#### **Rooms API**
```
GET    /api/rooms                 # Lấy tất cả phòng
GET    /api/rooms/:id             # Lấy chi tiết phòng
PUT    /api/rooms/:id             # Cập nhật phòng
```

#### **Invoices API**
```
GET    /api/invoices              # Lấy tất cả hóa đơn
POST   /api/invoices              # Tạo hóa đơn mới
PUT    /api/invoices/:id          # Cập nhật hóa đơn
```

#### **Maintenance Requests API**
```
GET    /api/maintenance-requests              # Lấy tất cả phiếu bảo trì
POST   /api/maintenance-requests              # Tạo phiếu mới
PATCH  /api/maintenance-requests/:id/status   # Cập nhật trạng thái
```

#### **Booking Applications API**
```
GET    /api/applications          # Lấy tất cả đơn đăng ký
POST   /api/applications          # Tạo đơn mới
PATCH  /api/applications/:id/approve    # Phê duyệt
PATCH  /api/applications/:id/reject     # Từ chối
```

#### **News API**
```
GET    /api/news                  # Lấy tất cả tin tức
POST   /api/news                  # Tạo bài viết
DELETE /api/news/:id              # Xóa bài viết
```

#### **Transfers API**
```
GET    /api/transfers             # Lấy tất cả yêu cầu chuyển phòng
POST   /api/transfers             # Tạo yêu cầu mới
```

---

## 📝 Request/Response Format Examples

### Get All Rooms
**Request:**
```http
GET http://localhost:5000/api/rooms
```

**Response (200):**
```json
[
  {
    "id": "1",
    "roomNumber": "101",
    "building": "Tòa B",
    "capacity": 4,
    "available": 2,
    "size": 25,
    "price": 850000,
    "gender": "Nam",
    "amenities": ["WC riêng", "Máy lạnh"],
    "occupants": ["1771020535"]
  }
]
```

### Create Invoice
**Request:**
```http
POST http://localhost:5000/api/invoices
Content-Type: application/json

{
  "roomNumber": "101-Tòa B",
  "studentId": "1771020535",
  "month": "Tháng 6/2026",
  "amount": 850000,
  "type": "Tiền phòng",
  "status": "Unpaid"
}
```

**Response (201):**
```json
{
  "id": "inv-2",
  "roomNumber": "101-Tòa B",
  "studentId": "1771020535",
  "month": "Tháng 6/2026",
  "amount": 850000,
  "type": "Tiền phòng",
  "status": "Unpaid",
  "createdAt": "2026-06-19"
}
```

---

## 🔄 Data Flow

```
App.vue
├── onMounted()
│   └── loadData() // Gọi API lấy dữ liệu
│       ├── roomsApi.getAll()
│       ├── invoicesApi.getAll()
│       ├── maintenanceApi.getAll()
│       └── ... (parallel requests)
│
├── provide('appData') {
│   ├── user
│   ├── rooms           ← Updated from API
│   ├── invoices        ← Updated from API
│   ├── isLoading       ← Can use this for loading spinner
│   └── apiError        ← Can use this for error display
│ }
│
└── provide('appActions') {
    ├── addMaintenance()  → Gọi API, update state
    ├── payInvoice()      → Gọi API, update state
    └── ... (all actions call API + fallback to local)
  }

AdminPortal.vue / StudentPortal.vue / StaffPortal.vue
└── inject('appData') + inject('appActions')
    └── Dữ liệu tự động update khi API response
```

---

## 🛡️ Error Handling

Tất cả API calls có fallback:
- Nếu API call fails, dữ liệu fallback sang mock data
- Console log error để debugging
- User vẫn có thể sử dụng app (graceful degradation)

Ví dụ:
```typescript
try {
  const rooms = await roomsApi.getAll();
  mockRooms.value = rooms;  // Update from API
} catch (error) {
  console.error('Error:', error);
  // Tiếp tục sử dụng mock data cũ
}
```

---

## 📊 Loading State Usage

Bây giờ các Portal có thể sử dụng loading state:

```vue
<script setup>
const appData = inject('appData');
</script>

<template>
  <!-- Show loading spinner khi dữ liệu đang được nạp -->
  <div v-if="appData?.isLoading?.value" class="loading">
    ⏳ Đang tải dữ liệu...
  </div>

  <!-- Show error nếu có -->
  <div v-if="appData?.apiError?.value" class="error">
    ❌ {{ appData.apiError.value }}
  </div>

  <!-- Show data khi loaded -->
  <div v-if="!appData?.isLoading?.value">
    <!-- Your content here -->
  </div>
</template>
```

---

## ✅ Checklist

- [x] ✅ api.service.ts created
- [x] ✅ App.vue updated with API calls
- [x] ✅ Loading state added to provide
- [x] ✅ Environment config files created
- [ ] ⚠️ Backend endpoints cần được implement
- [ ] ⚠️ Update Portal components để sử dụng loading state (optional)

---

## 🔗 Next Steps

1. **Implement Backend Endpoints** - Tạo các endpoints trong backend (.NET services)
2. **Test API Calls** - Sử dụng Postman hoặc curl để test
3. **Update UI** - Thêm loading spinners vào Portal components
4. **Handle Errors** - Show user-friendly error messages
5. **Production Deploy** - Update `.env.production` với production API URL
