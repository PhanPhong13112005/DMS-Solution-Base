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

        // --- Truy vấn ---
        public List<MaintenanceRequest> GetAllRequests()              => _repo.GetAllRequests();
        public MaintenanceRequest? GetRequestById(Guid id)            => _repo.GetRequestById(id);
        public List<MaintenanceRequest> GetByRoomId(int roomId)       => _repo.GetByRoomId(roomId);
        public List<MaintenanceRequest> GetPendingRequests()          => _repo.GetPendingRequests();
        public List<MaintenanceRequest> GetByCategory(string cat)     => _repo.GetByCategory(cat);

        // --- Tạo yêu cầu mới ---
        public MaintenanceRequest CreateRequest(MaintenanceRequest newRequest)
        {
            newRequest.Id        = Guid.NewGuid();
            newRequest.CreatedAt = DateTime.Now;
            newRequest.UpdatedAt = null;
            newRequest.Status    = MaintenanceStatus.Pending; // Mặc định chờ xử lý

            // Đảm bảo Priority hợp lệ, nếu không gán mặc định
            if (!MaintenancePriority.All.Contains(newRequest.Priority))
                newRequest.Priority = MaintenancePriority.Normal;

            // Đảm bảo Category hợp lệ
            if (!MaintenanceCategory.All.Contains(newRequest.Category))
                newRequest.Category = MaintenanceCategory.Other;

            _repo.AddRequest(newRequest);
            return newRequest;
        }

        // --- Cập nhật trạng thái ---
        public MaintenanceRequest? UpdateStatus(Guid id, string newStatus)
        {
            var request = _repo.GetRequestById(id);
            if (request == null) return null;

            // Validate trạng thái bằng class Constant
            if (!MaintenanceStatus.IsValid(newStatus))
                throw new ArgumentException("Trạng thái không hợp lệ!");

            request.Status    = newStatus;
            request.UpdatedAt = DateTime.Now;
            
            _repo.UpdateRequest(request);
            return request;
        }

        // --- Xóa yêu cầu ---
        public bool DeleteRequest(Guid id)
        {
            var request = _repo.GetRequestById(id);
            if (request == null) return false;

            _repo.DeleteRequest(request);
            return true;
        }
    }
}