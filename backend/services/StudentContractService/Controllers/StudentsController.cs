using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentContractService.Data;
using StudentContractService.DTOs;
using StudentContractService.Models;

namespace StudentContractService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StudentsController : ControllerBase
    {
        private readonly StudentDbContext _context;

        public StudentsController(StudentDbContext context)
        {
            _context = context;
        }

        // 1. Lấy danh sách tất cả sinh viên
        [HttpGet]
        public async Task<IActionResult> GetAllStudents()
        {
            return Ok(await _context.Students.ToListAsync());
        }

        // 2. Lấy chi tiết 1 sinh viên (KÈM LỊCH SỬ THUÊ PHÒNG) - CHỨC NĂNG MỚI
        [HttpGet("{id}")]
        public async Task<IActionResult> GetStudentById(int id)
        {
            var student = await _context.Students
                // Join sang bảng hợp đồng để xem sinh viên này đã thuê những phòng nào
                .Include(s => _context.RoomContracts.Where(c => c.StudentId == s.Id))
                .FirstOrDefaultAsync(s => s.Id == id);

            if (student == null) return NotFound(new { Message = "Không tìm thấy sinh viên!" });

            return Ok(student);
        }

        // 3. Thêm sinh viên mới
        [HttpPost]
        public async Task<IActionResult> CreateStudent([FromBody] CreateStudentDto dto)
        {
            var student = new Student
            {
                StudentCode = dto.StudentCode,
                FullName = dto.FullName,
                CitizenId = dto.CitizenId,
                PhoneNumber = dto.PhoneNumber,
                University = dto.University
            };

            _context.Students.Add(student);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Thêm sinh viên thành công!", StudentId = student.Id });
        }

        // 4. Sửa thông tin sinh viên - CHỨC NĂNG MỚI
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateStudent(int id, [FromBody] CreateStudentDto dto)
        {
            var student = await _context.Students.FindAsync(id);
            if (student == null) return NotFound(new { Message = "Không tìm thấy sinh viên!" });

            student.FullName = dto.FullName;
            student.PhoneNumber = dto.PhoneNumber;
            student.University = dto.University;
            // (Thường không cho sửa Mã SV và CCCD, nếu muốn cho sửa bạn thêm vào đây)

            await _context.SaveChangesAsync();
            return Ok(new { Message = "Cập nhật thông tin thành công!" });
        }

        // 5. Xóa sinh viên - CHỨC NĂNG MỚI
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteStudent(int id)
        {
            var student = await _context.Students.FindAsync(id);
            if (student == null) return NotFound(new { Message = "Không tìm thấy sinh viên!" });

            _context.Students.Remove(student);
            await _context.SaveChangesAsync();
            return Ok(new { Message = "Đã xóa sinh viên khỏi hệ thống!" });
        }

        // CHỨC NĂNG MỚI: Thanh toán công nợ (Đóng tiền phòng)
        [HttpPost("{id}/pay-debt")]
        public async Task<IActionResult> PayDebt(int id, [FromBody] decimal amountPaid)
        {
            if (amountPaid <= 0) return BadRequest(new { Message = "Số tiền thanh toán phải lớn hơn 0" });

            var student = await _context.Students.FindAsync(id);
            if (student == null) return NotFound(new { Message = "Không tìm thấy sinh viên!" });

            if (student.DebtBalance == 0) return Ok(new { Message = "Sinh viên này không có nợ!" });

            // Trừ tiền nợ
            student.DebtBalance -= amountPaid;

            // Đảm bảo nợ không bị âm (nếu đóng dư thì đưa về 0)
            if (student.DebtBalance < 0) student.DebtBalance = 0;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = $"Thanh toán thành công {amountPaid:N0} VNĐ!",
                RemainingDebt = student.DebtBalance
            });
        }
    }
}