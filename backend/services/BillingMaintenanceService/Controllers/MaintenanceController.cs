using Microsoft.AspNetCore.Mvc;
using BillingMaintenanceService.Domain;
using BillingMaintenanceService.Application;

namespace BillingMaintenanceService.Controllers
{
    [ApiController]
    [Route("api/v1/maintenance")]
    public class MaintenanceController : ControllerBase
    {
        private readonly MaintenanceAppService _maintenanceService;

        // Tiêm chuẩn chỉ MaintenanceAppService theo đúng sơ đồ C4 Component
        public MaintenanceController(MaintenanceAppService maintenanceService)
        {
            _maintenanceService = maintenanceService;
        }

        [HttpGet]
        public IActionResult GetAllRequests()
        {
            return Ok(new { StatusCode = 200, IsSuccess = true, Data = _maintenanceService.GetAllRequests() });
        }

        [HttpGet("{id}")]
        public IActionResult GetRequestById(Guid id)
        {
            var request = _maintenanceService.GetRequestById(id);
            if (request == null) return NotFound(new { IsSuccess = false, Message = "Không tìm thấy yêu cầu!" });
            return Ok(new { IsSuccess = true, Data = request });
        }

        [HttpPost]
        public IActionResult CreateRequest([FromBody] MaintenanceRequest newRequest)
        {
            var result = _maintenanceService.CreateRequest(newRequest);
            return Ok(new { StatusCode = 201, IsSuccess = true, Data = result });
        }

        [HttpPut("{id}/status")]
        public IActionResult UpdateStatus(Guid id, [FromQuery] string newStatus)
        {
            var result = _maintenanceService.UpdateStatus(id, newStatus);
            if (result == null) return NotFound(new { IsSuccess = false, Message = "Không tìm thấy yêu cầu cần cập nhật!" });
            return Ok(new { IsSuccess = true, Message = "Cập nhật trạng thái thành công!", Data = result });
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteRequest(Guid id)
        {
            var success = _maintenanceService.DeleteRequest(id);
            if (!success) return NotFound(new { IsSuccess = false, Message = "Không tìm thấy yêu cầu để xóa!" });
            return Ok(new { IsSuccess = true, Message = "Đã xóa yêu cầu bảo trì thành công!" });
        }
    }
}