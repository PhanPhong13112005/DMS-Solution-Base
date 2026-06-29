using System;

namespace StudentContractService.Models
{
    public class Student
    {
        public Guid Id { get; set; }
        public string StudentCode { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string IdCard { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public int? CurrentRoomId { get; set; }
    }
}