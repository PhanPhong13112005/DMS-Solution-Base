namespace StudentContractService.DTOs
{
    // Class này mô phỏng lại cấu trúc dữ liệu mà Nhóm 1 sẽ trả về
    public class RoomResponseDto
    {
        public int Id { get; set; }
        public string RoomName { get; set; } = string.Empty;
        public int AvailableBeds { get; set; } // Số giường còn trống
        public decimal CurrentPrice { get; set; } // Giá phòng hiện tại
    }
}