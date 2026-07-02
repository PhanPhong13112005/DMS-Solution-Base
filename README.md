# DMS Fullstack — Hệ thống Quản lý Ký túc xá Sinh viên

> **Dormitory Management System** — Dự án học phần Fullstack, áp dụng kiến trúc **Microservices** trong một Monorepo, tuân thủ tiêu chuẩn hệ thống phân tán.

---

## 🛠️ Công nghệ sử dụng

| Lớp | Công nghệ |
|---|---|
| **Frontend** | Vue 3 + TypeScript + Vite + Tailwind CSS v4 |
| **Backend** | ASP.NET Core Web API (.NET 9) |
| **Database** | SQL Server 2022 (mỗi service có DB riêng) |
| **API Gateway** | Ocelot (định tuyến & xác thực JWT) |
| **Event Bus** | RabbitMQ + MassTransit (giao tiếp bất đồng bộ) |
| **Container** | Docker + Docker Compose |

---

## 📁 Cấu trúc Monorepo (thực tế)

```text
DMS-Solution-Base/
├── frontend/                           # Vue 3 App (Port 3000 / 80 trong Docker)
│   └── src/
│       ├── views/                      # Các trang chính của ứng dụng
│       │   ├── HomeView.vue            # Trang chủ
│       │   ├── AuthView.vue            # Đăng nhập / Đăng ký
│       │   ├── BookingView.vue         # Đặt phòng / Đăng ký ở KTX
│       │   ├── StudentPortal.vue       # Cổng thông tin sinh viên
│       │   ├── StaffPortal.vue         # Cổng thông tin nhân viên
│       │   ├── AdminPortal.vue         # Cổng quản trị
│       │   ├── NewsView.vue            # Tin tức / Thông báo
│       │   ├── ContactView.vue         # Liên hệ
│       │   └── ...
│       ├── api/                        # Các module gọi API (axios)
│       ├── components/                 # Vue components dùng chung
│       ├── composables/                # Vue composables
│       ├── router/                     # Vue Router
│       └── services/                   # Logic nghiệp vụ phía client
│
├── backend/
│   └── services/
│       ├── Gateway/                    # API Gateway — Ocelot (Port 5000)
│       │   └── ocelot.json             # Cấu hình định tuyến toàn bộ Routes
│       │
│       ├── RoomBuildingService/        # Nhóm 1 — Service Phòng & Tòa nhà (Port 8083)
│       │   ├── Controllers/            # Buildings, Rooms, Beds, RoomTypes, RoomAmenities, News, SystemSettings
│       │   ├── Models/                 # Entity: Building, Room, Bed, RoomType...
│       │   ├── Data/                   # DbContext (RoomDB)
│       │   ├── Events/                 # MassTransit Consumers/Producers
│       │   └── Services/               # Business Logic
│       │
│       ├── StudentContractService/     # Nhóm 2 — Service Sinh viên & Hợp đồng (Port 8081)
│       │   ├── Controllers/            # Students, Contracts, BookingApplications, Transfers
│       │   ├── Models/                 # Entity: Student, Contract, BookingApplication, RoomTransferRequest
│       │   ├── Data/                   # DbContext (StudentContractDb_v2)
│       │   ├── Consumers/              # MassTransit Consumers
│       │   ├── DTOs/                   # Data Transfer Objects
│       │   └── Services/               # Business Logic, HttpClient gọi RoomService
│       │
│       └── BillingMaintenanceService/  # Nhóm 3 — Service Hóa đơn & Bảo trì (Port 8082)
│           ├── Controllers/            # Bills, Maintenance, Utilities, Auth
│           ├── Domain/                 # Entity models
│           ├── Application/            # Business Logic / Use Cases
│           ├── Infrastructure/         # EF Core, Repository (BillingMaintenanceDB)
│           ├── Events/                 # MassTransit Consumers (ContractApproved, InvoicePaid)
│           └── Workers/                # MonthlyBillingWorker (Background Service)
│
├── DMS.Shared/                         # Class Library dùng chung (Event Interfaces)
│   └── Events.cs                       # IRoomTransferApprovedEvent, IContractApprovedEvent, IInvoicePaidEvent
│
├── docs/                               # Tài liệu C4 Model
│   ├── SystemContext.png               # Sơ đồ mức 1 — System Context
│   ├── Containers.png                  # Sơ đồ mức 2 — Containers
│   └── C4 Model.txt                    # Mô tả C4 Model dạng text
│
├── docker-compose.yml                  # Cấu hình Docker đầy đủ (tất cả services)
├── infra/docker-compose.yml            # Chỉ hạ tầng: SQL Server + RabbitMQ
├── Run-Backend.ps1                     # Script PowerShell chạy 4 service local
└── DMS-Solution-Base.slnx              # .NET Solution file
```

