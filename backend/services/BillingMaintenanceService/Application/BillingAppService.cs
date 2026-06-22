using BillingMaintenanceService.Domain;
using BillingMaintenanceService.Infrastructure;

namespace BillingMaintenanceService.Application
{
    public class BillingAppService
    {
        private readonly BillingMaintenanceRepository _repo;

        public BillingAppService(BillingMaintenanceRepository repo)
        {
            _repo = repo;
        }

        // --- Truy vấn ---
        public List<Bill> GetAllBills()                        => _repo.GetAllBills();
        public Bill? GetBillById(Guid id)                     => _repo.GetBillById(id);
        public List<Bill> GetByRoomId(int roomId)             => _repo.GetBillsByRoomId(roomId);
        public List<Bill> GetByStudentId(int studentId)       => _repo.GetBillsByStudentId(studentId);
        public List<Bill> GetUnpaidBills()                    => _repo.GetUnpaidBills();

        /// <summary>Thống kê doanh thu: tổng thu, đã thu, chưa thu</summary>
        public object GetRevenueStats()
        {
            var all     = _repo.GetAllBills();
            var paid    = all.Where(b => b.IsPaid).ToList();
            var unpaid  = all.Where(b => !b.IsPaid).ToList();
            return new
            {
                TotalBills       = all.Count,
                TotalRevenue     = all.Sum(b => b.TotalAmount),
                CollectedRevenue = paid.Sum(b => b.TotalAmount),
                PendingRevenue   = unpaid.Sum(b => b.TotalAmount),
                PaidCount        = paid.Count,
                UnpaidCount      = unpaid.Count
            };
        }

        // --- Tạo hóa đơn mới ---
        public Bill CreateBill(Bill newBill)
        {
            newBill.Id        = Guid.NewGuid();
            newBill.CreatedAt = DateTime.Now;
            newBill.IsPaid    = false;
            newBill.PaidAt    = null;
            // Tự động tính tổng (điện + nước + dịch vụ)
            newBill.TotalAmount = newBill.ElectricityCost + newBill.WaterCost + newBill.ServiceFee;

            _repo.AddBill(newBill);
            return newBill;
        }

        // --- Thanh toán hóa đơn ---
        public Bill? PayBill(Guid id)
        {
            var bill = _repo.GetBillById(id);
            if (bill == null) return null;
            if (bill.IsPaid) return bill; // Đã thanh toán rồi, không làm gì

            bill.IsPaid = true;
            bill.PaidAt = DateTime.Now;
            _repo.UpdateBill(bill);
            return bill;
        }

        // --- Xóa hóa đơn ---
        public bool DeleteBill(Guid id)
        {
            var bill = _repo.GetBillById(id);
            if (bill == null) return false;

            _repo.DeleteBill(bill);
            return true;
        }
    }
}