using System.ComponentModel.DataAnnotations;

namespace StudentContractService.Models
{
    public class Student
    {
        [Key]
        public string? StudentId { get; set; } // Mã SV (Ví dụ: B21DCCN123)
        [Required]
        public string? FullName { get; set; }   // Họ tên
        public string? Faculty { get; set; }    // Khoa
        public string? Contact { get; set; }    // Số điện thoại hoặc Email
    }
}