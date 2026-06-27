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
    [Route("api/[controller]")]
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
            return await _context.Contracts.ToListAsync();
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
        [HttpPut("terminate/{id}")]
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

        
        // 5. API DUYỆT HỢP ĐỒNG & TỰ ĐỘNG PHÁT SỰ KIỆN SANG BÊN HÓA ĐƠN
        [HttpPut("approve/{id}")]
        public async Task<IActionResult> ApproveContract(Guid id)
        {
            // 1. Tìm hợp đồng
            var contract = await _context.Contracts.FindAsync(id);
            if (contract == null)
                return NotFound(new { message = "Không tìm thấy hợp đồng này!" });

            if (contract.Status == "Approved" || contract.Status == "Active")
                return BadRequest(new { message = "Hợp đồng này đã được xử lý hoặc đã kích hoạt từ trước." });

            // 2. Chuyển trạng thái sang Approved
            contract.Status = "Approved";
            _context.Contracts.Update(contract);
            await _context.SaveChangesAsync();

            // 3. BẮN TIN SANG RABBITMQ (ĐÃ SỬA TÊN VÀ KIỂU DỮ LIỆU ĐỂ KHỚP BÊN BILLING)
            await _publishEndpoint.Publish<DMS.Shared.IContractApprovedEvent>(new
            {
                // Mẹo biến Guid thành số int dương để khớp với kiểu Int32 bên Hóa đơn
                ContractId = Math.Abs(contract.Id.GetHashCode()),

                StudentId = contract.StudentId.ToString(),

                // ĐỔI TỪ RoomPrice THÀNH Amount ĐỂ KHỚP VỚI BẢNG INVOICES
                Amount = contract.RoomPrice,

                Content = $"Hóa đơn tiền phòng cho hợp đồng mới của sinh viên mã số {contract.StudentId}"
            });

            return Ok(new { message = "Đã duyệt hợp đồng thành công! Hệ thống đang tự động lập hóa đơn thanh toán.", data = contract });
        }
    }
}