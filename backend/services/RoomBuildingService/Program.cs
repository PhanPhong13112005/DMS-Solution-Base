using Microsoft.EntityFrameworkCore;
using RoomBuildingService.Data;
using System.Text.Json.Serialization;
using MassTransit;

var builder = WebApplication.CreateBuilder(args);

// 1. Khởi tạo kết nối Database
builder.Services.AddDbContext<RoomDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// 2. Cấu hình Controller và chặn vòng lặp JSON (tránh lỗi khi lấy dữ liệu quan hệ)
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
});

// 3. Cấu hình CORS: Cho phép Frontend (React/Vite) gọi API
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        // Cho phép mọi nguồn (hoặc thay bằng "http://localhost:5173" để bảo mật hơn)
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// 4. Các dịch vụ khác
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddMassTransit(x =>
{
    x.UsingRabbitMq((context, cfg) =>
    {
        var rabbitHost = builder.Configuration["RabbitMQ:Host"] ?? "rabbitmq";
        cfg.Host(rabbitHost, "/", h => {
            h.Username("guest");
            h.Password("guest");
        });
    });
});

builder.Services.AddScoped<RoomBuildingService.Services.IRoomService, RoomBuildingService.Services.RoomService>();

var app = builder.Build();

// ====================================================
// CẤU HÌNH PIPELINE (Thứ tự rất quan trọng)
// ====================================================

// Mở giao diện Swagger UI khi chạy dưới quyền Development
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();


app.UseCors("AllowAll");


app.UseDefaultFiles();
app.UseStaticFiles();

app.UseAuthorization();

app.MapControllers();

