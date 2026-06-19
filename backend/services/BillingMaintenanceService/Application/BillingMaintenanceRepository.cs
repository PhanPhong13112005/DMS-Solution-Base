using BillingMaintenanceService.Domain;

namespace BillingMaintenanceService.Infrastructure
{
    public class BillingMaintenanceRepository
    {
        private readonly BillingDbContext _context;

        public BillingMaintenanceRepository(BillingDbContext context)
        {
            _context = context;
        }

        // --- NHÓM HÀM XỬ LÝ HÓA ĐƠN (BILLS) ---
        public List<Bill> GetAllBills() => _context.Bills.ToList();
        public Bill GetBillById(Guid id) => _context.Bills.Find(id);
        public void AddBill(Bill bill) { _context.Bills.Add(bill); _context.SaveChanges(); }
        public void UpdateBill(Bill bill) { _context.Bills.Update(bill); _context.SaveChanges(); }
        public void DeleteBill(Bill bill) { _context.Bills.Remove(bill); _context.SaveChanges(); }

        // --- NHÓM HÀM XỬ LÝ BẢO TRÌ (MAINTENANCE) ---
        public List<MaintenanceRequest> GetAllRequests() => _context.MaintenanceRequests.ToList();
        public MaintenanceRequest GetRequestById(Guid id) => _context.MaintenanceRequests.Find(id);
        public void AddRequest(MaintenanceRequest request) { _context.MaintenanceRequests.Add(request); _context.SaveChanges(); }
        public void UpdateRequest(MaintenanceRequest request) { _context.MaintenanceRequests.Update(request); _context.SaveChanges(); }
        public void DeleteRequest(MaintenanceRequest request) { _context.MaintenanceRequests.Remove(request); _context.SaveChanges(); }
    }
}