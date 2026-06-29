using System;

namespace StudentContractService.Models
{
    public class Contract
    {
        public Guid Id { get; set; }
        public Guid StudentId { get; set; }
        public int RoomId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal RoomPrice { get; set; }
        public string Status { get; set; } = "Active";

        // Quan hệ liên kết đến bảng Student
        public Student? Student { get; set; }
    }
}