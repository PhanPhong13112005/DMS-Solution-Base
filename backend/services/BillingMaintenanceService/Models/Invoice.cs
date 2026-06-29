using System;

namespace BillingMaintenanceService
{
    public class Invoice
    {
        public int Id { get; set; } // Khóa chính (Tự tăng)
        public int ContractId { get; set; }
        public string StudentId { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Status { get; set; } = "Unpaid"; // Mặc định chưa thanh toán
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}