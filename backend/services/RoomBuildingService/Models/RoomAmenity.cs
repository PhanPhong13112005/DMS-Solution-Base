using System;
using System.Collections.Generic;

namespace RoomBuildingService.Models;

public partial class RoomAmenity
{
    public int Id { get; set; }

    public int RoomId { get; set; }

    public string AmenityName { get; set; } = null!;

    public string Condition { get; set; } = null!;

    public virtual Room Room { get; set; } = null!;
}
