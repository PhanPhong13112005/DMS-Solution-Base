using System.ComponentModel.DataAnnotations;

namespace StudentContractService.Models
{
    public class Student
    {
        [Key]
        public int Id { get; set; }

        public string StudentCode { get; set; } = string.Empty; // Mã sinh viên
        public string FullName { get; set; } = string.Empty;
        public string CitizenId { get; set; } = string.Empty; // Căn cước công dân
        public string PhoneNumber { get; set; } = string.Empty;
        public string University { get; set; } = string.Empty; // Trường đại học
        public decimal DebtBalance { get; set; } = 0;
    }
}