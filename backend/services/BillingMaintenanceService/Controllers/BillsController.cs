using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using BillingMaintenanceService.Domain;
using BillingMaintenanceService.Application;

namespace BillingMaintenanceService.Controllers
{
    [ApiController]
    [Route("api/v1/bills")]
    [Authorize] // Yêu cầu phải có Token hợp lệ mới được gọi các API trong này
    public class BillsController : ControllerBase
    {
        private readonly BillingAppService _billingService;

        // Tiêm chuẩn chỉ BillingAppService theo đúng sơ đồ C4 Component
        public BillsController(BillingAppService billingService)
        {
            _billingService = billingService;
        }

        // =======================================================
        // GET QUERIES
        // =======================================================

        [HttpGet]
        public IActionResult GetAllBills()
        {
            return Ok(new { StatusCode = 200, IsSuccess = true, Data = _billingService.GetAllBills() });
        }

        [HttpGet("{id:guid}")]
        public IActionResult GetBillById(Guid id)
        {
            var bill = _billingService.GetBillById(id);
            if (bill == null) return NotFound(new { IsSuccess = false, Message = "Không tìm thấy hóa đơn!" });
            return Ok(new { IsSuccess = true, Data = bill });
        }

        [HttpGet("room/{roomId}")]
        public IActionResult GetBillsByRoomId(int roomId)
        {
            return Ok(new { StatusCode = 200, IsSuccess = true, Data = _billingService.GetByRoomId(roomId) });
        }

        [HttpGet("student/{studentId}")]
        public IActionResult GetBillsByStudentId(int studentId)
        {
            return Ok(new { StatusCode = 200, IsSuccess = true, Data = _billingService.GetByStudentId(studentId) });
        }

        [HttpGet("unpaid")]
        public IActionResult GetUnpaidBills()
        {
            return Ok(new { StatusCode = 200, IsSuccess = true, Data = _billingService.GetUnpaidBills() });
        }

        [HttpGet("stats")]
        public IActionResult GetStats()
        {
            return Ok(new { StatusCode = 200, IsSuccess = true, Data = _billingService.GetRevenueStats() });
        }

        /// <summary>Lấy hóa đơn theo loại: MONTHLY hoặc EXTRA_FEE</summary>
        [HttpGet("type/{type}")]
        public IActionResult GetByType(string type)
        {
            if (!BillTypes.IsValid(type))
                return BadRequest(new { IsSuccess = false, Message = $"Loại hóa đơn không hợp lệ. Chỉ chấp nhận: {string.Join(", ", BillTypes.All)}" });

            return Ok(new { StatusCode = 200, IsSuccess = true, Data = _billingService.GetBillsByType(type) });
        }

        /// <summary>Lấy hóa đơn sắp tới hạn đóng tiền (trong N ngày tới, mặc định 3 ngày)</summary>
        [HttpGet("due-soon")]
        public IActionResult GetDueSoon([FromQuery] int days = 3)
        {
            if (days <= 0 || days > 30)
                return BadRequest(new { IsSuccess = false, Message = "Số ngày phải trong khoảng 1-30!" });

            return Ok(new { StatusCode = 200, IsSuccess = true, Data = _billingService.GetBillsDueSoon(days) });
        }

        // =======================================================
        // COMMANDS (MUTATIONS)
        // =======================================================

        [HttpPost]
        public IActionResult CreateBill([FromBody] Bill newBill)
        {
            var result = _billingService.CreateBill(newBill);
            return Ok(new { StatusCode = 201, IsSuccess = true, Data = result });
        }

        /// <summary>Tạo hóa đơn phát sinh lẻ (tiền phạt, đền bù, làm lại chìa khóa...)</summary>
        public class CreateExtraFeeRequest
        {
            public int RoomId { get; set; }
            public int StudentId { get; set; }
            public string Reason { get; set; } = ExtraFeeReasons.Other;      // Lý do thu
            public string Description { get; set; } = string.Empty; // Mô tả chi tiết
            public decimal Amount { get; set; }                      // Số tiền (VNĐ)
        }

        [HttpPost("extra-fee")]
        public IActionResult CreateExtraFee([FromBody] CreateExtraFeeRequest req)
        {
            if (req.Amount <= 0)
                return BadRequest(new { IsSuccess = false, Message = "Số tiền phải lớn hơn 0!" });

            var result = _billingService.CreateExtraFeeBill(req.RoomId, req.StudentId, req.Reason, req.Description, req.Amount);
            return Ok(new { StatusCode = 201, IsSuccess = true, Data = result });
        }

        [HttpPut("{id:guid}/pay")]
        public IActionResult PayBill(Guid id)
        {
            var result = _billingService.PayBill(id);
            if (result == null) return NotFound(new { IsSuccess = false, Message = "Không tìm thấy hóa đơn!" });
            return Ok(new { IsSuccess = true, Message = "Thanh toán thành công!", Data = result });
        }

        [HttpPut("{id:guid}/student-pay")]
        public IActionResult StudentPayBill(Guid id)
        {
            var result = _billingService.StudentPayBill(id);
            if (result == null) return NotFound(new { IsSuccess = false, Message = "Không tìm thấy hóa đơn!" });
            return Ok(new { IsSuccess = true, Message = "Đã nộp minh chứng, chờ xác thực!", Data = result });
        }

        [HttpDelete("{id:guid}")]
        public IActionResult DeleteBill(Guid id)
        {
            var success = _billingService.DeleteBill(id);
            if (!success) return NotFound(new { IsSuccess = false, Message = "Không tìm thấy hóa đơn để xóa!" });
            return Ok(new { IsSuccess = true, Message = "Đã xóa hóa đơn thành công!" });
        }
    }
}
