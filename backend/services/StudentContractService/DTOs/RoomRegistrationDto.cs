namespace StudentContractService.DTOs
{
    public class RoomRegistrationDto
    {
        public string? StudentId { get; set; }
        public int BuildingId { get; set; }
        public string? RoomType { get; set; }
        public int DurationMonths { get; set; }
    }
}