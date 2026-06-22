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
        // GET: api/Rooms
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetRooms()
        {
            var rooms = await _context.Rooms
                .Include(r => r.Building)      // Kéo data từ bảng Buildings
                .Select(r => new
                {
                    id = r.Id,
                    buildingId = r.BuildingId,
                    building = r.Building.Name, // Lấy tên Tòa nhà thay vì chỉ ID
                    roomNumber = r.RoomNumber,
                    floorNumber = r.FloorNumber,
                    roomType = r.RoomType,
                    price = r.MonthlyPrice,
                    status = r.Status,
                    size = 25, // Thêm kích thước ảo nếu chưa có trong DB
                    capacity = r.RoomType == "Phòng 4 người" ? 4 : (r.RoomType == "Phòng 6 người" ? 6 : 2),

                    // Xử lý đếm giường trống từ RoomDB nếu bạn có mapping với bảng Beds,
                    // Nếu chưa có Navigation Property r.Beds, tạm thời mock data:
                    available = r.Status == "Còn chỗ" ? 2 : 0,

                    // Mock danh sách tiện ích (Hoặc dùng Include(r.RoomAmenities) nếu có mapping)
                    amenities = new[] { "Máy lạnh", "WC riêng" }
                })
                .ToListAsync();

            return Ok(rooms);
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