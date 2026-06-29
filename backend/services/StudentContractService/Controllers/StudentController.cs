using MassTransit;
using MassTransit.Transports;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentContractService.Data;
using StudentContractService.Models;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace StudentContractService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StudentController : ControllerBase
    {
        private readonly StudentDbContext _context;
        private readonly IPublishEndpoint _publishEndpoint;
        public StudentController(StudentDbContext context, IPublishEndpoint publishEndpoint)
        {
            _context = context;
            _publishEndpoint = publishEndpoint;
        }

        // 1. Xem thông tin cá nhân
        [HttpGet("profile/{id}")]
        public async Task<IActionResult> GetProfile(Guid id)
        {
            var student = await _context.Students.FindAsync(id);
            if (student == null)
            {
                return NotFound(new { message = "Không tìm thấy sinh viên này!" });
            }
            return Ok(student);
        }
        // API CẬP NHẬT THÔNG TIN SINH VIÊN
        [HttpPut("profile/{id}")]
        public async Task<IActionResult> UpdateProfile(Guid id, [FromBody] Student updatedStudent)
        {
            // 1. Tìm sinh viên trong DB xem có tồn tại không
            var student = await _context.Students.FindAsync(id);
            if (student == null)
                return NotFound(new { message = "Không tìm thấy sinh viên này!" });

            // 2. Cập nhật các trường thông tin cơ bản
            student.FullName = updatedStudent.FullName;
            student.Email = updatedStudent.Email;
            student.PhoneNumber = updatedStudent.PhoneNumber;

            // 3. Lưu xuống Database
            _context.Students.Update(student);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Cập nhật thông tin sinh viên thành công!", data = student });
        }

        

        // 3. Tạo đơn xin chuyển phòng
        [HttpPost("room-transfer")]
        public async Task<IActionResult> CreateTransferRequest([FromBody] RoomTransferRequest request)
        {
            var student = await _context.Students.FindAsync(request.StudentId);
            if (student == null) return NotFound(new { message = "Sinh viên không tồn tại!" });

            request.Id = Guid.NewGuid();
            request.FromRoomId = student.CurrentRoomId ?? 0;
            request.Status = "Pending";
            request.CreatedAt = DateTime.UtcNow;
            request.Id = Guid.NewGuid();
            request.FromRoomId = student.CurrentRoomId ?? 0;
            request.Status = "Pending";
            request.CreatedAt = DateTime.UtcNow;

            // =================================================================
            // 🔥 THÊM DÒNG NÀY VÀO TRƯỚC DÒNG 60 ĐỂ SỬA LỖI:
            // =================================================================
            request.Student = null;
            _context.RoomTransferRequests.Add(request);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Gửi đơn xin chuyển phòng thành công!", requestId = request.Id });
        }

        // 4. Xem lịch sử duyệt đơn
        [HttpGet("room-transfer/history/{studentId}")]
        public async Task<IActionResult> GetTransferHistory(Guid studentId)
        {
            var history = await _context.RoomTransferRequests
                .Where(r => r.StudentId == studentId)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

            return Ok(history);
        }

        // 5. Xuất thông tin hợp đồng Active
        [HttpGet("contract/{studentId}")]
        public async Task<IActionResult> GetActiveContract(Guid studentId)
        {
            var contract = await _context.Contracts
                .Where(c => c.StudentId == studentId && c.Status == "Active")
                .FirstOrDefaultAsync();

            if (contract == null)
            {
                return NotFound(new { message = "Bạn hiện không có hợp đồng lưu trú nào còn hiệu lực!" });
            }

            return Ok(contract);
        }
        // 5. API DÀNH CHO ADMIN: DUYỆT ĐƠN XIN CHUYỂN PHÒNG (Trong StudentController.cs)
        [HttpPut("room-transfer/approve/{id}")]
        public async Task<IActionResult> ApproveRoomTransfer(Guid id)
        {
            // 1. Tìm đơn xin chuyển phòng theo ID đơn
            var transferRequest = await _context.RoomTransferRequests.FindAsync(id);
            if (transferRequest == null)
                return NotFound(new { message = "Không tìm thấy đơn xin chuyển phòng này!" });

            // 2. Kiểm tra nếu đơn đã được xử lý trước đó rồi thì chặn lại
            if (transferRequest.Status != "Pending")
                return BadRequest(new { message = "Đơn này đã được xử lý trước đó rồi!" });

            // 3. Tìm sinh viên nộp đơn dựa vào StudentId có trong đơn
            var student = await _context.Students.FindAsync(transferRequest.StudentId);
            if (student == null)
                return NotFound(new { message = "Không tìm thấy sinh viên tương ứng với đơn này!" });

            // 4. TIẾN HÀNH DUYỆT:
            // - Đổi trạng thái đơn thành Approved
            transferRequest.Status = "Approved";

            // - Cập nhật phòng mới cho hồ sơ sinh viên
            student.CurrentRoomId = transferRequest.ToRoomId;

            // 🔥 THÊM MỚI: Tìm và cập nhật luôn RoomId trong Hợp đồng đang Active để dữ liệu đồng bộ
            var activeContract = await _context.Contracts
                .FirstOrDefaultAsync(c => c.StudentId == student.Id && c.Status == "Active");

            if (activeContract != null)
            {
                activeContract.RoomId = transferRequest.ToRoomId;
                _context.Contracts.Update(activeContract);
            }

            // 5. Lưu toàn bộ thay đổi xuống Database
            await _context.SaveChangesAsync();

            // 🔥 SỬA LẠI: Bắn sự kiện qua RabbitMQ sử dụng chuẩn chung ở DMS.Shared
            // Thay đổi từ request.FromRoomId thành transferRequest.FromRoomId
            // // ⚠️ SỬA LẠI: Bắn sự kiện qua RabbitMQ sử dụng chuẩn chung ở DMS.Shared
            var oldRoom = await _context.Rooms.FindAsync(transferRequest.FromRoomId); // ✅ Đã sửa thành transferRequest
            var newRoom = await _context.Rooms.FindAsync(transferRequest.ToRoomId);   // ✅ Đã sửa thành transferRequest

            await _publishEndpoint.Publish<DMS.Shared.IRoomTransferApprovedEvent>(new
            {
                RequestId = transferRequest.Id,
                StudentId = student.Id,
                FromRoomId = transferRequest.FromRoomId,
                ToRoomId = transferRequest.ToRoomId,
                FromRoomPrice = oldRoom?.MonthlyPrice ?? 0,
                ToRoomPrice = newRoom?.MonthlyPrice ?? 0    // Lấy giá phòng mới
            });

            // Note: Bạn nhớ xóa cái class con "RoomTransferApproved" thừa ở cuối file StudentController đi nhé!

            return Ok(new
            {
                message = $"Đã duyệt đơn thành công! Sinh viên {student.FullName} đã được chuyển sang phòng {transferRequest.ToRoomId} và cập nhật vào hợp đồng."
            });
        }
        public class RoomTransferApproved
        {
            public Guid RequestId { get; set; }
            public Guid StudentId { get; set; }
            public int FromRoomId { get; set; }
            public int ToRoomId { get; set; }
        }
        // API DÀNH CHO ADMIN: TỪ CHỐI ĐƠN XIN CHUYỂN PHÒNG
        [HttpPut("room-transfer/reject/{id}")]
        public async Task<IActionResult> RejectRoomTransfer(Guid id, [FromQuery] string rejectReason)
        {
            // 1. Tìm đơn theo ID
            var transferRequest = await _context.RoomTransferRequests.FindAsync(id);
            if (transferRequest == null)
                return NotFound(new { message = "Không tìm thấy đơn xin chuyển phòng này!" });

            // 2. Chặn nếu đơn đã xử lý rồi
            if (transferRequest.Status != "Pending")
                return BadRequest(new { message = "Đơn này đã được xử lý trước đó rồi!" });

            // 3. Tiến hành từ chối đơn
            transferRequest.Status = "Rejected";

            // Nếu trong bảng RoomTransferRequests của bạn có trường lưu lý do từ chối (vd: RejectReason hoặc Comment)
            // transferRequest.RejectReason = rejectReason; 

            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã từ chối đơn xin chuyển phòng thành công." });
        }
    }
}