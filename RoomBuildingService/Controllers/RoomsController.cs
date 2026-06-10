using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RoomBuildingService.Models;
using RoomBuildingService.Data;

namespace RoomBuildingService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    // Sử dụng Primary Constructor của C# 12 cho ngắn gọn
    public class RoomsController(RoomDbContext context) : ControllerBase
    {
        // GET: api/Rooms
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Room>>> GetRooms()
        {
            return await context.Rooms.ToListAsync();
        }

        // GET: api/Rooms/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Room>> GetRoom(int id)
        {
            var room = await context.Rooms.FindAsync(id);

            if (room == null)
            {
                return NotFound();
            }

            return room;
        }

        // PUT: api/Rooms/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutRoom(int id, Room room)
        {
            if (id != room.Id)
            {
                return BadRequest();
            }

            context.Entry(room).State = EntityState.Modified;

            try
            {
                await context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!RoomExists(id))
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

        // POST: api/Rooms
        [HttpPost]
        public async Task<ActionResult<Room>> PostRoom(Room room)
        {
            context.Rooms.Add(room);
            await context.SaveChangesAsync();

            return CreatedAtAction("GetRoom", new { id = room.Id }, room);
        }

        // DELETE: api/Rooms/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRoom(int id)
        {
            var room = await context.Rooms.FindAsync(id);
            if (room == null)
            {
                return NotFound();
            }

            context.Rooms.Remove(room);
            await context.SaveChangesAsync();

            return NoContent();
        }

        private bool RoomExists(int id)
        {
            return context.Rooms.Any(e => e.Id == id);
        }
        // GET: api/Rooms/ByBuilding/1
        [HttpGet("ByBuilding/{buildingId}")]
        public async Task<ActionResult<IEnumerable<Room>>> GetRoomsByBuilding(int buildingId)
        {
            return await context.Rooms
                .Where(r => r.BuildingId == buildingId)
                .ToListAsync();
        }
    }
}