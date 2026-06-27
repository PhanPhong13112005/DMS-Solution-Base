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
                
                string currentMonth = DateTime.Now.ToString("MM/yyyy");
                
                // Lấy tất cả hóa đơn hiện có để tìm danh sách các phòng
                var allBills = billingService.GetAllBills();
                var uniqueRooms = allBills.Select(b => b.RoomId).Distinct().ToList();

                int createdCount = 0;

                foreach (var roomId in uniqueRooms)
                {
                    // Kiểm tra xem phòng này đã có hóa đơn trong tháng hiện tại chưa
                    bool hasBillThisMonth = allBills.Any(b => b.RoomId == roomId && b.TargetMonth == currentMonth);
                    
                    if (!hasBillThisMonth)
                    {
                        // Chưa có -> Tạo hóa đơn tự động
                        var newBill = new Bill
                        {
                            RoomId = roomId,
                            StudentId = 0,
                            ContractId = "AUTO-GEN",
                            Title = $"Phí lưu trú tự động tháng {currentMonth}",
                            TargetMonth = currentMonth,
                            ElectricityCost = 0,
                            WaterCost = 0,
                            ServiceFee = 620000 // Giả lập tiền phòng mặc định
                        };
                        
                        billingService.CreateBill(newBill);
                        createdCount++;
                    }
                }

                if (createdCount > 0)
                {
                    _logger.LogInformation("Đã tự động phát hành {Count} hóa đơn cho tháng {Month}.", createdCount, currentMonth);
                }
            }
        }
    }
}
