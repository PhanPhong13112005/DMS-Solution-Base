# DMS-Solution-Base
Hệ thống quản lý dịch vụ sinh viên (DMS) xây dựng dựa trên kiến trúc Microservices và Event-Driven Architecture.

## 🚀 Các dịch vụ chính
* **StudentContractService**: Quản lý hợp đồng và yêu cầu đổi phòng của sinh viên.
* **RoomBuildingService**: Quản lý trạng thái phòng và tòa nhà.
* **BillingMaintenanceService**: Tính toán hóa đơn và phí dịch vụ phát sinh.

## 🛠️ Công nghệ sử dụng
* **Framework**: .NET 9
* **Communication**: RabbitMQ (MassTransit)
* **Database**: SQL Server (Entity Framework Core)
* **API Documentation**: Swagger/OpenAPI

## 📦 Cách khởi chạy
1. **Yêu cầu**: Cài đặt .NET 9 SDK, RabbitMQ Server và SQL Server.
2. **Cấu hình**: Kiểm tra chuỗi kết nối (`DefaultConnection`) trong file `appsettings.json` của từng service.
3. **Chạy hệ thống**:
    * Mở terminal, điều hướng đến từng thư mục service.
    * Chạy lệnh `dotnet run` cho cả 3 service.
4. **Kiểm tra**: Truy cập `http://localhost:<port>/swagger` để thao tác với API.

## 🔄 Luồng nghiệp vụ đổi phòng
Hệ thống sử dụng cơ chế Event-Driven:
1. `StudentContractService` phát ra sự kiện `IRoomTransferApprovedEvent`.
2. `RoomBuildingService` tiêu thụ sự kiện để cập nhật trạng thái giường/phòng.
3. `BillingMaintenanceService` tiêu thụ sự kiện để tính toán chênh lệch giá phòng và tạo hóa đơn (nếu có).