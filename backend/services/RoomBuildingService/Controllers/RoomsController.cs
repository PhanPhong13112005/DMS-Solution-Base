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
        private readonly MassTransit.IPublishEndpoint _publishEndpoint;

        // Tiêm cả DbContext và IRoomService vào Controller
        public RoomsController(RoomDbContext context, IRoomService roomService, MassTransit.IPublishEndpoint publishEndpoint)
        {
            _context = context;
            _roomService = roomService;
            _publishEndpoint = publishEndpoint;
        }

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

        // ==========================================
        // PHÂN HỆ CÁN BỘ: TRA CỨU PHÒNG
        // GET: api/Rooms/staff/search?buildingId=1&floor=2&status=Còn chỗ
        // ==========================================
        [HttpGet("staff/search")]
        public async Task<ActionResult<IEnumerable<object>>> SearchRooms(
            [FromQuery] int? buildingId,
            [FromQuery] int? floor,
            [FromQuery] string? status)
        {
            // Khởi tạo luồng truy vấn từ bảng Rooms
            var query = _context.Rooms.AsQueryable();

            // 1. Lọc theo Tòa nhà
            if (buildingId.HasValue)
            {
                query = query.Where(r => r.BuildingId == buildingId.Value);
            }

            // 2. Lọc theo Tầng (Sử dụng thuộc tính FloorNumber của Room)
            if (floor.HasValue)
            {
                query = query.Where(r => r.FloorNumber == floor.Value);
            }

            // 3. Lọc theo Tình trạng (Ví dụ: "Còn chỗ", "Hết chỗ")
            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(r => r.Status == status);
            }

            // Định dạng dữ liệu đầu ra chuẩn chỉnh giống hàm GetRooms để Frontend dễ dùng chung cấu trúc
            var results = await query
                .Include(r => r.Building)
                .Select(r => new
                {
                    id = r.Id,
                    buildingId = r.BuildingId,
                    building = r.Building.Name,
                    roomNumber = r.RoomNumber,
                    floorNumber = r.FloorNumber,
                    roomType = r.RoomType,
                    price = r.MonthlyPrice,
                    status = r.Status,
                    size = 25,
                    capacity = r.RoomType == "Phòng 4 người" ? 4 : (r.RoomType == "Phòng 6 người" ? 6 : 2),
                    available = r.Status == "Còn chỗ" ? 2 : 0,
                    amenities = new[] { "Máy lạnh", "WC riêng" }
                })
                .ToListAsync();

            return Ok(results);
        }

        // ==========================================
        // PHÂN HỆ SINH VIÊN: PHÒNG CỦA TÔI
        // GET: api/Rooms/my-room/{studentId}
        // ==========================================
        [HttpGet("my-room/{studentId}")]
        public async Task<ActionResult<object>> GetMyRoom(string studentId)
        {
            // 1. Tìm giường mà sinh viên đang ở
            var bed = await _context.Beds.FirstOrDefaultAsync(b => b.AssignedStudentId == studentId);
            if (bed == null)
            {
                return NotFound(new { message = "Không tìm thấy thông tin lưu trú của sinh viên này." });
            }

            // 2. Lấy thông tin phòng, tòa nhà, và danh sách tất cả các giường trong phòng đó
            var room = await _context.Rooms
                .Include(r => r.Building)
                .Include(r => r.Beds)
                .Include(r => r.RoomAmenities)
                .FirstOrDefaultAsync(r => r.Id == bed.RoomId);

            if (room == null)
            {
                return NotFound(new { message = "Lỗi dữ liệu: Phòng không tồn tại." });
            }

            // 3. Trả về format DTO
            var result = new
            {
                id = room.Id,
                buildingId = room.BuildingId,
                buildingName = room.Building?.Name,
                roomNumber = room.RoomNumber,
                floorNumber = room.FloorNumber,
                roomType = room.RoomType,
                price = room.MonthlyPrice,
                status = room.Status,
                myBed = new 
                {
                    id = bed.Id,
                    bedName = bed.BedName
                },
                roommates = room.Beds?.Where(b => b.AssignedStudentId != null && b.AssignedStudentId != studentId)
                                     .Select(b => new { 
                                         bedName = b.BedName, 
                                         studentId = b.AssignedStudentId 
                                     }),
                amenities = room.RoomAmenities?.Select(a => new {
                    name = a.AmenityName,
                    condition = a.Condition
                })
            };

            return Ok(result);
        }

        // ==========================================
        // KHÓA/MỞ KHÓA PHÒNG
        // PUT: api/Rooms/Maintenance/5
        // ==========================================
        [HttpPut("Maintenance/{id}")]
        public async Task<IActionResult> RequestMaintenance(int id, [FromBody] RoomMaintenanceRequest request)
        {
            var room = await _context.Rooms.FindAsync(id);
            if (room == null) return NotFound(new { message = "Không tìm thấy phòng." });

            room.Status = request.Status; // VD: "Under Maintenance", "Còn chỗ", "Đầy"
            await _context.SaveChangesAsync();

            // Publish sự kiện
            await _publishEndpoint.Publish(new RoomBuildingService.Events.RoomStatusChanged
            {
                RoomId = id,
                Status = room.Status,
                Reason = request.Reason,
                ChangedAt = System.DateTime.UtcNow
            });

            return Ok(new { message = "Đã cập nhật trạng thái phòng thành công!" });
        }
    }

    public class RoomMaintenanceRequest
    {
        public string Status { get; set; } = null!;
        public string? Reason { get; set; }
    }
}