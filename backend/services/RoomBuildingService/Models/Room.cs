using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace RoomBuildingService.Models;

public partial class Room
{
    public int Id { get; set; }

    public int BuildingId { get; set; }

    public string RoomNumber { get; set; } = null!;

    public int FloorNumber { get; set; }

    public string RoomType { get; set; } = null!;

    public decimal MonthlyPrice { get; set; }

    public string Status { get; set; } = null!;

    [JsonIgnore]
    public virtual ICollection<Bed>? Beds { get; set; } = new List<Bed>();

    [JsonIgnore]
    public virtual Building? Building { get; set; } = null!;

    [JsonIgnore]
    public virtual ICollection<RoomAmenity>? RoomAmenities { get; set; } = new List<RoomAmenity>();
}
