namespace BillingMaintenanceService.Domain
{
    public class User
    {
        public Guid Id { get; set; }
        
        public string Username { get; set; } = string.Empty;
        
        // Mật khẩu mã hóa BCrypt
        public string PasswordHash { get; set; } = string.Empty;
        
        // Vai trò: Admin, Staff, Student
        public string Role { get; set; } = string.Empty;
        
        // Tham chiếu: null nếu là Admin/Staff. Nếu là Sinh viên thì chứa StudentId (để Nhóm 2 map)
        public int? ReferenceId { get; set; }
    }
}
