namespace BillingMaintenanceService.Domain
{
    /// <summary>
    /// Các loại hóa đơn hợp lệ.
    /// </summary>
    public static class BillTypes
    {
        public const string Monthly  = "MONTHLY";   // Hóa đơn tháng (điện + nước + dịch vụ)
        public const string ExtraFee = "EXTRA_FEE"; // Hóa đơn phát sinh lẻ (phạt, đền bù...)

        public static readonly string[] All = { Monthly, ExtraFee };

        public static bool IsValid(string type) =>
            All.Contains(type, StringComparer.OrdinalIgnoreCase);
    }

    /// <summary>
    /// Các lý do thu phổ biến cho hóa đơn phát sinh lẻ.
    /// </summary>
    public static class ExtraFeeReasons
    {
        public const string Penalty    = "Phạt vi phạm";
        public const string Damage     = "Bồi thường tài sản hỏng";
        public const string LostKey    = "Làm lại thẻ/chìa khóa";
        public const string Parking    = "Phí giữ xe";
        public const string Other      = "Khác";

        public static readonly string[] All = { Penalty, Damage, LostKey, Parking, Other };
    }
}
