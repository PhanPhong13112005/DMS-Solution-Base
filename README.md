# Dormitory Management System (DMS)

Hệ thống quản lý ký túc xá sinh viên được phát triển theo kiến trúc **Microservices**. Dự án bao gồm các module chức năng độc lập nhằm tối ưu hóa việc quản lý cơ sở vật chất, sinh viên và tài chính.

## 🏢 Cấu trúc dự án (Monorepo)

Dự án được chia thành 3 dịch vụ chính:

* **`RoomBuildingService`**: Quản lý Tòa nhà, Phòng ở, Giường và Tiện ích.
* **`StudentContractService`**: Quản lý thông tin sinh viên, hợp đồng lưu trú.
* **`BillingMaintenanceService`**: Quản lý hóa đơn, phí dịch vụ và bảo trì cơ sở vật chất.

## 🛠 Công nghệ sử dụng

* **Backend**: ASP.NET Core Web API (.NET 8/9+)
* **Database**: SQL Server (Entity Framework Core)
* **Version Control**: Git & GitHub

## 👥 Phân công thành viên

| Module | Nhóm phụ trách |
| :--- | :--- |
| **Room & Building** | Nhóm 1 (Phan Lưu Phong, Trần Tiến Quang, Trần Văn Phong) |
| **Student & Contract** | Nhóm 2 (Lê Quang Thành, Nguyễn Trương Thuận, Nguyễn Thành Trung) |
| **Billing & Maintenance** | Nhóm 3 (Trần Anh Tú, Lê Hồng Phi, Ngô Văn Quân) |

## 🚀 Hướng dẫn bắt đầu

1. **Clone repository**:
   ```bash
   git clone [https://github.com/PhanPhong13112005/DMS-Solution-Base.git](https://github.com/PhanPhong13112005/DMS-Solution-Base.git)

  ```
   Cấu hình:

Mở file DMS-Solution-Base.sln bằng Visual Studio 2022.

Cấu hình chuỗi kết nối (ConnectionStrings) trong file appsettings.json của từng Service.
Chạy dự án:
Đảm bảo SQL Server đã khởi chạy.
Nhấn F5 để bắt đầu chạy các dịch vụ.

graph TD
    %% Định nghĩa các Actor
    Admin((Ban quản lý KTX))
    SinhVien((Sinh viên))

    %% Frontend Container
    subgraph Frontend [Giao diện người dùng]
        UI[Web Dashboard / Mobile App<br/>React/Vue/Flutter]
    end

    %% Backend Services Container (Monorepo)
    subgraph Backend [DMS Microservices - Backend]
        RoomSvc[Room & Building Service<br/>ASP.NET Core API - Nhóm 1]
        StudentSvc[Student & Contract Service<br/>ASP.NET Core API - Nhóm 2]
        BillingSvc[Billing & Maintenance Service<br/>ASP.NET Core API - Nhóm 3]
    end

    %% Database Container
    subgraph Database [Cơ sở dữ liệu - SQL Server]
        RoomDB[(Room/Building DB)]
        StudentDB[(Student/Contract DB)]
        BillingDB[(Billing/Maint DB)]
    end

    %% Mối quan hệ User -> UI
    Admin -->|Quản lý vận hành| UI
    SinhVien -->|Sử dụng dịch vụ| UI

    %% Mối quan hệ UI -> Backend (API Gateway có thể thêm sau)
    UI -->|HTTPS/JSON| RoomSvc
    UI -->|HTTPS/JSON| StudentSvc
    UI -->|HTTPS/JSON| BillingSvc

    %% Mối quan hệ Backend -> Database
    RoomSvc -->|Đọc/Ghi (EF Core)| RoomDB
    StudentSvc -->|Đọc/Ghi (EF Core)| StudentDB
    BillingSvc -->|Đọc/Ghi (EF Core)| BillingDB

    %% Mối quan hệ Service -> Service (Giao tiếp chéo)
    StudentSvc -.->|Gọi API lấy ID Phòng trống| RoomSvc
    BillingSvc -.->|Gọi API lấy ID Hợp đồng| StudentSvc
    BillingSvc -.->|Gọi API kiểm tra Tiện ích hỏng| RoomSvc
    
    classDef service fill:#0b5394,stroke:#fff,stroke-width:2px,color:#fff,rx:5px,ry:5px;
    classDef database fill:#38761d,stroke:#fff,stroke-width:2px,color:#fff,rx:5px,ry:5px;
    classDef ui fill:#b45f06,stroke:#fff,stroke-width:2px,color:#fff,rx:5px,ry:5px;
    class RoomSvc,StudentSvc,BillingSvc service;
    class RoomDB,StudentDB,BillingDB database;
    class UI ui;
