using System;

namespace StudentContractService.Models
{
    public class RoomTransferRequest
    {
        public Guid Id { get; set; }
        public Guid StudentId { get; set; }
        public int FromRoomId { get; set; }
        public int ToRoomId { get; set; }
        public string Reason { get; set; } = string.Empty;
        public string Status { get; set; } = "Pending";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Quan hệ liên kết đến bảng Student
        public Student? Student { get; set; }
    }
}