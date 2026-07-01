namespace RoomBuildingService.Events
{
    public class RoomStatusChanged
    {
        public int RoomId { get; set; }
        public string Status { get; set; } = null!;
        public string? Reason { get; set; }
        public DateTime ChangedAt { get; set; }
    }

    public class BedStatusChanged
    {
        public int BedId { get; set; }
        public string Status { get; set; } = null!; // "Available", "Occupied", "Under Maintenance"
        public string? StudentId { get; set; }
        public string? RequestDescription { get; set; }
        public DateTime ChangedAt { get; set; }
    }

    public class RoomPriceUpdated
    {
        public int RoomTypeId { get; set; }
        public double NewPrice { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
