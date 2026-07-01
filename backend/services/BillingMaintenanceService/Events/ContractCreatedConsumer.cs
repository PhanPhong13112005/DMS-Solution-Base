using System;
using System.Threading.Tasks;
using MassTransit;
using BillingMaintenanceService.Application;
using BillingMaintenanceService.Domain;
using Microsoft.Extensions.Logging;

namespace BillingMaintenanceService.Events
{
    /// <summary>
    /// Lắng nghe sự kiện ContractCreatedEvent từ RabbitMQ.
    /// Khi có Hợp đồng mới được tạo bên Nhóm 2, tự động sinh Hóa đơn tiền phòng tháng đầu tiên.
    /// </summary>
    public class ContractCreatedConsumer : IConsumer<DMS.Shared.IContractApprovedEvent>
    {
        private readonly BillingAppService _billingService;
        private readonly ILogger<ContractCreatedConsumer> _logger;

        public ContractCreatedConsumer(BillingAppService billingService, ILogger<ContractCreatedConsumer> logger)
        {
            _billingService = billingService;
            _logger = logger;
        }

        public Task Consume(ConsumeContext<DMS.Shared.IContractApprovedEvent> context)
        {
            var data = context.Message;
            _logger.LogInformation("Nhận được sự kiện ContractApproved cho Hợp đồng: {ContractId}", data.ContractId);

            int studentId = 0;
            int.TryParse(data.StudentId, out studentId);

            // Tự động tạo hóa đơn tiền phòng tháng đầu tiên
            var newBill = new Bill
            {
                RoomId          = data.RoomId,
                StudentId       = studentId,
                ContractId      = data.ContractId.ToString(),
                Title           = data.Content, // "Hóa đơn tiền phòng cho hợp đồng mới..."
                TargetMonth     = data.StartDate.ToString("MM/yyyy"),
                ServiceFee      = data.Amount, // Tiền phòng theo hợp đồng
                ElectricityCost = 0, // Tháng đầu chưa tính điện nước
                WaterCost       = 0
            };

            _billingService.CreateBill(newBill);

            _logger.LogInformation("Đã tự động tạo hóa đơn thành công cho sinh viên {StudentId}", data.StudentId);
            return Task.CompletedTask;
        }
    }
}
