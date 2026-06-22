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
using Microsoft.EntityFrameworkCore;
using BillingMaintenanceService.Infrastructure;
using BillingMaintenanceService.Application;
using BillingMaintenanceService.Events;
using MassTransit;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// ==============================================================================
// VÙNG 1: ĐĂNG KÝ CÁC DỊCH VỤ (Bắt buộc nằm trước builder.Build)
// ==============================================================================

builder.Services.AddControllers();

// 1. Cấu hình kết nối SQL Server cho DbContext của Nhóm 3
builder.Services.AddDbContext<BillingDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// 4. TIÊM DEPENDENCY INJECTION
builder.Services.AddScoped<BillingMaintenanceRepository>();
builder.Services.AddScoped<BillingAppService>();
builder.Services.AddScoped<MaintenanceAppService>();

// Thêm Hosted Service để sinh hóa đơn ngầm
builder.Services.AddHostedService<BillingMaintenanceService.Workers.MonthlyBillingWorker>();
builder.Services.AddScoped<AuthAppService>();

// 3. Kích hoạt bộ sinh tài liệu Swagger UI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 4. Cấu hình CORS cho phép Frontend (VueJS) kết nối thoải mái
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// 5. CẤU HÌNH RABBITMQ (Nhận sự kiện ContractCreatedEvent từ Nhóm 2)
// TẠM THỜI COMMENT ĐỂ CHẠY LOCAL KHÔNG LỖI RABBITMQ
/*
builder.Services.AddMassTransit(x =>
{
    // Đăng ký Consumer
    x.AddConsumer<ContractCreatedConsumer>();

    x.UsingRabbitMq((context, cfg) =>
    {
        cfg.Host(builder.Configuration["RabbitMQ:Host"], "/", h => {
            h.Username(builder.Configuration["RabbitMQ:Username"]);
            h.Password(builder.Configuration["RabbitMQ:Password"]);
        });

        cfg.ReceiveEndpoint("billing-contract-created-queue", e =>
        {
            e.ConfigureConsumer<ContractCreatedConsumer>(context);
        });
    });
});
*/

// 6. CẤU HÌNH JWT AUTHENTICATION
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
        };
    });
builder.Services.AddAuthorization();


var app = builder.Build();

// TỰ ĐỘNG TẠO DATABASE VÀ SEED DATA NẾU CHƯA CÓ
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<BillingDbContext>();
    db.Database.EnsureCreated();
}

// ==============================================================================
// VÙNG 2: CẤU HÌNH ĐƯỜNG ĐI (Middleware - Bắt buộc nằm sau builder.Build)
// ==============================================================================

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "DMS Billing API v1");
        c.RoutePrefix = "swagger";
    });
}

// app.UseHttpsRedirection(); // Tắt tạm HTTPS Redirection để tránh lỗi CORS/SSL khi Frontend gọi API ở môi trường local

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
