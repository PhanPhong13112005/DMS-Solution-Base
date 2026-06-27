using System;
using System.Collections.Generic;

namespace RoomBuildingService.Models;

public partial class News
{
    public int Id { get; set; }

    public string Title { get; set; } = null!;

    public string Content { get; set; } = null!;

    public DateTime? CreatedAt { get; set; }

    public string? Author { get; set; }

    public string? Category { get; set; }

    public string? ImageUrl { get; set; }
}
