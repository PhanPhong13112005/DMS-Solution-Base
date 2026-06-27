using System;
using System.ComponentModel.DataAnnotations;

namespace RoomBuildingService.Models;

public partial class SystemSetting
{
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string SettingKey { get; set; } = null!;

    [Required]
    [MaxLength(255)]
    public string SettingValue { get; set; } = null!;

    [MaxLength(500)]
    public string? Description { get; set; }
}
