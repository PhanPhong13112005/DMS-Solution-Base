using Microsoft.EntityFrameworkCore;

using StudentContractService.Models; // Đã cập nhật đường dẫn Models
using System; // Thêm thư viện này để dùng được Guid và DateTime


namespace StudentContractService.Data // Đã cập nhật sang folder Data
{
    public class StudentDbContext : DbContext
    {
        public StudentDbContext(DbContextOptions<StudentDbContext> options) : base(options)
        {
        }

        public DbSet<Student> Students { get; set; }
        public DbSet<RoomTransferRequest> RoomTransferRequests { get; set; }
        public DbSet<Contract> Contracts { get; set; }
        public DbSet<Room> Rooms { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Cấu hình không cho trùng mã sinh viên
            modelBuilder.Entity<Student>()
                .HasIndex(s => s.StudentCode)
                .IsUnique();

            // Cấu hình kiểu dữ liệu tiền tệ cho giá phòng
            modelBuilder.Entity<Contract>()
                .Property(c => c.RoomPrice)
                .HasColumnType("decimal(18,2)");

            // =================================================================
            // ĐOẠN THÊM MỚI: TẠO DỮ LIỆU MẪU (SEED DATA) ĐỂ TEST API
            // =================================================================

            // 1. Tạo 1 ID cố định cho sinh viên Nguyễn Văn A
            var sampleStudentId = Guid.Parse("11111111-1111-1111-1111-111111111111");

            modelBuilder.Entity<Student>().HasData(new Student
            {
                Id = sampleStudentId,
                StudentCode = "SV202601",
                FullName = "Nguyễn Văn A",
                IdCard = "012345678901",
                PhoneNumber = "0987654321",
                Email = "vana@student.edu.vn",
                CurrentRoomId = 102 // Đang ở phòng 102
            });

            // 2. Tạo 1 hợp đồng đang kích hoạt (Active) cho sinh viên này
            modelBuilder.Entity<Contract>().HasData(new Contract
            {
                Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
                StudentId = sampleStudentId,
                RoomId = 102,
                StartDate = new DateTime(2026, 1, 1),
                EndDate = new DateTime(2026, 6, 30),
                RoomPrice = 1500000,
                Status = "Active"
            });
        }
    }
}