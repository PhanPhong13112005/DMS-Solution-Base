using Microsoft.EntityFrameworkCore;
using RoomBuildingService.Data;
using System.Text.Json.Serialization;
using MassTransit; // 🔥 THÊM MỚI: Thư viện MassTransit
using RoomBuildingService.Consumers; // 🔥 THÊM MỚI: Namespace chứa Consumer của bạn

var builder = WebApplication.CreateBuilder(args);

// Khởi tạo kết nối Database
builder.Services.AddDbContext<RoomDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Cấu hình Controller và chặn vòng lặp JSON
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
});

// ====================================================================================
// 🔥 THÊM MỚI: CẤU HÌNH MASSTRANSIT & RABBITMQ CHO ROOM BUILDING SERVICE
// ====================================================================================
builder.Services.AddMassTransit(x =>
{
    // 1. Đăng ký bộ lắng nghe (Consumer) xử lý logic map giường
    x.AddConsumer<RoomTransferApprovedConsumer>();

    x.UsingRabbitMq((context, cfg) =>
    {
        // Cấu hình thông tin kết nối tới RabbitMQ Server đang chạy cục bộ
        cfg.Host("localhost", "/", h =>
        {
            h.Username("guest");
            h.Password("guest");
        });

        // 2. Tạo một cái Queue tên là 'room-transfer-approved-queue' trên RabbitMQ để hứng tin
        cfg.ReceiveEndpoint("room-transfer-approved-queue", e =>
        {
            // Chỉ định Consumer nào sẽ xử lý tin nhắn đi vào Queue này
            e.ConfigureConsumer<RoomTransferApprovedConsumer>(context);
        });
    });
});
// ====================================================================================

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowWebUI", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Kích hoạt bộ sinh tài liệu Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Mở giao diện Swagger UI khi chạy dưới quyền Development
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowWebUI");
app.UseAuthorization();
app.MapControllers();

app.Run();