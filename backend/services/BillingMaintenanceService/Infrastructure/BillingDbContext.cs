using System;
using Microsoft.EntityFrameworkCore;
using BillingMaintenanceService.Domain;

namespace BillingMaintenanceService.Infrastructure
{
    public class BillingDbContext : DbContext
    {
        public BillingDbContext(DbContextOptions<BillingDbContext> options) : base(options)
        {
        }

        public DbSet<Bill> Bills { get; set; }
        public DbSet<MaintenanceRequest> MaintenanceRequests { get; set; }

        // Hàm này chạy một lần duy nhất lúc tạo Database để bơm dữ liệu mẫu vào
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // 1. Dữ liệu mẫu cho HÓA ĐƠN
            modelBuilder.Entity<Bill>().HasData(
                new Bill
                {
                    Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
                    ElectricityCost = 450000,
                    WaterCost = 120000,
                    TotalAmount = 570000,
                    IsPaid = true // Đã thanh toán
                },
                new Bill
                {
                    Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
                    ElectricityCost = 500000,
                    WaterCost = 150000,
                    TotalAmount = 650000,
                    IsPaid = false // Chưa thanh toán
                }
            );

            // 2. Dữ liệu mẫu cho BẢO TRÌ (Báo hỏng)
            modelBuilder.Entity<MaintenanceRequest>().HasData(
                new MaintenanceRequest
                {
                    Id = Guid.Parse("33333333-3333-3333-3333-333333333333"),
                    RoomId = 101,
                    Description = "Hỏng điều hòa", // Mô tả hỏng hóc
                    Status = "Completed", // Đã sửa xong
                    CreatedAt = new DateTime(2026, 6, 10) // Báo hỏng 5 ngày trước
                },
                new MaintenanceRequest
                {
                    Id = Guid.Parse("44444444-4444-4444-4444-444444444444"),
                    RoomId = 205,
                    Description = "Rò rỉ nước", // Mô tả hỏng hóc
                    Status = "Pending", // Đang chờ xử lý
                    CreatedAt = new DateTime(2026, 6, 15) // Vừa mới báo hỏng
                }
            );
        }
    }
}