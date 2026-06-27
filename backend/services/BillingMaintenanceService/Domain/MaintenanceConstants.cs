namespace BillingMaintenanceService.Domain
{
    /// <summary>
    /// Các giá trị trạng thái hợp lệ cho MaintenanceRequest.
    /// Dùng class static để validate thay vì enum, tránh lỗi khi nhận dữ liệu từ API.
    /// </summary>
    public static class MaintenanceStatus
    {
        public const string Pending    = "Pending";     // Chờ xử lý
        public const string Processing = "Processing";  // Đang xử lý
        public const string Completed  = "Completed";   // Đã hoàn tất

        public static readonly string[] All = { Pending, Processing, Completed };

        public static bool IsValid(string status) =>
            All.Contains(status, StringComparer.OrdinalIgnoreCase);
    }

    /// <summary>
    /// Các danh mục sự cố hợp lệ.
    /// </summary>
    public static class MaintenanceCategory
    {
        public const string Electricity = "Điện";
        public const string Water       = "Nước";
        public const string Equipment   = "Thiết bị";
        public const string Other       = "Khác";

        public static readonly string[] All = { Electricity, Water, Equipment, Other };
    }

    /// <summary>
    /// Mức độ ưu tiên xử lý sự cố.
    /// </summary>
    public static class MaintenancePriority
    {
        public const string Critical = "Critical";
        public const string Normal   = "Normal";

        public static readonly string[] All = { Critical, Normal };
    }
}
