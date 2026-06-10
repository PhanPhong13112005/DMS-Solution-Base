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
| **Student & Contract** | Nhóm 2 |
| **Billing & Maintenance** | Nhóm 3 |

## 🚀 Hướng dẫn bắt đầu

1. **Clone repository**:
   ```bash
   git clone [https://github.com/PhanPhong13112005/DMS-Solution-Base.git](https://github.com/PhanPhong13112005/DMS-Solution-Base.git)

   '''
   Cấu hình:

Mở file DMS-Solution-Base.sln bằng Visual Studio 2022.

Cấu hình chuỗi kết nối (ConnectionStrings) trong file appsettings.json của từng Service.

Chạy dự án:

Đảm bảo SQL Server đã khởi chạy.

Nhấn F5 để bắt đầu chạy các dịch vụ.
