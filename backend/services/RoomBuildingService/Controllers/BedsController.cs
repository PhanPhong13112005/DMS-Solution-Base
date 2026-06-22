using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RoomBuildingService.Models;
using RoomBuildingService.Data;
using RoomBuildingService.Services;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MassTransit;
using RoomBuildingService.Events;

namespace RoomBuildingService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BedsController : ControllerBase
    {
        private readonly RoomDbContext _context;
        private readonly IRoomService _roomService;
        private readonly IPublishEndpoint _publishEndpoint;

        // Tiêm DbContext và IRoomService vào Controller
        public BedsController(RoomDbContext context, IRoomService roomService, IPublishEndpoint publishEndpoint)
        {
            _context = context;
            _roomService = roomService;
            _publishEndpoint = publishEndpoint;
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

        // API CỐT LÕI: Dành cho việc cấp phát hoặc thu hồi giường của sinh viên
        // PUT: api/Bed/Assign/5
        [HttpPut("Assign/{id}")]
        public async Task<IActionResult> AssignBed(int id, [FromBody] AssignBedRequest request)
        {
            // 1. Lưu xuống SQL Server của Nhóm 1
            var result = await _roomService.UpdateBedStatusAsync(id, request.IsAvailable, request.StudentId);
            if (!result) return NotFound(new { message = "Không tìm thấy giường." });

            // 2. BẮN SỰ KIỆN LÊN RABBITMQ ĐỂ BÁO CHO NHÓM 2, NHÓM 3
            await _publishEndpoint.Publish(new BedAssignedEvent
            {
                BedId = id,
                StudentId = request.StudentId,
                IsAvailable = request.IsAvailable
            });

            return Ok(new { message = "Đã cập nhật giường và gửi thông báo lên hệ thống thành công!" });
        }
    }

    // Class phụ trợ để nhận dữ liệu JSON từ Frontend gửi lên
    public class AssignBedRequest
    {
        public bool IsAvailable { get; set; }
        public string? StudentId { get; set; }
    }
}