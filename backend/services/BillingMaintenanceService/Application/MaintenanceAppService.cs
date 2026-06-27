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
        public List<MaintenanceRequest> GetByStudentId(int studentId) => _repo.GetByStudentId(studentId);

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

        // --- Thống kê hiệu suất bộ phận kỹ thuật (Admin) ---
        /// <summary>
        /// Trả về các chỉ số thống kê hiệu suất xử lý sự cố của bộ phận kỹ thuật.
        /// Dùng cho dashboard Admin: tỷ lệ giải quyết, thời gian xử lý trung bình...
        /// </summary>
        public object GetMaintenanceStats()
        {
            var all        = _repo.GetAllRequests();
            var pending    = all.Count(r => r.Status == MaintenanceStatus.Pending);
            var processing = all.Count(r => r.Status == MaintenanceStatus.Processing);
            var completed  = all.Count(r => r.Status == MaintenanceStatus.Completed);
            var critical   = all.Count(r => r.Priority == MaintenancePriority.Critical);

            // Tính thời gian xử lý trung bình (chỉ với request đã Completed và có UpdatedAt)
            var avgHours = all
                .Where(r => r.Status == MaintenanceStatus.Completed && r.UpdatedAt.HasValue)
                .Select(r => (r.UpdatedAt!.Value - r.CreatedAt).TotalHours)
                .DefaultIfEmpty(0)
                .Average();

            return new
            {
                TotalRequests      = all.Count,
                PendingCount       = pending,
                ProcessingCount    = processing,
                CompletedCount     = completed,
                CriticalCount      = critical,
                ResolutionRate     = all.Count > 0
                    ? Math.Round((double)completed / all.Count * 100, 1)
                    : 0.0,
                AvgResolutionHours = Math.Round(avgHours, 1),
                // Thống kê theo danh mục
                ByCategory = all
                    .GroupBy(r => r.Category)
                    .Select(g => new { Category = g.Key, Count = g.Count() })
                    .OrderByDescending(x => x.Count)
                    .ToList()
            };
        }
    }
}