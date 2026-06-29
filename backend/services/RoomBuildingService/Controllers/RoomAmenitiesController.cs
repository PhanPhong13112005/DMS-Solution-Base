using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RoomBuildingService.Models;
using RoomBuildingService.Data;

[Route("api/[controller]")]
[ApiController]
public class RoomAmenitiesController : ControllerBase
{
    private readonly RoomDbContext _context;
    public RoomAmenitiesController(RoomDbContext context)
    {
        _context = context;
    }

    // GET: api/RoomAmenity
    [HttpGet]
    public async Task<ActionResult<IEnumerable<RoomAmenity>>> GetRoomAmenity()
    {
        return await _context.RoomAmenities.ToListAsync();
    }

    // GET: api/RoomAmenity/5
    [HttpGet("{id}")]
    public async Task<ActionResult<RoomAmenity>> GetRoomAmenity(int id)
    {
        var roomamenity = await _context.RoomAmenities.FindAsync(id);

        if (roomamenity == null)
        {
            return NotFound();
        }

        return roomamenity;
    }

    // PUT: api/RoomAmenity/5
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPut("{id}")]
    public async Task<IActionResult> PutRoomAmenity(int? id, RoomAmenity roomamenity)
    {
        if (id != roomamenity.Id)
        {
            return BadRequest();
        }

        _context.Entry(roomamenity).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!RoomAmenityExists(id))
            {
                return NotFound();
            }
            else
            {
                throw;
            }
        }

        return NoContent();
    }

    // POST: api/RoomAmenity
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPost]
    public async Task<ActionResult<RoomAmenity>> PostRoomAmenity(RoomAmenity roomamenity)
    {
        _context.RoomAmenities.Add(roomamenity);
        await _context.SaveChangesAsync();

        return CreatedAtAction("GetRoomAmenity", new { id = roomamenity.Id }, roomamenity);
    }

    // DELETE: api/RoomAmenity/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteRoomAmenity(int? id)
    {
        var roomamenity = await _context.RoomAmenities.FindAsync(id);
        if (roomamenity == null)
        {
            return NotFound();
        }

        _context.RoomAmenities.Remove(roomamenity);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool RoomAmenityExists(int? id)
    {
        return _context.RoomAmenities.Any(e => e.Id == id);
    }
}
