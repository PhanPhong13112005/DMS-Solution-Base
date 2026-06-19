using BillingMaintenanceService.Domain;
using BillingMaintenanceService.Infrastructure;

namespace BillingMaintenanceService.Application
{
    public class MaintenanceAppService
    {
        private readonly BillingMaintenanceRepository _repo;

        public MaintenanceAppService(BillingMaintenanceRepository repo)
        {
            _repo = repo;
        }

        public List<MaintenanceRequest> GetAllRequests() => _repo.GetAllRequests();
        public MaintenanceRequest GetRequestById(Guid id) => _repo.GetRequestById(id);

        public MaintenanceRequest CreateRequest(MaintenanceRequest newRequest)
        {
            newRequest.Id = Guid.NewGuid();
            newRequest.CreatedAt = DateTime.Now;
            newRequest.Status = "Pending"; // Mặc định chờ xử lý

            _repo.AddRequest(newRequest);
            return newRequest;
        }

        public MaintenanceRequest UpdateStatus(Guid id, string newStatus)
        {
            var request = _repo.GetRequestById(id);
            if (request == null) return null;

            request.Status = newStatus;
            _repo.UpdateRequest(request);
            return request;
        }

        public bool DeleteRequest(Guid id)
        {
            var request = _repo.GetRequestById(id);
            if (request == null) return false;

            _repo.DeleteRequest(request);
            return true;
        }
    }
}