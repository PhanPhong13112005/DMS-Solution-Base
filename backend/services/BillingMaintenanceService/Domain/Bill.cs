namespace BillingMaintenanceService.Domain
{
    public class Bill
    {
        public Guid Id { get; set; }
        public int RoomId { get; set; }          // Tham chiếu sang Nhóm 1 bằng ID (số nguyên) theo chuẩn README
        public string TargetMonth { get; set; } = string.Empty; // Tháng tính tiền (Ví dụ: "06/2026")
        public decimal ElectricityCost { get; set; } // Tiền điện
        public decimal WaterCost { get; set; }       // Tiền nước
        public decimal TotalAmount { get; set; }     // Tổng tiền
        public bool IsPaid { get; set; }             // Trạng thái thanh toán
    }
}