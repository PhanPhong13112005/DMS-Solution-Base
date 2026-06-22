var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseDefaultFiles(); // Tự động tìm và chạy file index.html
app.UseStaticFiles();  // Cho phép trình duyệt đọc CSS, JS, Hình ảnh trong wwwroot

app.UseAuthorization();

app.MapControllers();

app.Run();