using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MassTransit;
using DMS.Shared;
using System.Threading.Tasks;

namespace BillingMaintenanceService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InvoiceController : ControllerBase
    {
        private readonly BillingDbContext _dbContext;
        private readonly IPublishEndpoint _publishEndpoint; // Inject MassTransit để phát sự kiện

        public InvoiceController(BillingDbContext dbContext, IPublishEndpoint publishEndpoint)
        {
            _dbContext = dbContext;
            _publishEndpoint = publishEndpoint;
        }

        // API: POST /api/invoice/{id}/pay
        [HttpPost("{id}/pay")]
        public async Task<IActionResult> PayInvoice(int id)
        {
            var invoice = await _dbContext.Invoices.FindAsync(id);
            if (invoice == null)
            {
                return NotFound(new { message = "Không tìm thấy hóa đơn này!" });
            }

            if (invoice.Status == "Paid")
            {
                return BadRequest(new { message = "Hóa đơn này đã được thanh toán trước đó rồi." });
            }

            // 1. Cập nhật trạng thái hóa đơn thành đã thanh toán
            invoice.Status = "Paid";
            await _dbContext.SaveChangesAsync();

            Console.WriteLine($"[Billing] Hóa đơn số {id} đã được thanh toán thành công.");

            // 2. Bắn sự kiện lên RabbitMQ để báo cho dịch vụ Hợp đồng
            await _publishEndpoint.Publish<IInvoicePaidEvent>(new
            {
                ContractId = invoice.ContractId,
                StudentId = invoice.StudentId,
                Amount = invoice.Amount
            });

            Console.WriteLine($"[Billing] Đã phát sự kiện IInvoicePaidEvent cho Hợp đồng số: {invoice.ContractId}");

            return Ok(new { message = $"Thanh toán thành công hóa đơn số {id}. Đã gửi lệnh kích hoạt hợp đồng!" });
        }
    }
}