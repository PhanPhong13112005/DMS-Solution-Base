using BillingMaintenanceService.Domain;
using Microsoft.EntityFrameworkCore;

namespace BillingMaintenanceService.Infrastructure
{
    public class BillingMaintenanceRepository
    {
        private readonly BillingDbContext _context;

        public BillingMaintenanceRepository(BillingDbContext context)
        {
            _context = context;
        }

        // =====================================================================
        // HÓA ĐƠN (BILLS)
        // =====================================================================
        public List<Bill> GetAllBills()             => _context.Bills.OrderByDescending(b => b.CreatedAt).ToList();
        public Bill? GetBillById(Guid id)           => _context.Bills.Find(id);
        public List<Bill> GetBillsByRoomId(int roomId)       => _context.Bills.Where(b => b.RoomId == roomId).OrderByDescending(b => b.CreatedAt).ToList();
        public List<Bill> GetBillsByStudentId(int studentId) => _context.Bills.Where(b => b.StudentId == studentId).OrderByDescending(b => b.CreatedAt).ToList();
        public List<Bill> GetUnpaidBills()           => _context.Bills.Where(b => !b.IsPaid).OrderBy(b => b.CreatedAt).ToList();
        public List<Bill> GetBillsByType(string billType)    => _context.Bills.Where(b => b.BillType == billType).OrderByDescending(b => b.CreatedAt).ToList();

        /// <summary>Lấy hóa đơn chưa thanh toán và sắp đến hạn trong N ngày tới</summary>
        public List<Bill> GetBillsDueSoon(int daysThreshold = 3) =>
            _context.Bills
                .Where(b => !b.IsPaid
                         && b.DueDate.HasValue
                         && b.DueDate.Value <= DateTime.Now.AddDays(daysThreshold)
                         && b.DueDate.Value >= DateTime.Now)
                .OrderBy(b => b.DueDate).ToList();

        public void AddBill(Bill bill)    { _context.Bills.Add(bill);    _context.SaveChanges(); }
        public void UpdateBill(Bill bill) { _context.Bills.Update(bill); _context.SaveChanges(); }
        public void DeleteBill(Bill bill) { _context.Bills.Remove(bill); _context.SaveChanges(); }

        // =====================================================================
        // UTILITIES (ĐIỆN NƯỚC)
        // =====================================================================
        public void AddUtilityRecord(UtilityRecord record) { _context.UtilityRecords.Add(record); _context.SaveChanges(); }
        public void UpdateUtilityRecord(UtilityRecord record) { _context.UtilityRecords.Update(record); _context.SaveChanges(); }
        
        /// <summary>Lấy danh sách các bản ghi chưa được tạo hóa đơn</summary>
        public List<UtilityRecord> GetUnprocessedUtilityRecords(string targetMonth) =>
            _context.UtilityRecords.Where(u => u.TargetMonth == targetMonth && !u.IsProcessed).ToList();

        /// <summary>Lấy toàn bộ bản ghi điện nước của 1 tháng để hiển thị</summary>
        public List<UtilityRecord> GetUtilityRecordsByMonth(string targetMonth) =>
            _context.UtilityRecords.Where(u => u.TargetMonth == targetMonth).ToList();

        // =====================================================================
        // BẢO TRÌ (MAINTENANCE)
        // =====================================================================
        public List<MaintenanceRequest> GetAllRequests()            => _context.MaintenanceRequests.OrderByDescending(m => m.CreatedAt).ToList();
        public MaintenanceRequest? GetRequestById(Guid id)          => _context.MaintenanceRequests.Find(id);
        public List<MaintenanceRequest> GetByRoomId(int roomId)     => _context.MaintenanceRequests.Where(m => m.RoomId == roomId).OrderByDescending(m => m.CreatedAt).ToList();
        public List<MaintenanceRequest> GetPendingRequests()        => _context.MaintenanceRequests.Where(m => m.Status == MaintenanceStatus.Pending).OrderBy(m => m.CreatedAt).ToList();
        public List<MaintenanceRequest> GetByCategory(string cat)   => _context.MaintenanceRequests.Where(m => m.Category == cat).OrderByDescending(m => m.CreatedAt).ToList();
        public List<MaintenanceRequest> GetByStudentId(int studentId) => _context.MaintenanceRequests.Where(m => m.StudentId == studentId).OrderByDescending(m => m.CreatedAt).ToList();

        public void AddRequest(MaintenanceRequest request)    { _context.MaintenanceRequests.Add(request);    _context.SaveChanges(); }
        public void UpdateRequest(MaintenanceRequest request) { _context.MaintenanceRequests.Update(request); _context.SaveChanges(); }
        public void DeleteRequest(MaintenanceRequest request) { _context.MaintenanceRequests.Remove(request); _context.SaveChanges(); }
    }
}
