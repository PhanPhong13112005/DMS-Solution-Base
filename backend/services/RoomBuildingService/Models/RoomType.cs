using System.ComponentModel.DataAnnotations;

namespace RoomBuildingService.Models
{
    public class RoomType
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        [StringLength(50)]
        public string Name { get; set; } = null!; // e.g. ""Tiêu chuẩn"", ""Dịch vụ""
        
        public int MaxOccupants { get; set; }
        
        public double MonthlyPrice { get; set; }
        
        public bool HasAirConditioner { get; set; }
        
        public bool HasPrivateBathroom { get; set; }
    }
}
