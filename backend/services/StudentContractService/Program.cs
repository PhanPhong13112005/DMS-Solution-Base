using MassTransit;
using Microsoft.EntityFrameworkCore;
using StudentContractService.Controllers;
using StudentContractService.Data;
using StudentContractService.Services;


var builder = WebApplication.CreateBuilder(args);

// 1. Cấu hình kết nối SQL Server (ContractDB)
builder.Services.AddDbContext<ContractDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// 2. Cấu hình Client để gọi đồng bộ qua API Gateway (Cổng 5000)
builder.Services.AddHttpClient<RoomServiceClient>(client =>
{
    client.BaseAddress = new Uri("http://localhost:5000");
});

// 3. Tích hợp MassTransit kết nối với Message Broker RabbitMQ của hệ thống
// 3. Tích hợp MassTransit kết nối với Message Broker RabbitMQ của hệ thống
builder.Services.AddMassTransit(x =>
{
    // Đăng ký Consumer nhận sự kiện thanh toán hóa đơn
    x.AddConsumer<InvoicePaidConsumer>();

    // Cấu hình kết nối tới RabbitMQ (CHỈ GIỮ LẠI 1 KHỐI NÀY DUY NHẤT)
    x.UsingRabbitMq((context, cfg) =>
    {
        cfg.Host("localhost", "/");
        cfg.ConfigureEndpoints(context);
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthorization();
app.MapControllers();

// Khởi chạy chính xác trên port 8081 dành cho Nhóm 2
app.Run("http://localhost:8081");