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
        public List<Bill> GetBillsByType(string billType)     => _repo.GetBillsByType(billType);
        public List<Bill> GetBillsDueSoon(int days = 3)       => _repo.GetBillsDueSoon(days);

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

        // --- Tạo hóa đơn tháng mới (MONTHLY) ---
        public Bill CreateBill(Bill newBill)
        {
            newBill.Id        = Guid.NewGuid();
            newBill.CreatedAt = DateTime.Now;
            newBill.IsPaid    = false;
            newBill.PaidAt    = null;
            newBill.BillType  = BillTypes.Monthly;
            newBill.DueDate   = newBill.DueDate ?? DateTime.Now.AddDays(15); // Hạn mặc định 15 ngày

            // Tự động tính tổng (điện + nước + dịch vụ)
            newBill.TotalAmount = newBill.ElectricityCost + newBill.WaterCost + newBill.ServiceFee;

            _repo.AddBill(newBill);
            return newBill;
        }

        // --- Tạo hóa đơn phát sinh lẻ (EXTRA_FEE) ---
        /// <summary>Cán bộ tạo hóa đơn phát sinh: tiền phạt, đền bù tài sản, làm lại chìa khóa...</summary>
        public Bill CreateExtraFeeBill(int roomId, int studentId, string reason, string description, decimal amount)
        {
            // Validate lý do thu
            if (!ExtraFeeReasons.All.Contains(reason))
                reason = ExtraFeeReasons.Other;

            var bill = new Bill
            {
                Id          = Guid.NewGuid(),
                RoomId      = roomId,
                StudentId   = studentId,
                BillType    = BillTypes.ExtraFee,
                FeeReason   = reason,
                Title       = $"Phí phát sinh - {reason}",
                TargetMonth = "Lẻ phát sinh",
                ExtraAmount = amount,
                // Các khoản phí tháng = 0 (đây là HD phát sinh)
                ElectricityCost = 0,
                WaterCost       = 0,
                ServiceFee      = 0,
                TotalAmount = amount,
                DueDate     = DateTime.Now.AddDays(7), // Hạn 7 ngày kể từ ngày lập
                IsPaid      = false,
                PaidAt      = null,
                CreatedAt   = DateTime.Now,
                ContractId  = string.Empty
            };

            _repo.AddBill(bill);
            return bill;
        }

        // --- Thanh toán hóa đơn (sinh mã biên lai tự động) ---
        public Bill? PayBill(Guid id)
        {
            var bill = _repo.GetBillById(id);
            if (bill == null) return null;
            if (bill.IsPaid) return bill; // Đã thanh toán rồi, không làm gì

            bill.IsPaid = true;
            bill.PaidAt = DateTime.Now;

            // Sinh mã biên lai tự động: BR-YYYYMMDD-{8 ký tự đầu của GUID}
            bill.ReceiptCode = $"BR-{DateTime.Now:yyyyMMdd}-{id.ToString("N")[..8].ToUpper()}";

            _repo.UpdateBill(bill);
            return bill;
        }

        // --- Sinh viên báo cáo đã thanh toán (chờ xác thực) ---
        public Bill? StudentPayBill(Guid id)
        {
            var bill = _repo.GetBillById(id);
            if (bill == null) return null;
            if (bill.IsPaid) return bill;

            bill.ReceiptCode = "PENDING_VERIFICATION";
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
