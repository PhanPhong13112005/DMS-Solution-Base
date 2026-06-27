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