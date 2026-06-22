using MassTransit;
using BillingMaintenanceService;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// 1. Cấu hình MassTransit & RabbitMQ
builder.Services.AddMassTransit(x =>
{
    x.AddConsumer<ContractApprovedConsumer>();

    x.UsingRabbitMq((context, cfg) =>
    {
        cfg.Host("localhost", "/");
        cfg.ConfigureEndpoints(context);
    });
});

// 2. Cấu hình Kết nối Cơ sở dữ liệu SQL Server
builder.Services.AddDbContext<BillingDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// 3. Đăng ký các dịch vụ hệ thống cơ bản
builder.Services.AddControllers();
builder.Services.AddAuthorization();

// 👇 THÊM 2 DÒNG NÀY ĐỂ ĐĂNG KÝ SWAGGER VÀO HỆ THỐNG 👇
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Ép Console hiển thị đúng tiếng Việt UTF-8
Console.OutputEncoding = System.Text.Encoding.UTF8;

var app = builder.Build();

// 👇 THÊM ĐOẠN NÀY ĐỂ BẬT GIAO DIỆN SWAGGER KHI CHẠY DEVELOPMENT 👇
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(); // <-- Dòng này giúp giao diện Swagger hoạt động, hết lỗi 404!
}

app.UseAuthorization();
// Thay thế dòng app.MapControllers(); cũ bằng đoạn này:
try
{
    app.MapControllers();
}
catch (System.Reflection.ReflectionTypeLoadException ex)
{
    Console.WriteLine("====== 🚨 PHÁT HIỆN LỖI LIÊN KẾT THƯ VIỆN OÁI OĂM: ======");
    foreach (var loaderEx in ex.LoaderExceptions)
    {
        Console.WriteLine($"-> Chi tiết lỗi ngầm: {loaderEx?.Message}");
    }
    Console.WriteLine("=======================================================");
    throw;
}

app.Run();