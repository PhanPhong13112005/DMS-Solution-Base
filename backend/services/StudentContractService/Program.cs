using MassTransit;
using Microsoft.EntityFrameworkCore;
using StudentContractService.Consumers;
using StudentContractService.Controllers;
using StudentContractService.Data;
using StudentContractService.Services;


var builder = WebApplication.CreateBuilder(args);



// 2. Cấu hình Client để gọi đồng bộ qua API Gateway (Cổng 5000)
builder.Services.AddHttpClient<RoomServiceClient>(client =>
{
    var gatewayHost = builder.Configuration["Gateway:BaseUrl"] ?? "http://gateway:5000";
    client.BaseAddress = new Uri(gatewayHost);
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
        var rabbitHost = builder.Configuration["RabbitMQ:Host"] ?? "rabbitmq";
        cfg.Host(rabbitHost, "/", h => {
            h.Username("guest");
            h.Password("guest");
        });
        cfg.ConfigureEndpoints(context);
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddDbContext<StudentDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
var app = builder.Build();

// TỰ ĐỘNG APPLY MIGRATION LÚC KHỞI ĐỘNG
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<StudentDbContext>();
    db.Database.Migrate();
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthorization();
app.MapControllers();

// Khởi chạy chính xác trên port 8081 dành cho Nhóm 2
app.Run("http://localhost:8081");