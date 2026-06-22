namespace BillingMaintenanceService.Domain
{
    public class Bill
    {
        public Guid Id { get; set; }

        // --- Tham chiếu chéo service (dùng plain ID, không FK cứng) ---
        public int RoomId { get; set; }              // ID phòng từ RoomBuildingService (Nhóm 1)
        public int StudentId { get; set; }           // ID sinh viên từ StudentContractService (Nhóm 2)
        public string ContractId { get; set; } = string.Empty; // ID hợp đồng từ StudentContractService

        // --- Thông tin hóa đơn ---
        public string Title { get; set; } = string.Empty;       // Tiêu đề hóa đơn (Ví dụ: "HĐ tháng 06/2026 - Phòng 101")
        public string TargetMonth { get; set; } = string.Empty; // Tháng tính tiền (Ví dụ: "06/2026")

        // --- Các khoản phí ---
        public decimal ElectricityCost { get; set; } // Tiền điện
        public decimal WaterCost { get; set; }        // Tiền nước
        public decimal ServiceFee { get; set; }       // Phí dịch vụ (vệ sinh, rác...)
        public decimal TotalAmount { get; set; }      // Tổng tiền (tự tính bởi AppService)

        // --- Trạng thái & thời gian ---
        public bool IsPaid { get; set; }              // Trạng thái thanh toán
        public DateTime CreatedAt { get; set; }       // Ngày tạo hóa đơn
        public DateTime? PaidAt { get; set; }         // Thời điểm thanh toán (null nếu chưa TT)
    }
}