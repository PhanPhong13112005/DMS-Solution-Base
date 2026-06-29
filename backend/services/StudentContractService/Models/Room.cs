namespace StudentContractService.Models
{
    public class Room
    {
        public int Id { get; set; }
        public int BuildingId { get; set; }
        public string RoomNumber { get; set; } = string.Empty;
        public int FloorNumber { get; set; }
        public string? RoomType { get; set; }
        public decimal MonthlyPrice { get; set; } // Thuộc tính quan trọng nhất để tính tiền hóa đơn!
        public string? Status { get; set; }
    }
}
