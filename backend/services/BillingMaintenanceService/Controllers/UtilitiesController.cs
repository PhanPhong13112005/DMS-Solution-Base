using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using BillingMaintenanceService.Domain;
using BillingMaintenanceService.Infrastructure;
using System;
using System.Linq;

namespace BillingMaintenanceService.Controllers
{
    [ApiController]
    [Route("api/v1/utilities")]
    [Authorize]
    public class UtilitiesController : ControllerBase
    {
        private readonly BillingMaintenanceRepository _repo;

        public UtilitiesController(BillingMaintenanceRepository repo)
        {
            _repo = repo;
        }

        public class RecordUtilityRequest
        {
            public int RoomId { get; set; }
            public int ElectricityIndex { get; set; }
            public int WaterIndex { get; set; }
        }

        [HttpPost("record")]
        public IActionResult RecordUtilities([FromBody] RecordUtilityRequest req)
        {
            if (req.ElectricityIndex < 0 || req.WaterIndex < 0)
                return BadRequest(new { IsSuccess = false, Message = "Chỉ số không hợp lệ!" });

            string currentMonth = DateTime.Now.ToString("MM/yyyy");

            // Kiểm tra xem phòng này đã chốt trong tháng này chưa
            var existingRecord = _repo.GetUnprocessedUtilityRecords(currentMonth)
                .FirstOrDefault(u => u.RoomId == req.RoomId);

            if (existingRecord != null)
            {
                // Cập nhật lại
                existingRecord.ElectricityIndex = req.ElectricityIndex;
                existingRecord.WaterIndex = req.WaterIndex;
                _repo.UpdateUtilityRecord(existingRecord);
            }
            else
            {
                // Tạo mới
                var newRecord = new UtilityRecord
                {
                    Id = Guid.NewGuid(),
                    RoomId = req.RoomId,
                    TargetMonth = currentMonth,
                    ElectricityIndex = req.ElectricityIndex,
                    WaterIndex = req.WaterIndex,
                    IsProcessed = false,
                    CreatedAt = DateTime.Now
                };
                _repo.AddUtilityRecord(newRecord);
            }

            return Ok(new { StatusCode = 201, IsSuccess = true, Message = "Đã chốt chỉ số điện nước thành công!" });
        }
    }
}
