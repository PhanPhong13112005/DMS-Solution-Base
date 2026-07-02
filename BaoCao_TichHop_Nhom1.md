# BÁO CÁO TỔNG QUAN KẾT QUẢ THỰC HIỆN - NHÓM 1
**Dự án: Hệ thống Quản lý Ký túc xá**
**Phụ trách: SERVICE 1 (ROOM & BUILDING SERVICE - Lõi Quản lý Cơ sở vật chất)**

---

## I. TỔNG QUAN VAI TRÒ
Nhóm 1 đóng vai trò xây dựng **Core (Lõi)** của toàn bộ hệ thống. Service 1 đóng vai trò là "Nguồn sự thật" (Source of Truth) lưu trữ toàn bộ thông tin về cấu trúc vật lý của KTX (Khu vực, Tòa nhà, Phòng, Giường). Dữ liệu và các sự kiện (Event) do Nhóm 1 cung cấp là tiền đề để Nhóm 2 (Booking) và Nhóm 3 (Billing/Payment) hoạt động.

---

## II. KẾT QUẢ THỰC HIỆN BACKEND (C# ASP.NET CORE MICROSERVICES)

### 1. Quản lý Danh mục & Cơ sở vật chất (Master Data)
- **Quản lý Tòa nhà & Phòng (`BuildingsController`, `RoomsController`):** Hoàn thiện 100% các API CRUD quản lý tòa nhà, số phòng, sức chứa.
- **Quản lý Giường (`BedsController`):** Xây dựng API khởi tạo giường, gán trạng thái (Available/Occupied/Under Maintenance) và định danh sinh viên sở hữu.
- **Quản lý Loại phòng (`RoomTypesController`):** API định nghĩa các chuẩn phòng (Phòng 4, Phòng 6, Phòng 8), cấu hình giá tiền thuê chuẩn theo tháng và map các tiện ích đi kèm (Điều hòa, Bình nóng lạnh).
- **Cấu trúc phân cấp KTX (`GET /api/Buildings/hierarchy`):** Thuật toán map toàn bộ hệ thống vật lý thành một cây đệ quy xuyên suốt (Tòa nhà -> Các Phòng -> Các Giường) giúp Frontend dễ dàng render Sơ đồ KTX.

### 2. Quản lý Tin tức & Thông báo
- **`NewsController`:** Hoàn thành các API Đăng tải, Sửa, Xóa và Lấy danh sách Thông báo, Nội quy từ Ban Quản lý KTX để hiển thị công khai cho Sinh viên.

### 3. Tích hợp Message Broker (RabbitMQ) - Event Publisher
Áp dụng kiến trúc Event-Driven Architecture, Service 1 đã được cấu hình để **Phát (Publish)** các luồng sự kiện quan trọng để đồng bộ hóa dữ liệu với các Service khác mà không cần gọi API đồng bộ (giảm độ trễ, tăng tính chịu lỗi):
- `RoomStatusChanged`: Báo hiệu trạng thái phòng (Mở/Khóa).
- `BedStatusChanged`: Báo hiệu trạng thái giường thay đổi (Bảo trì/Trống/Có người). Nhờ đó Nhóm 2 (Xếp phòng) có thể chặn sinh viên đăng ký vào giường hỏng.
- `RoomPriceUpdated`: Báo hiệu thay đổi đơn giá, gửi cho Nhóm 3 (Thanh toán) để cập nhật công nợ tháng tới.

---

## III. KẾT QUẢ THỰC HIỆN FRONTEND (VUE.JS)

Toàn bộ các API của Backend Nhóm 1 đã được ghép nối (integrate) thành công 100% vào giao diện Web App, chia làm 3 phân hệ chính:

### 1. Phân hệ Sinh viên (Student Portal)
- **Phòng của tôi:** Giao diện gọi API `GET /api/Rooms/my-room/{studentId}` hiển thị chi tiết không gian sống của sinh viên (Số phòng, Tòa, Danh sách bạn cùng phòng, Tình trạng giường).
- **Bảng thông báo:** Kết nối API Tin tức để hiển thị các quy định, thông báo mới nhất từ BQL.

### 2. Phân hệ Cán bộ (Staff Portal)
- **Tra cứu Phòng KTX (`StaffRoomSearch.vue`):** Chức năng lọc và tra cứu phòng đa chiều (Theo tòa, tầng, loại phòng, trạng thái đầy/trống).
- **Báo hỏng / Khóa phòng:** Tích hợp nút chức năng gọi API `PUT /api/Rooms/Maintenance/{id}`. Ngay khi cán bộ bấm "Báo bảo trì", Frontend báo cho Backend khóa phòng và Backend sẽ ném Event sang RabbitMQ.

### 3. Phân hệ Quản trị viên (Admin Portal - Bảng điều khiển tối cao)
- **Quản lý Loại phòng (Master Data):** Xây dựng bảng giao diện liệt kê tất cả các phân khúc phòng (VIP, Thường) cùng chi phí và tiện ích.
- **Sơ đồ KTX (Hierarchy Viewer):** Xây dựng giao diện cây thư mục trực quan. Admin có thể xem bao quát tổng số phòng trong 1 tòa, trạng thái của từng chiếc giường cụ thể.
- **Thao tác Khóa giường:** Tích hợp nút "Khóa" ở cấp độ Giường trong Sơ đồ KTX. Admin có thể khóa khẩn cấp 1 chiếc giường bị gãy/hỏng thông qua API `PUT /api/Bed/Maintenance/{id}`.

---
**ĐÁNH GIÁ CHUNG:** 
Nhóm 1 đã hoàn thành xuất sắc, đúng tiến độ và đầy đủ scope yêu cầu của thiết kế kiến trúc hệ thống ban đầu, đảm bảo tính liên kết hoàn hảo giữa Frontend và Backend, cung cấp data "chuẩn" cho toàn bộ dự án.
