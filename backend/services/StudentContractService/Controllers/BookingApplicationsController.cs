using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentContractService.Data;
using StudentContractService.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace StudentContractService.Controllers
{
    [Route("api/StudentContracts/Applications")]
    [ApiController]
    public class BookingApplicationsController : ControllerBase
    {
        private readonly StudentDbContext _context;

        public BookingApplicationsController(StudentDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<BookingApplication>>> GetApplications()
        {
            return await _context.BookingApplications.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetApplication(Guid id)
        {
            var app = await _context.BookingApplications.FindAsync(id);
            if (app == null) return NotFound(new { message = "Không tìm thấy đơn!" });
            return Ok(app);
        }

        [HttpPost]
        public async Task<IActionResult> CreateApplication([FromBody] BookingApplication app)
        {
            app.Id = Guid.NewGuid();
            app.Status = "Pending";
            app.CreatedAt = DateTime.UtcNow;

            _context.BookingApplications.Add(app);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetApplication), new { id = app.Id }, app);
        }

        [HttpPut("{id}/approve")]
        public async Task<IActionResult> ApproveApplication(Guid id)
        {
            var app = await _context.BookingApplications.FindAsync(id);
            if (app == null) return NotFound(new { message = "Không tìm thấy đơn!" });
            
            if (app.Status != "Pending") 
                return BadRequest(new { message = "Đơn đã được xử lý!" });

            // 1. Cập nhật trạng thái Đơn
            app.Status = "Approved";
            app.UpdatedAt = DateTime.UtcNow;

            // 2. Tạo hoặc cập nhật Sinh viên
            var student = await _context.Students.FirstOrDefaultAsync(s => s.StudentCode == app.StudentId);
            if (student == null)
            {
                student = new Student
                {
                    Id = Guid.NewGuid(),
                    FullName = app.FullName,
                    StudentCode = app.StudentId,
                    Email = app.Email,
                    PhoneNumber = app.Phone,
                    CurrentRoomId = app.RoomId
                };
                _context.Students.Add(student);
            }
            else
            {
                student.CurrentRoomId = app.RoomId;
                _context.Students.Update(student);
            }

            // 3. Tự động sinh ra Hợp đồng (Pending Check-in)
            var contract = new Contract
            {
                Id = Guid.NewGuid(),
                StudentId = student.Id,
                RoomId = app.RoomId,
                StartDate = DateTime.UtcNow,
                EndDate = DateTime.UtcNow.AddMonths(12),
                RoomPrice = 1500000, // Hardcode tạm giá hoặc gọi sang N1 lấy
                Status = "Pending"
            };
            _context.Contracts.Add(contract);

            await _context.SaveChangesAsync();
            return Ok(new { message = "Đã duyệt đơn và tạo Hợp đồng chờ Check-in!", data = app });
        }

        [HttpPut("{id}/reject")]
        public async Task<IActionResult> RejectApplication(Guid id)
        {
            var app = await _context.BookingApplications.FindAsync(id);
            if (app == null) return NotFound(new { message = "Không tìm thấy đơn!" });

            if (app.Status != "Pending") 
                return BadRequest(new { message = "Đơn đã được xử lý!" });

            app.Status = "Rejected";
            app.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return Ok(new { message = "Đã từ chối đơn!" });
        }
    }
}
