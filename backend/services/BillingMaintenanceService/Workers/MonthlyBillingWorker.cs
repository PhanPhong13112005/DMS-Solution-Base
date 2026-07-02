using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using BillingMaintenanceService.Application;
using BillingMaintenanceService.Domain;

namespace BillingMaintenanceService.Workers
{
    public class MonthlyBillingWorker : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<MonthlyBillingWorker> _logger;

        public MonthlyBillingWorker(IServiceProvider serviceProvider, ILogger<MonthlyBillingWorker> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("MonthlyBillingWorker khởi động. Sẽ chạy định kỳ mỗi 1 phút để sinh hóa đơn (Mô phỏng).");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    GenerateBillsForCurrentMonth();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Lỗi khi chạy tiến trình sinh hóa đơn định kỳ.");
                }

                // Đợi 1 phút rồi chạy lại (Giả lập việc chạy hàng tháng)
                await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
            }
        }

        private void GenerateBillsForCurrentMonth()
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var billingService = scope.ServiceProvider.GetRequiredService<BillingAppService>();
                var repo = scope.ServiceProvider.GetRequiredService<BillingMaintenanceService.Infrastructure.BillingMaintenanceRepository>();
                
                string currentMonth = DateTime.Now.ToString("MM/yyyy");
                
                // Lấy các bản ghi điện nước đã được chốt nhưng chưa lên hóa đơn
                var unprocessedRecords = repo.GetUnprocessedUtilityRecords(currentMonth);

                int createdCount = 0;

                foreach (var record in unprocessedRecords)
                {
                    // Lấy tất cả hóa đơn của phòng này trong tháng (để tránh trùng lặp)
                    var existingBills = repo.GetBillsByRoomId(record.RoomId);
                    bool hasBillThisMonth = existingBills.Any(b => b.TargetMonth == currentMonth && b.BillType == BillTypes.Monthly);
                    
                    if (!hasBillThisMonth)
                    {
                        // Tạo hóa đơn tự động với chỉ số đã chốt
                        decimal elecCost = record.ElectricityIndex * 3500;
                        decimal waterCost = record.WaterIndex * 20000;

                        var newBill = new Bill
                        {
                            RoomId = record.RoomId,
                            StudentId = 0, // Sẽ được cập nhật chính xác nếu liên kết với Contract
                            ContractId = "AUTO-GEN",
                            Title = $"Phí lưu trú và điện nước tháng {currentMonth} - Phòng {record.RoomId}",
                            TargetMonth = currentMonth,
                            ElectricityCost = elecCost,
                            WaterCost = waterCost,
                            ServiceFee = 50000 // Giả lập tiền dịch vụ/rác
                        };
                        
                        billingService.CreateBill(newBill);
                        createdCount++;
                    }

                    // Đánh dấu là đã xử lý
                    record.IsProcessed = true;
                    repo.UpdateUtilityRecord(record);
                }

                if (createdCount > 0)
                {
                    _logger.LogInformation("Đã tự động phát hành {Count} hóa đơn cho tháng {Month} từ các chỉ số điện nước đã chốt.", createdCount, currentMonth);
                }
            }
        }
    }
}
