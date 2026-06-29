using System;
using System.Collections.Generic;

namespace RoomBuildingService.Models;

public partial class Bed
{
    public int Id { get; set; }

    public int RoomId { get; set; }

    public string BedName { get; set; } = null!;

    public bool IsAvailable { get; set; }

    public string? AssignedStudentId { get; set; }

    public virtual Room Room { get; set; } = null!;
}
