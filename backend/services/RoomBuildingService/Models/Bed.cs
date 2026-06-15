using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation; // 1. BẮT BUỘC PHẢI CÓ THƯ VIỆN NÀY

namespace RoomBuildingService.Models;

public partial class Bed
{
    public int Id { get; set; }

    public int RoomId { get; set; }

    public string BedName { get; set; } = null!;

    public bool IsAvailable { get; set; }

    public string? AssignedStudentId { get; set; }

    [JsonIgnore]
    [ValidateNever] // 2. THÊM DÒNG NÀY ĐỂ CẤM .NET BẮT LỖI
    public virtual Room? Room { get; set; } // 3. Thêm dấu ? và xóa "= null!;"
}