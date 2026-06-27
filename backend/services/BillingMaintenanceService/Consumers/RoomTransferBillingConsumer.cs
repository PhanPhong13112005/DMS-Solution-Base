using MassTransit;
using DMS.Shared; // Namespace chứa interface IRoomTransferApprovedEvent của bạn
using Microsoft.Extensions.Logging;
using System.Threading.Tasks;

namespace BillingMaintenanceService.Consumers
{
    public class RoomTransferBillingConsumer : IConsumer<IRoomTransferApprovedEvent>
    {
        private readonly ILogger<RoomTransferBillingConsumer> _logger;
        private readonly BillingDbContext _context;

        public RoomTransferBillingConsumer(ILogger<RoomTransferBillingConsumer> logger, BillingDbContext context)
        {
            _logger = logger;
            _context = context;
        }

        public async Task Consume(ConsumeContext<IRoomTransferApprovedEvent> context)
        {
            var eventData = context.Message;

            _logger.LogInformation("[RabbitMQ - Billing] Nhận tín hiệu đổi phòng của SV: {StudentId}", eventData.StudentId);

            // 1. Lấy thẳng giá phòng từ Tin nhắn (Event) truyền sang để tính chênh lệch
            decimal priceDifference = eventData.ToRoomPrice - eventData.FromRoomPrice;

            _logger.LogInformation("[RabbitMQ - Billing] Chênh lệch giá phòng tính được: {Diff} VND", priceDifference);

            if (priceDifference > 0)
            {
                // 2. Tự động tạo một Hóa đơn (Invoice) thu thêm tiền chênh lệch
                var newInvoice = new Invoice
                {
                    StudentId = eventData.StudentId.ToString(), // ✅ FIX LỖI 1: Ép kiểu từ Guid sang string
                    Amount = priceDifference,
                    Status = "Unpaid", // Hoặc trạng thái mặc định của bạn
                    CreatedAt = System.DateTime.UtcNow

                    // ✅ FIX LỖI 2: Đã xóa dòng Description bị lỗi đỏ. 
                    // Nếu bảng Invoice của bạn có cột ghi chú tên là Note hoặc Content, bạn có thể mở ra dùng:
                    // Note = "Thu thêm tiền chênh lệch đổi phòng" 
                };

                _context.Invoices.Add(newInvoice);
                await _context.SaveChangesAsync();

                _logger.LogInformation("[RabbitMQ - Billing] Đã tự động tạo hóa đơn bổ sung {Amount} VND vào DB thành công!", priceDifference);
            }
            else
            {
                _logger.LogInformation("[RabbitMQ - Billing] Phòng mới bằng hoặc rẻ hơn phòng cũ, không phát sinh hóa đơn mới.");
            }
        }
    }
}