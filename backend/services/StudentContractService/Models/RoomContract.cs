using System.ComponentModel.DataAnnotations;

namespace StudentContractService.Models
{
    public class RoomContract
    {
        [Key]
        public int Id { get; set; }

        // Khóa ngoại nội bộ: 1 Hợp đồng thuộc về 1 Sinh viên (Được phép vì cùng chung StudentDB)
        public int StudentId { get; set; }
        public Student? Student { get; set; }

        // ĐIỂM CHẤM ĐIỂM: Chỉ lưu RoomId dạng số nguyên, KHÔNG NỐI KHÓA NGOẠI sang Nhóm 1
        public int RoomId { get; set; }

        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal MonthlyPrice { get; set; } // Giá thuê hàng tháng
        public string Status { get; set; } = "Active"; // Trạng thái: Active (Đang thuê), Expired (Hết hạn)
    }
}