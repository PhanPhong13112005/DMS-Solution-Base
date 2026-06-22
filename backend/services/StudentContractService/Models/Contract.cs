using System;
using System.ComponentModel.DataAnnotations;

namespace StudentContractService.Models
{
    public class Contract
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public string? StudentId { get; set; }

        // Dữ liệu đăng ký Online ban đầu từ Sinh viên
        public int BuildingId { get; set; }
        public string? RoomType { get; set; }
        public int DurationMonths { get; set; }

        // Dữ liệu sau khi Admin duyệt đơn và xếp phòng cụ thể (Không tạo FK cứng chéo DB)
        public int? RoomId { get; set; }
        public decimal? PricePerMonth { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }

        [Required]
        public string Status { get; set; } = "Pending"; // Trạng thái: Pending -> Approved -> Expired
    }
}