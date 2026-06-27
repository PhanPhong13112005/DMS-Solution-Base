namespace BillingMaintenanceService.Events
{
    /// <summary>
    /// Event nhận từ StudentContractService (Nhóm 2) thông qua RabbitMQ.
    /// Contract (Cấu trúc dữ liệu) này phải giống y hệt như bên Nhóm 2 publish.
    /// </summary>
    public class ContractCreatedEvent
    {
        public string ContractId { get; set; } = string.Empty;
        public int StudentId { get; set; }
        public int RoomId { get; set; }
        public decimal RoomPrice { get; set; } // Giá phòng
        public DateTime StartDate { get; set; }
    }
}
