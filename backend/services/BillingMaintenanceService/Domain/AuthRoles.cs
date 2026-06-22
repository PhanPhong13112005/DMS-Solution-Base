namespace BillingMaintenanceService.Domain
{
    public static class AuthRoles
    {
        public const string Admin   = "Admin";     // Quản lý KTX (Toàn quyền N1, N2, N3)
        public const string Staff   = "Staff";     // Nhân viên KTX (Xử lý hợp đồng, hóa đơn, bảo trì)
        public const string Student = "Student";   // Sinh viên thuê phòng
        
        public static readonly string[] All = { Admin, Staff, Student };
    }
}
