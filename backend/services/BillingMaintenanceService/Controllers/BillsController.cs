using Microsoft.AspNetCore.Mvc;
using BillingMaintenanceService.Domain;
using BillingMaintenanceService.Application;

namespace BillingMaintenanceService.Controllers
{
    [ApiController]
    [Route("api/v1/bills")]
    public class BillsController : ControllerBase
    {
        private readonly BillingAppService _billingService;

        // Tiêm chuẩn chỉ BillingAppService theo đúng sơ đồ C4 Component
        public BillsController(BillingAppService billingService)
        {
            _billingService = billingService;
        }

        [HttpGet]
        public IActionResult GetAllBills()
        {
            return Ok(new { StatusCode = 200, IsSuccess = true, Data = _billingService.GetAllBills() });
        }

        [HttpGet("{id}")]
        public IActionResult GetBillById(Guid id)
        {
            var bill = _billingService.GetBillById(id);
            if (bill == null) return NotFound(new { IsSuccess = false, Message = "Không tìm thấy hóa đơn!" });
            return Ok(new { IsSuccess = true, Data = bill });
        }

        [HttpPost]
        public IActionResult CreateBill([FromBody] Bill newBill)
        {
            var result = _billingService.CreateBill(newBill);
            return Ok(new { StatusCode = 201, IsSuccess = true, Data = result });
        }

        [HttpPut("{id}/pay")]
        public IActionResult PayBill(Guid id)
        {
            var result = _billingService.PayBill(id);
            if (result == null) return NotFound(new { IsSuccess = false, Message = "Không tìm thấy hóa đơn!" });
            return Ok(new { IsSuccess = true, Message = "Thanh toán thành công!", Data = result });
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteBill(Guid id)
        {
            var success = _billingService.DeleteBill(id);
            if (!success) return NotFound(new { IsSuccess = false, Message = "Không tìm thấy hóa đơn để xóa!" });
            return Ok(new { IsSuccess = true, Message = "Đã xóa hóa đơn thành công!" });
        }
    }
}