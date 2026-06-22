namespace StudentContractService.Contracts
{
    // Dùng 'record' thay vì 'class' là chuẩn mực mới của .NET cho việc truyền tải Message
    public record ContractCreatedEvent
    {
        public int ContractId { get; init; }
        public int StudentId { get; init; }
        public int RoomId { get; init; }
        public decimal MonthlyPrice { get; init; }
        public int DurationMonths { get; init; }
        public DateTime CreatedAt { get; init; }
    }
}