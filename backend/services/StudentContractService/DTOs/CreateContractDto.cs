namespace StudentContractService.DTOs
{
    public class CreateContractDto
    {
        public int StudentId { get; set; }
        public int RoomId { get; set; } // Khóa ngoại "mềm" trỏ sang DB Nhóm 1
        public int DurationMonths { get; set; } // Số tháng muốn thuê
        public decimal MonthlyPrice { get; set; }
    }
}