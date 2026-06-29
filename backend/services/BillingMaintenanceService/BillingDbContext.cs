using BillingMaintenanceService;
using Microsoft.EntityFrameworkCore;

public class BillingDbContext : DbContext
{
    public BillingDbContext(DbContextOptions<BillingDbContext> options) : base(options) { }
    public DbSet<Invoice> Invoices { get; set; }
    // Sau này bạn bổ sung các bảng (DbSet) như Invoice, Bill ở đây nhé
}