---

## 👥 Phân công thành viên & Nghiệp vụ

| Module | Nhóm | Service | Database | Nghiệp vụ cốt lõi |
|:---|:---|:---|:---|:---|
| **Room & Building** | Nhóm 1 | `RoomBuildingService` | `RoomDB` | Quản lý Tòa nhà, Phòng, Giường, Loại phòng, Tiện nghi, Tin tức, Cài đặt hệ thống |
| **Student & Contract** | Nhóm 2 | `StudentContractService` | `StudentContractDb_v2` | Quản lý sinh viên, đơn đăng ký ở, hợp đồng thuê phòng, yêu cầu chuyển phòng |
| **Billing & Maintenance** | Nhóm 3 | `BillingMaintenanceService` | `BillingMaintenanceDB` | Quản lý hóa đơn điện/nước, yêu cầu bảo trì, xác thực (Auth/JWT), Background Worker tính doanh thu hàng tháng |

---

## 🏗️ Kiến trúc & Quy tắc cốt lõi

### Nguyên tắc thiết kế Microservices

1. **Độc lập Database:** Mỗi service có database riêng (`RoomDB`, `StudentContractDb_v2`, `BillingMaintenanceDB`). **Tuyệt đối không JOIN chéo database, không tạo Foreign Key cứng giữa các DB.** Tham chiếu chéo chỉ dùng ID dạng số nguyên hoặc chuỗi. Kiểu dữ liệu tham chiếu phải đồng nhất 100%.

2. **API Gateway là cổng duy nhất:** Mọi request từ Frontend (Vue) đều qua `http://localhost:5000`. Gateway dùng **Ocelot** để định tuyến đến đúng microservice và xác thực JWT Token.

3. **Giao tiếp bất đồng bộ qua RabbitMQ:** Dùng thư viện **MassTransit**. Ví dụ luồng sự kiện:
   - Nhóm 2 duyệt hợp đồng → Publish `IContractApprovedEvent`
   - Nhóm 3 consume event → Tự động tạo hóa đơn, cập nhật doanh thu
   - Nhóm 2 duyệt chuyển phòng → Publish `IRoomTransferApprovedEvent`

4. **Shared Contracts (`DMS.Shared`):** Các interface event (`IContractApprovedEvent`, `IRoomTransferApprovedEvent`, `IInvoicePaidEvent`) được định nghĩa tập trung trong project `DMS.Shared` và được tham chiếu bởi tất cả services cần giao tiếp. Đây là "ngôn ngữ chung" của hệ thống.

### Sơ đồ System Context (Mức 1)
![Sơ đồ System Context](./docs/SystemContext.png)

### Sơ đồ Containers (Mức 2)
![Sơ đồ Containers](./docs/Containers.png)

---

## 🚀 Hướng dẫn chạy dự án

