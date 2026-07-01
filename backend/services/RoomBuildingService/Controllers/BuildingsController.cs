using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RoomBuildingService.Data;
using RoomBuildingService.Models;

namespace RoomBuildingService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BuildingsController : ControllerBase
    {
        private readonly RoomDbContext _context;

        // Dependency Injection: Nạp DbContext vào Controller
        public BuildingsController(RoomDbContext context)
        {
            _context = context;
        }

        // 1. LẤY DANH SÁCH TOÀN BỘ TÒA NHÀ
        // GET: api/Buildings
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Building>>> GetBuildings()
        {
            var list = await _context.Buildings.ToListAsync();
            System.Console.WriteLine("---- SO LUONG TOA NHA: " + list.Count + " ----");
            return list;
        }

        // 2. LẤY THÔNG TIN 1 TÒA NHÀ THEO ID
        // GET: api/Buildings/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Building>> GetBuilding(int id)
        {
            var building = await _context.Buildings.FindAsync(id);

            if (building == null)
            {
                return NotFound(new { message = "Không tìm thấy tòa nhà này." });
            }

            return building;
        }

        // 3. THÊM TÒA NHÀ MỚI
        // POST: api/Buildings
        [HttpPost]
        public async Task<ActionResult<Building>> PostBuilding(Building building)
        {
            _context.Buildings.Add(building);
            await _context.SaveChangesAsync();

            // Trả về HTTP 201 Created cùng với data vừa tạo
            return CreatedAtAction(nameof(GetBuilding), new { id = building.Id }, building);
        }

        // 4. CẬP NHẬT THÔNG TIN TÒA NHÀ
        // PUT: api/Buildings/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutBuilding(int id, Building building)
        {
            if (id != building.Id)
            {
                return BadRequest(new { message = "ID truyền vào và ID của object không khớp." });
            }

            _context.Entry(building).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!BuildingExists(id))
                {
                    return NotFound(new { message = "Không tìm thấy tòa nhà để cập nhật." });
                }
                else
                {
                    throw; // Quăng lỗi nếu có lỗi khác từ database
                }
            }

            return NoContent(); // HTTP 204: Cập nhật thành công và không cần trả về data
        }

        // 5. XÓA TÒA NHÀ
        // DELETE: api/Buildings/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBuilding(int id)
        {
            var building = await _context.Buildings.FindAsync(id);
            if (building == null)
            {
                return NotFound(new { message = "Không tìm thấy tòa nhà để xóa." });
            }

            _context.Buildings.Remove(building);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // Hàm phụ trợ kiểm tra tòa nhà có tồn tại không
        private bool BuildingExists(int id)
        {
            return _context.Buildings.Any(e => e.Id == id);
        }

        // 6. LẤY SƠ ĐỒ TÒA NHÀ - PHÒNG - GIƯỜNG (HIERARCHY)
        // GET: api/Buildings/hierarchy
        [HttpGet("hierarchy")]
        public async Task<ActionResult<IEnumerable<object>>> GetHierarchy()
        {
            var hierarchy = await _context.Buildings
                .Select(b => new
                {
                    buildingId = b.Id,
                    buildingName = b.Name,
                    rooms = _context.Rooms
                        .Where(r => r.BuildingId == b.Id)
                        .Select(r => new
                        {
                            roomId = r.Id,
                            roomNumber = r.RoomNumber,
                            floor = r.FloorNumber,
                            beds = _context.Beds
                                .Where(bed => bed.RoomId == r.Id)
                                .Select(bed => new
                                {
                                    bedId = bed.Id,
                                    bedName = bed.BedName,
                                    status = bed.Status,
                                    studentId = bed.AssignedStudentId
                                }).ToList()
                        }).ToList()
                })
                .ToListAsync();

            return Ok(hierarchy);
        }
    }
}