using System;
using System.ComponentModel.DataAnnotations;

namespace BillingMaintenanceService.Domain
{
    public class UtilityRecord
    {
        [Key]
        public Guid Id { get; set; }
        
        public int RoomId { get; set; }
        
        // Tháng chốt (VD: "06/2026")
        public string TargetMonth { get; set; } = string.Empty;
        
        public int ElectricityIndex { get; set; }
        
        public int WaterIndex { get; set; }
        
        // Cờ xác định xem bản ghi này đã được AutoWorker quét và tạo hóa đơn hay chưa
        public bool IsProcessed { get; set; }
        
        public DateTime CreatedAt { get; set; }
    }
}
