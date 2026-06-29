using MassTransit;
using Microsoft.EntityFrameworkCore;
using DMS.Shared;
using RoomBuildingService.Data;
using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace RoomBuildingService.Consumers
{
    public class RoomTransferApprovedConsumer : IConsumer<IRoomTransferApprovedEvent>
    {
        private readonly RoomDbContext _context;
        private readonly ILogger<RoomTransferApprovedConsumer> _logger;

        public RoomTransferApprovedConsumer(RoomDbContext context, ILogger<RoomTransferApprovedConsumer> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task Consume(ConsumeContext<IRoomTransferApprovedEvent> context)
        {
            var data = context.Message;
            _logger.LogInformation($"[RabbitMQ] Đang xử lý chuyển giường cho đơn: {data.RequestId}");

            // Chuyển Guid StudentId sang string để khớp với kiểu dữ liệu trong bảng Bed
            string studentIdStr = data.StudentId.ToString();

            // 1. XỬ LÝ PHÒNG CŨ: Tìm đúng giường của sinh viên này để GIẢI PHÓNG
            if (data.FromRoomId > 0)
            {
                var oldRoom = await _context.Rooms
                    .Include(r => r.Beds)
                    .FirstOrDefaultAsync(r => r.Id == data.FromRoomId);

                if (oldRoom != null && oldRoom.Beds != null)
                {
                    // Tìm đúng giường mà sinh viên này đang nằm
                    var oldBed = oldRoom.Beds.FirstOrDefault(b => b.AssignedStudentId == studentIdStr);

                    if (oldBed != null)
                    {
                        oldBed.IsAvailable = true;       // Giường trống trở lại
                        oldBed.AssignedStudentId = null; // Xóa thông tin sinh viên cũ
                        _logger.LogInformation($"[RabbitMQ] Phòng cũ {data.FromRoomId}: Giường [{oldBed.BedName}] đã được giải phóng.");
                    }
                    else
                    {
                        _logger.LogWarning($"[RabbitMQ] Không tìm thấy giường nào đang gán cho sinh viên {studentIdStr} ở phòng cũ {data.FromRoomId}.");
                    }
                }
            }

            // 2. XỬ LÝ PHÒNG MỚI: Tìm giường trống để GÁN CHO SINH VIÊN
            var newRoom = await _context.Rooms
                .Include(r => r.Beds)
                .FirstOrDefaultAsync(r => r.Id == data.ToRoomId);

            if (newRoom != null && newRoom.Beds != null)
            {
                // Tìm chiếc giường đầu tiên đang còn trống
                var emptyBed = newRoom.Beds.FirstOrDefault(b => b.IsAvailable == true);

                if (emptyBed != null)
                {
                    emptyBed.IsAvailable = false;                  // Đánh dấu đã có người
                    emptyBed.AssignedStudentId = studentIdStr;     // Đút ID sinh viên vào giường mới
                    _logger.LogInformation($"[RabbitMQ] Phòng mới {data.ToRoomId}: Đã xếp sinh viên vào giường [{emptyBed.BedName}].");
                }
                else
                {
                    _logger.LogWarning($"[RabbitMQ] Cảnh báo: Phòng mới {data.ToRoomId} đã hết giường trống!");
                }
            }

            // 3. Lưu toàn bộ thay đổi trạng thái Giường xuống Database của RoomBuildingService
            await _context.SaveChangesAsync();
            _logger.LogInformation($"[RabbitMQ] Đã cập nhật trạng thái giường lên Database thành công!");
        }
    }
}