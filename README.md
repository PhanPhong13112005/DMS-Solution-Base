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

---

## 🏛 Kiến trúc hệ thống (C4 Model)

Dự án áp dụng mô hình C4 để minh họa kiến trúc tổng thể, giúp các nhóm dễ dàng hình dung luồng giao tiếp và phạm vi công việc.

### 1. Sơ đồ ngữ cảnh (System Context - Mức 1)
Sơ đồ này thể hiện cách Người dùng (Sinh viên, Ban quản lý) tương tác với hệ thống DMS.

![Sơ đồ System Context](./docs/SystemContext.png)

### 2. Sơ đồ Container - Microservices (Mức 2)
Sơ đồ chi tiết cho thấy ranh giới công việc của 3 nhóm, bao gồm Frontend, 3 Backend Services độc lập và các Database tương ứng.

![Sơ đồ Containers](./docs/Containers.png)

> **Lưu ý dành cho Dev:** Nếu bạn muốn chỉnh sửa sơ đồ này trong tương lai, vui lòng sử dụng mã nguồn Structurizr DSL tại file [`C4 Model.txt`](./docs/C4%20Model.txt).

---

## 🚀 Hướng dẫn bắt đầu

### 1. Clone repository
```bash
git clone https://github.com/PhanPhong13112005/DMS-Solution-Base.git
```

2. Cấu hình ban đầu
Mở file DMS-Solution-Base.sln bằng Visual Studio 2022.

Cấu hình chuỗi kết nối (ConnectionStrings) trong file appsettings.json của từng Service để trỏ về SQL Server của bạn.

3. Chạy dự án
Đảm bảo SQL Server đã khởi chạy.

Để chạy cả 3 service cùng lúc: Chuột phải vào Solution -> Chọn Properties -> Startup Project -> Chọn Multiple startup projects và đặt hành động là Start cho cả 3 project.

Nhấn F5 để bắt đầu.
```

## 🌳 Quy tắc làm việc với Git (Quan trọng!)
Để tránh xung đột code, mỗi nhóm vui lòng tuân thủ quy trình sau:
1. Làm việc trên nhánh riêng:
```bash
git checkout -b feature/[tên-service-của-bạn]
```
2. Push code lên nhánh cá nhân:
```bash
git push origin feature/[tên-service-của-bạn]
```
3. Yêu cầu Merge (Pull Request):
Sau khi hoàn thành tính năng, hãy lên GitHub tạo Pull Request để đưa code vào nhánh master. Tuyệt đối không push thẳng code vào nhánh master.
