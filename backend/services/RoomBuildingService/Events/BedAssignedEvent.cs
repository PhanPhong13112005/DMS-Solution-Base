namespace RoomBuildingService.Events
{
    // Dùng 'record' của C# để tạo ra một object bất biến (chuẩn cho Event)
    public record BedAssignedEvent
    {
        public int BedId { get; init; }
        public string? StudentId { get; init; }
        public bool IsAvailable { get; init; }
    }
}