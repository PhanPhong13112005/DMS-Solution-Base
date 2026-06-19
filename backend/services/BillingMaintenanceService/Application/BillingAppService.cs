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

        public List<Bill> GetAllBills() => _repo.GetAllBills();
        public Bill GetBillById(Guid id) => _repo.GetBillById(id);

        public Bill CreateBill(Bill newBill)
        {
            newBill.Id = Guid.NewGuid();
            // Xử lý logic nghiệp vụ tự động tính tổng tiền điện nước
            newBill.TotalAmount = newBill.ElectricityCost + newBill.WaterCost;

            _repo.AddBill(newBill);
            return newBill;
        }

        public Bill PayBill(Guid id)
        {
            var bill = _repo.GetBillById(id);
            if (bill == null) return null;

            bill.IsPaid = true;
            _repo.UpdateBill(bill);
            return bill;
        }

        public bool DeleteBill(Guid id)
        {
            var bill = _repo.GetBillById(id);
            if (bill == null) return false;

            _repo.DeleteBill(bill);
            return true;
        }
    }
}