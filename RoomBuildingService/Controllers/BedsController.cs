using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RoomBuildingService.Models;
using RoomBuildingService.Data;

[Route("api/[controller]")]
[ApiController]
public class BedsController : ControllerBase
{
    private readonly RoomDbContext _context;
    public BedsController(RoomDbContext context)
    {
        _context = context;
    }

    // GET: api/Bed
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Bed>>> GetBed()
    {
        return await _context.Beds.ToListAsync();
    }

    // GET: api/Bed/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Bed>> GetBed(int id)
    {
        var bed = await _context.Beds.FindAsync(id);

        if (bed == null)
        {
            return NotFound();
        }

        return bed;
    }

    // PUT: api/Bed/5
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPut("{id}")]
    public async Task<IActionResult> PutBed(int? id, Bed bed)
    {
        if (id != bed.Id)
        {
            return BadRequest();
        }

        _context.Entry(bed).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!BedExists(id))
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

    // POST: api/Bed
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPost]
    public async Task<ActionResult<Bed>> PostBed(Bed bed)
    {
        _context.Beds.Add(bed);
        await _context.SaveChangesAsync();

        return CreatedAtAction("GetBed", new { id = bed.Id }, bed);
    }

    // DELETE: api/Bed/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBed(int? id)
    {
        var bed = await _context.Beds.FindAsync(id);
        if (bed == null)
        {
            return NotFound();
        }

        _context.Beds.Remove(bed);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool BedExists(int? id)
    {
        return _context.Beds.Any(e => e.Id == id);
    }
}
