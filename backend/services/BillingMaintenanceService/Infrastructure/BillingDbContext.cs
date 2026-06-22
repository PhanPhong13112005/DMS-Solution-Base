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
        public DbSet<User> Users { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ============================================================
            // 1. Cấu hình kiểu dữ liệu chính xác cho cột decimal
            // ============================================================
            modelBuilder.Entity<Bill>(entity =>
            {
                entity.Property(b => b.ElectricityCost).HasColumnType("decimal(18,2)");
                entity.Property(b => b.WaterCost).HasColumnType("decimal(18,2)");
                entity.Property(b => b.ServiceFee).HasColumnType("decimal(18,2)");
                entity.Property(b => b.TotalAmount).HasColumnType("decimal(18,2)");
            });

            // ============================================================
            // 2. Dữ liệu mẫu cho HÓA ĐƠN (Bills)
            // ============================================================
            modelBuilder.Entity<Bill>().HasData(
                new Bill
                {
                    Id              = Guid.Parse("11111111-1111-1111-1111-111111111111"),
                    RoomId          = 101,
                    StudentId       = 1001,
                    ContractId      = "CTR-001",
                    Title           = "Hóa đơn tháng 06/2026 - Phòng 101",
                    TargetMonth     = "06/2026",
                    ElectricityCost = 450000,
                    WaterCost       = 120000,
                    ServiceFee      = 50000,
                    TotalAmount     = 620000,
                    IsPaid          = true,
                    CreatedAt       = new DateTime(2026, 6, 1),
                    PaidAt          = new DateTime(2026, 6, 5)
                },
                new Bill
                {
                    Id              = Guid.Parse("22222222-2222-2222-2222-222222222222"),
                    RoomId          = 205,
                    StudentId       = 1002,
                    ContractId      = "CTR-002",
                    Title           = "Hóa đơn tháng 06/2026 - Phòng 205",
                    TargetMonth     = "06/2026",
                    ElectricityCost = 500000,
                    WaterCost       = 150000,
                    ServiceFee      = 50000,
                    TotalAmount     = 700000,
                    IsPaid          = false,
                    CreatedAt       = new DateTime(2026, 6, 1),
                    PaidAt          = null
                }
            );

            // ============================================================
            // 3. Dữ liệu mẫu cho BẢO TRÌ (MaintenanceRequests)
            // ============================================================
            modelBuilder.Entity<MaintenanceRequest>().HasData(
                new MaintenanceRequest
                {
                    Id          = Guid.Parse("33333333-3333-3333-3333-333333333333"),
                    RoomId      = 101,
                    Title       = "Hỏng điều hòa",
                    Description = "Điều hòa không lạnh, phát ra tiếng ồn lớn, chảy nước",
                    Category    = MaintenanceCategory.Electricity,
                    Priority    = MaintenancePriority.Normal,
                    Status      = MaintenanceStatus.Completed,
                    CreatedAt   = new DateTime(2026, 6, 10),
                    UpdatedAt   = new DateTime(2026, 6, 12)
                },
                new MaintenanceRequest
                {
                    Id          = Guid.Parse("44444444-4444-4444-4444-444444444444"),
                    RoomId      = 205,
                    Title       = "Rò rỉ đường ống nước",
                    Description = "Ống nước dưới bồn rửa mặt bị nứt, nước chảy ra sàn nhà vệ sinh",
                    Category    = MaintenanceCategory.Water,
                    Priority    = MaintenancePriority.Critical,
                    Status      = MaintenanceStatus.Pending,
                    CreatedAt   = new DateTime(2026, 6, 18),
                    UpdatedAt   = null
                }
            );

            // ============================================================
            // 4. Dữ liệu mẫu cho NGƯỜI DÙNG (Users) - Mật khẩu mặc định: 123456
            // Hash Bcrypt của "123456" là "$2a$11$K.eA15gXoD825z6Yg6A8U.H4iF4V4WwJ1F95O9v.r3p101m4e3j8O"
            // ============================================================
            var defaultPasswordHash = "$2a$11$K.eA15gXoD825z6Yg6A8U.H4iF4V4WwJ1F95O9v.r3p101m4e3j8O";
            modelBuilder.Entity<User>().HasData(
                new User
                {
                    Id           = Guid.Parse("55555555-5555-5555-5555-555555555555"),
                    Username     = "admin",
                    PasswordHash = defaultPasswordHash,
                    Role         = AuthRoles.Admin,
                    ReferenceId  = null
                },
                new User
                {
                    Id           = Guid.Parse("66666666-6666-6666-6666-666666666666"),
                    Username     = "staff",
                    PasswordHash = defaultPasswordHash,
                    Role         = AuthRoles.Staff,
                    ReferenceId  = null
                },
                new User
                {
                    Id           = Guid.Parse("77777777-7777-7777-7777-777777777777"),
                    Username     = "student1001",
                    PasswordHash = defaultPasswordHash,
                    Role         = AuthRoles.Student,
                    ReferenceId  = 1001 // Trỏ về StudentId = 1001
                }
            );
        }
    }
}
