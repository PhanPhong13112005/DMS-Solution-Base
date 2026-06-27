using MassTransit;
using Microsoft.Extensions.Logging;
using StudentContractService.Data;
using System.Threading.Tasks;
using System.Linq;
using Microsoft.EntityFrameworkCore; // Thêm thư viện này để dùng các hàm Async nâng cao
using System;
using DMS.Shared;

namespace StudentContractService.Consumers
{
    public class InvoicePaidConsumer : IConsumer<IInvoicePaidEvent>
    {
        private readonly StudentDbContext _context;
        private readonly ILogger<InvoicePaidConsumer> _logger;

        public InvoicePaidConsumer(StudentDbContext context, ILogger<InvoicePaidConsumer> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task Consume(ConsumeContext<IInvoicePaidEvent> context)
        {
            var message = context.Message;
            _logger.LogInformation($"[RabbitMQ] Nhận được tin thanh toán hóa đơn. StudentId: {message.StudentId}, Số tiền: {message.Amount}");

            // 1. Chuyển đổi StudentId từ kiểu string sang kiểu Guid để khớp với DB
            if (!Guid.TryParse(message.StudentId, out Guid studentGuid))
            {
                _logger.LogError($"[Error] StudentId gửi qua không đúng định dạng Guid: {message.StudentId}");
                return;
            }

            // 2. Tìm hợp đồng của sinh viên này đang ở trạng thái chờ kích hoạt (không phải Active)
            var contract = await _context.Contracts
                .Where(c => c.StudentId == studentGuid && c.Status != "Active")
                .OrderByDescending(c => c.StartDate) // Lấy hợp đồng mới nhất nếu có nhiều hơn 1 cái
                .FirstOrDefaultAsync();

            // 3. Tiến hành kích hoạt hợp đồng
            if (contract != null)
            {
                contract.Status = "Active";
                await _context.SaveChangesAsync();

                _logger.LogInformation($"[Success] Hợp đồng ID {contract.Id} của sinh viên {message.StudentId} đã được KÍCH HOẠT thành công!");
            }
            else
            {
                _logger.LogWarning($"[Warning] Không tìm thấy hợp đồng nào đang chờ xử lý cho sinh viên: {message.StudentId}");
            }
        }
    }
}