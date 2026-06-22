using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MassTransit;
using StudentContractService.Data;
using StudentContractService.Models;
using StudentContractService.Services;
using StudentContractService.DTOs;
using System;
using System.Threading.Tasks;
using DMS.Shared;
namespace StudentContractService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ContractController : ControllerBase
    {
        private readonly ContractDbContext _context;
        private readonly RoomServiceClient _roomService;
        private readonly IPublishEndpoint _publishEndpoint;

        public ContractController(ContractDbContext context, RoomServiceClient roomService, IPublishEndpoint publishEndpoint)
        {
            _context = context;
            _roomService = roomService;
            _publishEndpoint = publishEndpoint;
        }

        // 1. Sinh viên đăng ký phòng Online
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RoomRegistrationDto dto)
        {
            if (!await _context.Students.AnyAsync(s => s.StudentId == dto.StudentId))
                return BadRequest("Sinh viên chưa có hồ sơ trên hệ thống.");

            var contract = new Contract
            {
                StudentId = dto.StudentId,
                BuildingId = dto.BuildingId,
                RoomType = dto.RoomType,
                DurationMonths = dto.DurationMonths,
                Status = "Pending"
            };

            _context.Contracts.Add(contract);
            await _context.SaveChangesAsync();
            return Ok(new { Message = "Đăng ký thành công, vui lòng chờ duyệt.", ContractId = contract.Id });
        }

        // 2. Admin duyệt đơn, xếp phòng -> Bắn sự kiện qua RabbitMQ sang Nhóm 3 để sinh hóa đơn
        [HttpPost("{id}/approve")]
        public async Task<IActionResult> Approve(int id, [FromBody] ApproveContractDto dto)
        {
            var contract = await _context.Contracts.FindAsync(id);
            if (contract == null || contract.Status != "Pending") return BadRequest("Đơn không hợp lệ.");

            var isRoomAvailable = await _roomService.CheckRoomAvailableAsync(dto.RoomId);
            if (!isRoomAvailable) return BadRequest("Phòng đầy hoặc không tồn tại.");

            contract.RoomId = dto.RoomId;
            contract.PricePerMonth = dto.PricePerMonth;
            contract.StartDate = DateTime.UtcNow;
            contract.EndDate = DateTime.UtcNow.AddMonths(contract.DurationMonths);
            contract.Status = "Approved";

            await _context.SaveChangesAsync();

            // Phát sự kiện lên RabbitMQ sử dụng Interface chuẩn của MassTransit
            await _publishEndpoint.Publish<IContractApprovedEvent>(new
            {
                ContractId = contract.Id,
                StudentId = contract.StudentId,
                RoomId = contract.RoomId.Value,
                PricePerMonth = contract.PricePerMonth.Value,
                StartDate = contract.StartDate.Value,
                EndDate = contract.EndDate.Value
            });

            return Ok(new { Message = "Hợp đồng đã kích hoạt thành công.", Contract = contract });
        }

        // 3. Kết thúc/Hủy hợp đồng
        [HttpPost("{id}/expire")]
        public async Task<IActionResult> Expire(int id)
        {
            var contract = await _context.Contracts.FindAsync(id);
            if (contract == null || contract.Status != "Approved") return BadRequest("Hợp đồng không thể thao tác.");

            contract.Status = "Expired";
            await _context.SaveChangesAsync();

            await _publishEndpoint.Publish<dynamic>(new
            {
                EventName = "contract.expired",
                ContractId = contract.Id
            });

            return Ok(new { Message = "Hợp đồng đã kết thúc hiệu lực." });
        }
    } // 👈 ĐÂY LÀ NƠI KẾT THÚC CỦA CLASS CONTRACTCONTROLLER

    // 👇 ĐÃ ĐƯA INTERFACE RA NGOÀI CLASS (NHƯNG VẪN NẰM TRONG NAMESPACE) 👇
    
}