// ==========================================
// TỰ ĐỘNG TẠO DB & THÊM DỮ LIỆU MẪU (SEED DATA)
// ==========================================
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<RoomDbContext>();
    db.Database.EnsureCreated();
    if (!db.Buildings.Any())
    {
        var toaA = new RoomBuildingService.Models.Building { Name = "Tòa A", GenderRestriction = "Nam", TotalFloors = 5 };
        var toaB = new RoomBuildingService.Models.Building { Name = "Tòa B", GenderRestriction = "Nam", TotalFloors = 5 };
        var toaC = new RoomBuildingService.Models.Building { Name = "Tòa C", GenderRestriction = "Nữ", TotalFloors = 5 };
        db.Buildings.AddRange(toaA, toaB, toaC);
        db.SaveChanges();

        var r1 = new RoomBuildingService.Models.Room { BuildingId = toaB.Id, RoomNumber = "101", FloorNumber = 1, RoomType = "Standard", MonthlyPrice = 1200000, Status = "Còn chỗ" };
        var r2 = new RoomBuildingService.Models.Room { BuildingId = toaA.Id, RoomNumber = "A102", FloorNumber = 1, RoomType = "Standard", MonthlyPrice = 1200000, Status = "Còn chỗ" };
        var r3 = new RoomBuildingService.Models.Room { BuildingId = toaB.Id, RoomNumber = "B103", FloorNumber = 1, RoomType = "Standard", MonthlyPrice = 1200000, Status = "Còn chỗ" };
        var r4 = new RoomBuildingService.Models.Room { BuildingId = toaA.Id, RoomNumber = "A104", FloorNumber = 1, RoomType = "Standard", MonthlyPrice = 1200000, Status = "Hết chỗ" };
        var r5 = new RoomBuildingService.Models.Room { BuildingId = toaC.Id, RoomNumber = "C105", FloorNumber = 1, RoomType = "Standard", MonthlyPrice = 800000, Status = "Hết chỗ" };
        var r6 = new RoomBuildingService.Models.Room { BuildingId = toaA.Id, RoomNumber = "A106", FloorNumber = 1, RoomType = "Standard", MonthlyPrice = 1200000, Status = "Còn chỗ" };
        var r7 = new RoomBuildingService.Models.Room { BuildingId = toaC.Id, RoomNumber = "C107", FloorNumber = 1, RoomType = "Standard", MonthlyPrice = 800000, Status = "Còn chỗ" };
        var r8 = new RoomBuildingService.Models.Room { BuildingId = toaA.Id, RoomNumber = "A108", FloorNumber = 1, RoomType = "Standard", MonthlyPrice = 500000, Status = "Còn chỗ" };
        var r9 = new RoomBuildingService.Models.Room { BuildingId = toaB.Id, RoomNumber = "B101", FloorNumber = 1, RoomType = "Standard", MonthlyPrice = 500000, Status = "Còn chỗ" };
        
        db.Rooms.AddRange(r1, r2, r3, r4, r5, r6, r7, r8, r9);
        db.SaveChanges();

        // 101 - Cap 2, Occ 1 (Nguyễn Hữu Hưng)
        db.Beds.AddRange(
            new RoomBuildingService.Models.Bed { RoomId = r1.Id, BedName = "Giường 1", IsAvailable = false, AssignedStudentId = "1771020536" },
            new RoomBuildingService.Models.Bed { RoomId = r1.Id, BedName = "Giường 2", IsAvailable = true }
        );
        // A102 - Cap 2, Occ 0
        db.Beds.AddRange(
            new RoomBuildingService.Models.Bed { RoomId = r2.Id, BedName = "Giường 1", IsAvailable = true },
            new RoomBuildingService.Models.Bed { RoomId = r2.Id, BedName = "Giường 2", IsAvailable = true }
        );
        // B103 - Cap 2, Occ 0
        db.Beds.AddRange(
            new RoomBuildingService.Models.Bed { RoomId = r3.Id, BedName = "Giường 1", IsAvailable = true },
            new RoomBuildingService.Models.Bed { RoomId = r3.Id, BedName = "Giường 2", IsAvailable = true }
        );
        // A104 - Cap 2, Occ 2
        db.Beds.AddRange(
            new RoomBuildingService.Models.Bed { RoomId = r4.Id, BedName = "Giường 1", IsAvailable = false, AssignedStudentId = "SV001" },
            new RoomBuildingService.Models.Bed { RoomId = r4.Id, BedName = "Giường 2", IsAvailable = false, AssignedStudentId = "SV002" }
        );
        // C105 - Cap 4, Occ 4
        db.Beds.AddRange(
            new RoomBuildingService.Models.Bed { RoomId = r5.Id, BedName = "Giường 1", IsAvailable = false, AssignedStudentId = "SV003" },
            new RoomBuildingService.Models.Bed { RoomId = r5.Id, BedName = "Giường 2", IsAvailable = false, AssignedStudentId = "SV004" },
            new RoomBuildingService.Models.Bed { RoomId = r5.Id, BedName = "Giường 3", IsAvailable = false, AssignedStudentId = "SV005" },
            new RoomBuildingService.Models.Bed { RoomId = r5.Id, BedName = "Giường 4", IsAvailable = false, AssignedStudentId = "SV006" }
        );
        // A106 - Cap 2, Occ 1
        db.Beds.AddRange(
            new RoomBuildingService.Models.Bed { RoomId = r6.Id, BedName = "Giường 1", IsAvailable = false, AssignedStudentId = "SV007" },
            new RoomBuildingService.Models.Bed { RoomId = r6.Id, BedName = "Giường 2", IsAvailable = true }
        );
        // C107 - Cap 4, Occ 1
        db.Beds.AddRange(
            new RoomBuildingService.Models.Bed { RoomId = r7.Id, BedName = "Giường 1", IsAvailable = false, AssignedStudentId = "SV008" },
            new RoomBuildingService.Models.Bed { RoomId = r7.Id, BedName = "Giường 2", IsAvailable = true },
            new RoomBuildingService.Models.Bed { RoomId = r7.Id, BedName = "Giường 3", IsAvailable = true },
            new RoomBuildingService.Models.Bed { RoomId = r7.Id, BedName = "Giường 4", IsAvailable = true }
        );
        // A108 - Cap 6, Occ 3
        for(int i=1; i<=6; i++) {
            db.Beds.Add(new RoomBuildingService.Models.Bed { RoomId = r8.Id, BedName = $"Giường {i}", IsAvailable = i > 3, AssignedStudentId = i <= 3 ? $"SV00{8+i}" : null });
        }
        // B101 - Cap 6, Occ 3
        for(int i=1; i<=6; i++) {
            db.Beds.Add(new RoomBuildingService.Models.Bed { RoomId = r9.Id, BedName = $"Giường {i}", IsAvailable = i > 3, AssignedStudentId = i <= 3 ? $"SV01{1+i}" : null });
        }
        
        db.SaveChanges();
    }
}

app.Run();