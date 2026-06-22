namespace BillingMaintenanceService.Domain
{
    public class MaintenanceRequest
    {
        public Guid Id { get; set; }
        public int RoomId { get; set; }                          // ID phòng từ RoomBuildingService (Nhóm 1)

        // --- Thông tin sự cố ---
        public string Title { get; set; } = string.Empty;       // Tiêu đề ngắn (VD: "Hỏng điều hòa")
        public string Description { get; set; } = string.Empty; // Mô tả chi tiết sự cố
        public string Category { get; set; } = "Khác";          // Phân loại: Điện, Nước, Thiết bị, Khác
        public string Priority { get; set; } = "Normal";        // Mức độ: Critical, Normal

        // --- Trạng thái & thời gian ---
        public string Status { get; set; } = "Pending";         // Pending, Processing, Completed
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }                 // Cập nhật khi đổi trạng thái
    }
}