namespace StudentContractService.DTOs
{
    public class CreateStudentDto
    {
        public string StudentCode { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string CitizenId { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string University { get; set; } = string.Empty;
    }
}