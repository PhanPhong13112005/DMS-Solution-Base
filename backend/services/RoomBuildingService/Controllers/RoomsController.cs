using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RoomBuildingService.Models;
using RoomBuildingService.Data;
using RoomBuildingService.Services;

namespace RoomBuildingService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RoomsController : ControllerBase
    {
        private readonly RoomDbContext _context;
        private readonly IRoomService _roomService;

        // Tiêm cả DbContext và IRoomService vào Controller
        public RoomsController(RoomDbContext context, IRoomService roomService)
        {
            _context = context;
            _roomService = roomService;
        }

        // GET: api/Rooms
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Room>>> GetRooms()
        {
            return await _context.Rooms.ToListAsync();
        }

        // GET: api/Rooms/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Room>> GetRoom(int id)
        {
            var room = await _context.Rooms.FindAsync(id);

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

            _context.Entry(room).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
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
            _context.Rooms.Add(room);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetRoom", new { id = room.Id }, room);
        }

        // DELETE: api/Rooms/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRoom(int id)
        {
            var room = await _context.Rooms.FindAsync(id);
            if (room == null)
            {
                return NotFound();
            }

            _context.Rooms.Remove(room);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool RoomExists(int id)
        {
            return _context.Rooms.Any(e => e.Id == id);
        }

        // GET: api/Rooms/ByBuilding/1
        [HttpGet("ByBuilding/{buildingId}")]
        public async Task<ActionResult<IEnumerable<Room>>> GetRoomsByBuilding(int buildingId)
        {
            return await _context.Rooms
                .Where(r => r.BuildingId == buildingId)
                .ToListAsync();
        }

        // GET: api/Rooms/available?gender=Nam
        [HttpGet("available")]
        public async Task<IActionResult> GetAvailableRooms([FromQuery] string gender)
        {
            if (string.IsNullOrWhiteSpace(gender))
            {
                return BadRequest(new { message = "Vui lòng cung cấp giới tính (gender) để lọc phòng." });
            }

            var rooms = await _roomService.GetAvailableRoomsByGenderAsync(gender);
            return Ok(rooms);
        }
    }
}