using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentContractService.Data;
using StudentContractService.Models;
using MassTransit;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace StudentContractService.Controllers
{
    [Route("api/StudentContracts")]
    [ApiController]
    public class ContractController : ControllerBase
    {
        private readonly StudentDbContext _context;
        private readonly IPublishEndpoint _publishEndpoint;

        public ContractController(StudentDbContext context, IPublishEndpoint publishEndpoint)
        {
            _context = context;
            _publishEndpoint = publishEndpoint;
        }

        // 1. LẤY DANH SÁCH TẤT CẢ HỢP ĐỒNG
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Contract>>> GetContracts()
        {
            return await _context.Contracts.Include(c => c.Student).ToListAsync();
        }

        // 2. XEM CHI TIẾT MỘT HỢP ĐỒNG THEO ID
        [HttpGet("{id}")]
        public async Task<IActionResult> GetContract(Guid id)
        {
            var contract = await _context.Contracts.FindAsync(id);
            if (contract == null) return NotFound(new { message = "Không tìm thấy hợp đồng này!" });
            return Ok(contract);
        }

        // 3. TẠO MỚI HỢP ĐỒNG LƯU TRÚ (Trạng thái mặc định là Chờ Duyệt)
        [HttpPost]
        public async Task<IActionResult> CreateContract([FromBody] Contract contract)
        {
            var student = await _context.Students.FindAsync(contract.StudentId);
            if (student == null) return NotFound(new { message = "Không tìm thấy sinh viên tương ứng!" });

            contract.Id = Guid.NewGuid();

            // 🔥 ĐỔI THÀNH PENDING: Chờ Admin bấm duyệt chứ chưa thể Active ngay được
            contract.Status = "Pending";

            contract.Student = null; // Ép EF Core không tự động INSERT lại bản ghi Sinh viên
            student.CurrentRoomId = contract.RoomId;

            _context.Contracts.Add(contract);
            await _context.SaveChangesAsync();

            // (Tùy chọn) Bắn tin thông báo có hợp đồng mới tạo nếu cần, hiện tại giữ nguyên logic của bạn
            await _publishEndpoint.Publish<ContractCreated>(new ContractCreated
            {
                Id = contract.Id,
                StudentId = contract.StudentId,
                RoomId = contract.RoomId,
                RoomPrice = contract.RoomPrice,
                StartDate = contract.StartDate,
                EndDate = contract.EndDate
            });

            return CreatedAtAction(nameof(GetContract), new { id = contract.Id }, contract);
        }

        // 4. THANH LÝ / CHẤM DỨT HỢP ĐỒNG
        [HttpPut("{id}/terminate")]
        public async Task<IActionResult> TerminateContract(Guid id)
        {
            var contract = await _context.Contracts.FindAsync(id);
            if (contract == null) return NotFound(new { message = "Không tìm thấy hợp đồng!" });

            contract.Status = "Terminated";
            var student = await _context.Students.FindAsync(contract.StudentId);
            if (student != null) student.CurrentRoomId = null;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Đã chấm dứt hợp đồng thành công!" });
        }

        
        // 5. XÁC NHẬN CHECK-IN (KÍCH HOẠT HỢP ĐỒNG & BÁO SANG BILLING)
        [HttpPut("{id}/check-in")]
        public async Task<IActionResult> CheckIn(Guid id)
        {
            var contract = await _context.Contracts.FindAsync(id);
            if (contract == null) return NotFound(new { message = "Không tìm thấy hợp đồng!" });

            if (contract.Status == "Active")
                return BadRequest(new { message = "Sinh viên đã check-in rồi!" });

            contract.Status = "Active";
            _context.Contracts.Update(contract);
            await _context.SaveChangesAsync();

            // Tự động sinh hóa đơn tiền phòng tháng đầu tiên
            await _publishEndpoint.Publish<DMS.Shared.IContractApprovedEvent>(new
            {
                ContractId = Math.Abs(contract.Id.GetHashCode()),
                StudentId = contract.StudentId.ToString(), // TODO: Fetch from Student
                RoomId = contract.RoomId,
                Amount = contract.RoomPrice,
                Content = $"Hóa đơn tiền phòng cho hợp đồng mới của sinh viên",
                StartDate = contract.StartDate
            });

            return Ok(new { message = "Đã xác nhận Check-in thành công! Hợp đồng đã kích hoạt.", data = contract });
        }
    }
}