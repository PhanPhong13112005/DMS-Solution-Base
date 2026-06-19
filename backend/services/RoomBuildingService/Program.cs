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
    options.AddPolicy("AllowWebUI", policy =>
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
        cfg.Host("localhost", "/", h => {
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


app.UseCors("AllowWebUI");


app.UseDefaultFiles();
app.UseStaticFiles();

app.UseAuthorization();

app.MapControllers();

app.Run();