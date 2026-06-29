using System;
using System.Collections.Generic;

namespace RoomBuildingService.Models;

public partial class Building
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public int TotalFloors { get; set; }

    public string GenderRestriction { get; set; } = null!;

    public virtual ICollection<Room> Rooms { get; set; } = new List<Room>();
}