### Yêu cầu

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (để chạy SQL Server & RabbitMQ)
- [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- [Node.js 18+](https://nodejs.org/) & npm

---

### Cách 1: Chạy toàn bộ bằng Docker Compose (Khuyến nghị)

Lệnh này sẽ build và khởi động **tất cả** services (hạ tầng + backend + frontend):

```bash
docker compose up -d --build
```

| Service | URL |
|---|---|
| Frontend (Vue) | http://localhost |
| API Gateway | http://localhost:5000 |
| Room Service | http://localhost:8083 |
| Student Service | http://localhost:8081 |
| Billing Service | http://localhost:8082 |
| RabbitMQ Management | http://localhost:15672 (guest/guest) |
| SQL Server | localhost:1433 (sa/PhanPhong@123) |

---

### Cách 2: Chạy Local (Môi trường phát triển)

**Bước 1:** Khởi động hạ tầng (SQL Server + RabbitMQ) bằng Docker:

```bash
docker compose -f infra/docker-compose.yml up -d
```

**Bước 2:** Chạy 4 Backend Services (dùng script PowerShell có sẵn):

```powershell
.\Run-Backend.ps1
```

Script này sẽ tự động mở 4 cửa sổ PowerShell riêng biệt cho từng service.

> Hoặc chạy thủ công từng service trong thư mục `backend/`:
> ```bash
> dotnet run --project services/RoomBuildingService/RoomBuildingService.csproj      # Port 8083
> dotnet run --project services/StudentContractService/StudentContractService.csproj  # Port 8081
> dotnet run --project services/BillingMaintenanceService/BillingMaintenanceService.csproj # Port 8082
> dotnet run --project services/Gateway/Gateway.csproj                               # Port 5000
> ```

**Bước 3:** Chạy Frontend:

```bash
cd frontend
npm install
npm run dev
# Truy cập: http://localhost:3000
```

---

## 🗺️ API Routes (qua Gateway — `localhost:5000`)

| Prefix | Service đích | Mô tả |
|---|---|---|
| `/api/Buildings` | RoomBuildingService | Quản lý tòa nhà |
| `/api/Rooms` | RoomBuildingService | Quản lý phòng |
| `/api/Beds` | RoomBuildingService | Quản lý giường |
| `/api/RoomTypes` | RoomBuildingService | Loại phòng |
| `/api/RoomAmenities` | RoomBuildingService | Tiện nghi phòng |
| `/api/News` | RoomBuildingService | Tin tức / Thông báo |
| `/api/Students` | StudentContractService | Quản lý sinh viên |
| `/api/StudentContracts` | StudentContractService | Hợp đồng thuê phòng |
| `/api/Transfers` | StudentContractService | Yêu cầu chuyển phòng |
| `/api/BookingApplications` | StudentContractService | Đơn đăng ký ở KTX |
| `/api/bills` | BillingMaintenanceService | Hóa đơn điện/nước |
| `/api/maintenance` | BillingMaintenanceService | Yêu cầu bảo trì |
| `/api/utilities` | BillingMaintenanceService | Tiện ích (điện, nước) |
| `/api/auth` | BillingMaintenanceService | Xác thực & JWT |

---

## 🔀 Quy trình làm việc với Git

Để tránh conflict, tất cả thành viên tuân thủ luồng sau:

```bash
# 1. Luôn làm việc trên nhánh tính năng riêng
git checkout -b feature/[tên-nhóm]/[tên-tính-năng]

# 2. Commit thường xuyên, message rõ ràng
git commit -m "feat(nhom2): thêm API chuyển phòng"

# 3. Push lên remote
git push origin feature/[tên-nhóm]/[tên-tính-năng]
```

4. Lên GitHub tạo **Pull Request (PR)** để review chéo. **Nghiêm cấm push trực tiếp vào nhánh `master`.**

---

## 📋 Lưu ý kỹ thuật quan trọng

> **Migration Database:** Mỗi nhóm tự chạy Migration cho DB của mình. Không chạy Migration cho DB của nhóm khác.
>
> ```bash
> # Ví dụ cho Nhóm 2 (trong thư mục backend/)
> dotnet ef database update --project services/StudentContractService/StudentContractService.csproj
> ```

> **Mock Data:** Trong giai đoạn phát triển, các nhóm cần chuẩn bị sẵn Mock Data trả về JSON chuẩn để các nhóm khác có thể test `HttpClient` qua Gateway trước khi hoàn thiện Database thực.

> **Test API:** Xem tài liệu chi tiết tại `docs/TestAPI.docx` hoặc file `frontend/API_INTEGRATION_GUIDE.md`.
