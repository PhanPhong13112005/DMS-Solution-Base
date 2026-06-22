using Microsoft.EntityFrameworkCore;
using StudentContractService.Models;

namespace StudentContractService.Data
{
    public class StudentDbContext : DbContext
    {
        public StudentDbContext(DbContextOptions<StudentDbContext> options) : base(options)
        {
        }

        public DbSet<Student> Students { get; set; }
        public DbSet<RoomContract> RoomContracts { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Xử lý cảnh báo kiểu decimal cho giá tiền thuê phòng
            modelBuilder.Entity<RoomContract>()
                .Property(r => r.MonthlyPrice)
                .HasColumnType("decimal(18,2)");
        }
    }
}