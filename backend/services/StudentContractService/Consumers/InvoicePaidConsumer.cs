using DMS.Shared;
using MassTransit;
using Microsoft.EntityFrameworkCore;
using StudentContractService.Data;
using System;
using System.Threading.Tasks;

namespace StudentContractService.Controllers
{
    public class InvoicePaidConsumer : IConsumer<IInvoicePaidEvent>
    {
        // Nhớ thay 'YourContractDbContext' thành DbContext thật của bên dự án Hợp đồng nhé
        private readonly ContractDbContext _contractDbContext;

        public InvoicePaidConsumer(ContractDbContext contractDbContext)
        {
            _contractDbContext = contractDbContext;
        }

        public async Task Consume(ConsumeContext<IInvoicePaidEvent> context)
        {
            var message = context.Message;
            Console.WriteLine($"[Contract] Nhận được tín hiệu: Hóa đơn của hợp đồng {message.ContractId} đã thanh toán.");

            // Tìm hợp đồng tương ứng trong database của bên Contract
            var contract = await _contractDbContext.Contracts.FindAsync(message.ContractId);
            if (contract != null)
            {
                // Thay đổi trạng thái hợp đồng thành chính thức hoạt động
                contract.Status = "Active";
                await _contractDbContext.SaveChangesAsync();

                Console.WriteLine($"[Contract] Hợp đồng số {message.ContractId} của sinh viên {message.StudentId} đã chính thức chuyển sang trạng thái ACTIVE!");
            }
            else
            {
                Console.WriteLine($"[Contract] Không tìm thấy hợp đồng số {message.ContractId} để kích hoạt.");
            }
        }
    }
}