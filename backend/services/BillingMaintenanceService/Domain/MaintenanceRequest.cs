namespace BillingMaintenanceService.Domain
{
    public class MaintenanceRequest
    {
        public Guid Id { get; set; }
        public int RoomId { get; set; }          // Tham chiếu ID phòng của Nhóm 1
        public string Description { get; set; } = string.Empty; // Ví dụ: "Cháy bóng đèn", "Hỏng vòi nước"
        public string Status { get; set; } = "Pending";        // Trạng thái: Pending, Processing, Completed
        public DateTime CreatedAt { get; set; }
    }
}