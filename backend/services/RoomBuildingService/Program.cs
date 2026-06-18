using Microsoft.EntityFrameworkCore;
using RoomBuildingService.Data;
using System.Text.Json.Serialization;
using MassTransit;

var builder = WebApplication.CreateBuilder(args);

// Khởi tạo kết nối Database
builder.Services.AddDbContext<RoomDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Cấu hình Controller và chặn vòng lặp JSON
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
});

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

builder.Services.AddMassTransit(x =>
{
    x.UsingRabbitMq((context, cfg) =>
    {
        // Cấu hình trỏ tới RabbitMQ đang chạy trên Docker của bạn
        cfg.Host("localhost", "/", h => {
            h.Username("guest");
            h.Password("guest");
        });
    });
});
// ĐĂNG KÝ SERVICE NẰM Ở ĐÂY (TRƯỚC LỆNH BUILD)
builder.Services.AddScoped<RoomBuildingService.Services.IRoomService, RoomBuildingService.Services.RoomService>();

var app = builder.Build(); // <-- Lệnh này phải nằm sau

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