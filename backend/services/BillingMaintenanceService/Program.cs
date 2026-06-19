using Microsoft.EntityFrameworkCore;
using BillingMaintenanceService.Infrastructure;
using BillingMaintenanceService.Application;

var builder = WebApplication.CreateBuilder(args);

// ==============================================================================
// VÙNG 1: ĐĂNG KÝ CÁC DỊCH VỤ (Bắt buộc nằm trước builder.Build)
// ==============================================================================

builder.Services.AddControllers();

// 1. Cấu hình kết nối SQL Server cho DbContext của Nhóm 3
builder.Services.AddDbContext<BillingDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// 2. ĐĂNG KÝ PHÂN TẦNG THEO ĐÚNG SƠ ĐỒ KIẾN TRÚC C4 MODEL COMPONENT
builder.Services.AddScoped<BillingMaintenanceRepository>();
builder.Services.AddScoped<BillingAppService>();
builder.Services.AddScoped<MaintenanceAppService>();

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

var app = builder.Build();

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

app.UseHttpsRedirection();

app.UseCors("AllowFrontend");

app.UseAuthorization();

app.MapControllers();

app.Run();