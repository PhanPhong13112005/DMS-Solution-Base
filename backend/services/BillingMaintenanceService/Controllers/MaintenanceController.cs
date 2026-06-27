using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using BillingMaintenanceService.Domain;
using BillingMaintenanceService.Application;

namespace BillingMaintenanceService.Controllers
{
    [ApiController]
    [Route("api/v1/maintenance")]
    [Authorize]
    public class MaintenanceController : ControllerBase
    {
        private readonly MaintenanceAppService _maintenanceService;

        public MaintenanceController(MaintenanceAppService maintenanceService)
        {
            _maintenanceService = maintenanceService;
        }


        // =======================================================
        // GET QUERIES
        // =======================================================

        [HttpGet]
        public IActionResult GetAllRequests()
        {
            return Ok(new { StatusCode = 200, IsSuccess = true, Data = _maintenanceService.GetAllRequests() });
        }

        [HttpGet("{id:guid}")]
        public IActionResult GetRequestById(Guid id)
        {
            var request = _maintenanceService.GetRequestById(id);
            if (request == null) return NotFound(new { IsSuccess = false, Message = "Không tìm thấy yêu cầu!" });
            return Ok(new { IsSuccess = true, Data = request });
        }

        [HttpGet("room/{roomId}")]
        public IActionResult GetRequestsByRoomId(int roomId)
        {
            return Ok(new { StatusCode = 200, IsSuccess = true, Data = _maintenanceService.GetByRoomId(roomId) });
        }

        [HttpGet("pending")]
        public IActionResult GetPendingRequests()
        {
            return Ok(new { StatusCode = 200, IsSuccess = true, Data = _maintenanceService.GetPendingRequests() });
        }

        [HttpGet("category/{category}")]
        public IActionResult GetByCategory(string category)
        {
            return Ok(new { StatusCode = 200, IsSuccess = true, Data = _maintenanceService.GetByCategory(category) });
        }

        /// <summary>Lấy danh sách phiếu bảo trì gửi bởi một sinh viên cụ thể</summary>
        [HttpGet("student/{studentId}")]
        public IActionResult GetByStudentId(int studentId)
        {
            return Ok(new { StatusCode = 200, IsSuccess = true, Data = _maintenanceService.GetByStudentId(studentId) });
        }

        /// <summary>
        /// Thống kê hiệu suất bộ phận kỹ thuật (dành cho Admin).
        /// Trả về: tổng phiếu, đang xử lý, hoàn thành, tỷ lệ giải quyết, thời gian xử lý TB.
        /// </summary>
        [HttpGet("stats")]
        public IActionResult GetStats()
        {
            return Ok(new { StatusCode = 200, IsSuccess = true, Data = _maintenanceService.GetMaintenanceStats() });
        }

        // =======================================================
        // COMMANDS (MUTATIONS)
        // =======================================================

        [HttpPost]
        public IActionResult CreateRequest([FromBody] MaintenanceRequest newRequest)
        {
            var result = _maintenanceService.CreateRequest(newRequest);
            return Ok(new { StatusCode = 201, IsSuccess = true, Data = result });
        }

        public class UpdateStatusRequest
        {
            public string Status { get; set; } = string.Empty;
        }

        [HttpPut("{id:guid}/status")]
        public IActionResult UpdateStatus(Guid id, [FromBody] UpdateStatusRequest req)
        {
            try
            {
                var result = _maintenanceService.UpdateStatus(id, req.Status);
                if (result == null) return NotFound(new { IsSuccess = false, Message = "Không tìm thấy yêu cầu cần cập nhật!" });
                return Ok(new { IsSuccess = true, Message = "Cập nhật trạng thái thành công!", Data = result });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { IsSuccess = false, Message = ex.Message });
            }
        }

        [HttpDelete("{id:guid}")]
        public IActionResult DeleteRequest(Guid id)
        {
            var success = _maintenanceService.DeleteRequest(id);
            if (!success) return NotFound(new { IsSuccess = false, Message = "Không tìm thấy yêu cầu để xóa!" });
            return Ok(new { IsSuccess = true, Message = "Đã xóa yêu cầu bảo trì thành công!" });
        }
    }
}