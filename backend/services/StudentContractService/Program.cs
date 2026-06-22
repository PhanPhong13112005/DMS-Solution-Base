using MassTransit;
using Microsoft.EntityFrameworkCore;
using StudentContractService.Data;
using Scalar.AspNetCore; // Khai báo thư viện giao diện mới

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi(); // Sinh dữ liệu API gốc

// Đăng ký HttpClient gọi sang Nhóm 1
builder.Services.AddHttpClient("RoomServiceClient", client =>
{
    // Tên container của Nhóm 1 (sau này đổi lại cho đúng nếu ghép code)
    client.BaseAddress = new Uri("http://localhost:8080");
});

// Đăng ký Database
builder.Services.AddDbContext<StudentDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("StudentDBConnection")));

// Đăng ký MassTransit & RabbitMQ
builder.Services.AddMassTransit(x =>
{
    x.UsingRabbitMq((context, cfg) =>
    {
        // QUAN TRỌNG: Đổi "localhost" thành "rabbitmq" (tên container trong file yaml)
        cfg.Host("rabbitmq", "/", h =>
        {
            h.Username("guest");
            h.Password("guest");
        });
    });
});

var app = builder.Build();

// Tự động áp dụng kịch bản tạo bảng (CÓ CƠ CHẾ CHỜ SQL SERVER KHỞI ĐỘNG)
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<StudentDbContext>();

    int maxRetry = 5;
    for (int retry = 1; retry <= maxRetry; retry++)
    {
        try
        {
            Console.WriteLine($"Đang thử kết nối SQL Server (Lần {retry}/{maxRetry})...");
            db.Database.Migrate();
            Console.WriteLine("Kết nối và tạo bảng SQL Server thành công tuyệt đối!");
            break; // Thành công thì thoát vòng lặp ngay
        }
        catch (Exception ex)
        {
            Console.WriteLine($"SQL chưa sẵn sàng: {ex.Message}. Đang chờ 3 giây để thử lại...");
            System.Threading.Thread.Sleep(3000); // Đứng đợi 3 giây
        }
    }
}

// Bật giao diện API
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference(); // Bật giao diện Web xịn xò của Scalar
}

// ĐÃ BỎ: app.UseHttpsRedirection(); -> Để không bị lỗi trình duyệt khi chạy HTTP

app.UseAuthorization();
app.MapControllers();
app.Run();