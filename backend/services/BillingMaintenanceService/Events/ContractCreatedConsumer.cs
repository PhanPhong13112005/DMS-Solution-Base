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
    public class ContractCreatedConsumer : IConsumer<ContractCreatedEvent>
    {
        private readonly BillingAppService _billingService;
        private readonly ILogger<ContractCreatedConsumer> _logger;

        public ContractCreatedConsumer(BillingAppService billingService, ILogger<ContractCreatedConsumer> logger)
        {
            _billingService = billingService;
            _logger = logger;
        }

        public Task Consume(ConsumeContext<ContractCreatedEvent> context)
        {
            var data = context.Message;
            _logger.LogInformation("Nhận được sự kiện ContractCreated cho Hợp đồng: {ContractId}", data.ContractId);

            // Tự động tạo hóa đơn tiền phòng tháng đầu tiên
            var newBill = new Bill
            {
                RoomId          = data.RoomId,
                StudentId       = data.StudentId,
                ContractId      = data.ContractId,
                Title           = $"Hóa đơn tiền phòng tháng {data.StartDate:MM/yyyy}",
                TargetMonth     = data.StartDate.ToString("MM/yyyy"),
                ServiceFee      = data.RoomPrice, // Tạm dùng ServiceFee làm Tiền phòng theo hợp đồng
                ElectricityCost = 0, // Tháng đầu chưa tính điện nước
                WaterCost       = 0
            };

            _billingService.CreateBill(newBill);

            _logger.LogInformation("Đã tự động tạo hóa đơn thành công cho sinh viên {StudentId}", data.StudentId);
            return Task.CompletedTask;
        }
    }
}
