using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentContractService.Data;
using StudentContractService.Models;
using System.Threading.Tasks;

namespace StudentContractService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StudentController : ControllerBase
    {
        private readonly ContractDbContext _context;

        public StudentController(ContractDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await _context.Students.ToListAsync());

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var student = await _context.Students.FindAsync(id);
            return student == null ? NotFound("Không tìm thấy sinh viên.") : Ok(student);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Student student)
        {
            if (await _context.Students.AnyAsync(s => s.StudentId == student.StudentId))
                return BadRequest("Mã sinh viên đã tồn tại.");

            _context.Students.Add(student);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = student.StudentId }, student);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] Student updated)
        {
            var student = await _context.Students.FindAsync(id);
            if (student == null) return NotFound();

            student.FullName = updated.FullName;
            student.Faculty = updated.Faculty;
            student.Contact = updated.Contact;

            await _context.SaveChangesAsync();
            return Ok(student);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var student = await _context.Students.FindAsync(id);
            if (student == null) return NotFound();

            _context.Students.Remove(student);
            await _context.SaveChangesAsync();
            return Ok(new { Message = "Xóa hồ sơ thành công." });
        }
    }
}