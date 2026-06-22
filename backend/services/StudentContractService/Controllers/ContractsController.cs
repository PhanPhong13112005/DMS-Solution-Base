using System.Text.Json;
using MassTransit;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentContractService.Contracts;
using StudentContractService.Data;
using StudentContractService.DTOs;
using StudentContractService.Models;

namespace StudentContractService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ContractsController : ControllerBase
    {
        private readonly StudentDbContext _context;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IPublishEndpoint _publishEndpoint;

        public ContractsController(StudentDbContext context, IHttpClientFactory httpClientFactory, IPublishEndpoint publishEndpoint)
        {
            _context = context;
            _httpClientFactory = httpClientFactory;
            _publishEndpoint = publishEndpoint;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllContracts()
        {
            var contracts = await _context.RoomContracts.Include(c => c.Student).ToListAsync();
            return Ok(contracts);
        }

        [HttpPost]
        public async Task<IActionResult> CreateContract([FromBody] CreateContractDto dto)
        {
            var studentExists = await _context.Students.AnyAsync(s => s.Id == dto.StudentId);
            if (!studentExists)
            {
                return NotFound(new { Message = "Lỗi: Không tìm thấy sinh viên trong hệ thống!" });
            }

            var client = _httpClientFactory.CreateClient("RoomServiceClient");
            var response = await client.GetAsync($"/api/rooms/{dto.RoomId}");

            if (!response.IsSuccessStatusCode)
            {
                return BadRequest(new { Message = "Lỗi: Không thể kết nối hoặc phòng không tồn tại ở hệ thống Nhóm 1!" });
            }

            var responseContent = await response.Content.ReadAsStringAsync();
            var roomData = JsonSerializer.Deserialize<RoomResponseDto>(responseContent, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            if (roomData == null || roomData.AvailableBeds <= 0)
            {
                return BadRequest(new { Message = "Phòng này đã hết giường trống. Vui lòng chọn phòng khác!" });
            }

            var contract = new RoomContract
            {
                StudentId = dto.StudentId,
                RoomId = dto.RoomId,
                StartDate = DateTime.UtcNow,
                EndDate = DateTime.UtcNow.AddMonths(dto.DurationMonths),
                MonthlyPrice = roomData.CurrentPrice,
                Status = "Active"
            };

            _context.RoomContracts.Add(contract);
            // BỔ SUNG NGHIỆP VỤ CÔNG NỢ: Tính tổng tiền hợp đồng và cộng vào nợ của sinh viên
            var student = await _context.Students.FindAsync(dto.StudentId);
            if (student != null)
            {
                // Tổng tiền = Giá tháng * Số tháng
                decimal totalContractValue = roomData.CurrentPrice * dto.DurationMonths;
                student.DebtBalance += totalContractValue;
            }
            await _context.SaveChangesAsync();

            await _publishEndpoint.Publish(new ContractCreatedEvent
            {
                ContractId = contract.Id,
                StudentId = contract.StudentId,
                RoomId = contract.RoomId,
                MonthlyPrice = contract.MonthlyPrice,
                DurationMonths = dto.DurationMonths,
                CreatedAt = contract.StartDate
            });

            return Ok(new { Message = "Tạo hợp đồng & Bắn tín hiệu sang Nhóm 3 thành công!", ContractId = contract.Id });
        }

        // CHỨC NĂNG MỚI: Kết thúc hoặc Hủy hợp đồng
        [HttpPut("{id}/cancel")]
        public async Task<IActionResult> CancelContract(int id)
        {
            var contract = await _context.RoomContracts.FindAsync(id);
            if (contract == null)
            {
                return NotFound(new { Message = "Không tìm thấy hợp đồng!" });
            }

            if (contract.Status == "Expired" || contract.Status == "Cancelled")
            {
                return BadRequest(new { Message = "Hợp đồng này đã kết thúc từ trước rồi!" });
            }

            // Đổi trạng thái hợp đồng
            contract.Status = "Cancelled";
            contract.EndDate = DateTime.UtcNow; // Cập nhật ngày kết thúc thực tế là ngày hôm nay

            await _context.SaveChangesAsync();

            // Lưu ý: Nếu muốn điểm tuyệt đối, chỗ này có thể bắn thêm 1 Event 'ContractCancelledEvent' 
            // sang Nhóm 3 để họ ngừng tính tiền tháng tiếp theo.

            return Ok(new { Message = "Đã kết thúc hợp đồng thành công!" });
        }
    }
}