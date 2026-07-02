using MassTransit;
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
    public class TransfersController : ControllerBase
    {
        private readonly StudentDbContext _context;
        private readonly IPublishEndpoint _publishEndpoint;

        public TransfersController(StudentDbContext context, IPublishEndpoint publishEndpoint)
        {
            _context = context;
            _publishEndpoint = publishEndpoint;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllTransfers()
        {
            var transfers = await _context.RoomTransferRequests.Include(r => r.Student).OrderByDescending(r => r.CreatedAt).ToListAsync();
            return Ok(transfers);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetTransfer(Guid id)
        {
            var transfer = await _context.RoomTransferRequests.FindAsync(id);
            if (transfer == null) return NotFound();
            return Ok(transfer);
        }

        [HttpPost]
        public async Task<IActionResult> CreateTransferRequest([FromBody] RoomTransferRequest request)
        {
            var student = await _context.Students.FindAsync(request.StudentId);
            if (student == null) return NotFound(new { message = "Sinh viên không tồn tại!" });

            request.Id = Guid.NewGuid();
            request.FromRoomId = student.CurrentRoomId ?? 0;
            request.Status = "Pending";
            request.CreatedAt = DateTime.UtcNow;
            request.Student = null;
            
            _context.RoomTransferRequests.Add(request);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Gửi đơn xin chuyển phòng thành công!", requestId = request.Id });
        }

        [HttpPut("{id}/approve")]
        public async Task<IActionResult> ApproveTransfer(Guid id)
        {
            var transferRequest = await _context.RoomTransferRequests.FindAsync(id);
            if (transferRequest == null) return NotFound(new { message = "Không tìm thấy đơn xin chuyển phòng này!" });

            if (transferRequest.Status != "Pending") return BadRequest(new { message = "Đơn này đã được xử lý trước đó rồi!" });

            var student = await _context.Students.FindAsync(transferRequest.StudentId);
            if (student == null) return NotFound(new { message = "Không tìm thấy sinh viên tương ứng với đơn này!" });

            transferRequest.Status = "Approved";
            student.CurrentRoomId = transferRequest.ToRoomId;

            var activeContract = await _context.Contracts.FirstOrDefaultAsync(c => c.StudentId == student.Id && c.Status == "Active");
            if (activeContract != null)
            {
                activeContract.RoomId = transferRequest.ToRoomId;
                _context.Contracts.Update(activeContract);
            }

            await _context.SaveChangesAsync();

            var oldRoom = await _context.Rooms.FindAsync(transferRequest.FromRoomId);
            var newRoom = await _context.Rooms.FindAsync(transferRequest.ToRoomId);

            await _publishEndpoint.Publish<DMS.Shared.IRoomTransferApprovedEvent>(new
            {
                RequestId = transferRequest.Id,
                StudentId = student.Id,
                FromRoomId = transferRequest.FromRoomId,
                ToRoomId = transferRequest.ToRoomId,
                FromRoomPrice = oldRoom?.MonthlyPrice ?? 0,
                ToRoomPrice = newRoom?.MonthlyPrice ?? 0
            });

            return Ok(new { message = $"Đã duyệt đơn thành công! Sinh viên {student.FullName} đã được chuyển sang phòng {transferRequest.ToRoomId}." });
        }

        [HttpPut("{id}/reject")]
        public async Task<IActionResult> RejectTransfer(Guid id)
        {
            var transferRequest = await _context.RoomTransferRequests.FindAsync(id);
            if (transferRequest == null) return NotFound(new { message = "Không tìm thấy đơn!" });

            if (transferRequest.Status != "Pending") return BadRequest(new { message = "Đơn này đã được xử lý trước đó rồi!" });

            transferRequest.Status = "Rejected";
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã từ chối đơn xin chuyển phòng thành công." });
        }
    }
}
