using DMS.Shared; // Dùng chung Interface sự kiện
using MassTransit;
using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

// 👇 SỬA LẠI ĐÚNG NAMESPACE CỦA DỰ ÁN BILLING 👇
namespace BillingMaintenanceService
{
    public class ContractApprovedConsumer : IConsumer<IContractApprovedEvent>
    {
        // 1. Inject DbContext của dịch vụ Billing vào đây
        private readonly BillingDbContext _dbContext;

        public ContractApprovedConsumer(BillingDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task Consume(ConsumeContext<IContractApprovedEvent> context)
        {
            var message = context.Message;

            Console.WriteLine($"[Billing] Đã nhận được sự kiện duyệt hợp đồng số: {message.ContractId}");

            // 2. Tạo đối tượng hóa đơn mới từ dữ liệu sự kiện nhận được
            var newInvoice = new Invoice
            {
                ContractId = message.ContractId,
                StudentId = message.StudentId,
                Amount = message.PricePerMonth * 6, // Ví dụ tính tổng tiền = Giá 1 tháng * 6 tháng
                Status = "Unpaid",
                CreatedAt = DateTime.UtcNow
            };

            // 3. Lưu thực tế xuống Database SQL Server
            _dbContext.Invoices.Add(newInvoice);
            await _dbContext.SaveChangesAsync();

            Console.WriteLine($"[Billing] Đã LƯU DATABASE hóa đơn thành công cho sinh viên: {message.StudentId} - Số tiền: {newInvoice.Amount:N0}đ");
        }
    }
}