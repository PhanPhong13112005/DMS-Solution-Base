using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StudentContractService.Models
{
    public class BookingApplication
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public string FullName { get; set; }

        [Required]
        public string StudentId { get; set; } // MSSV

        public string ClassName { get; set; }

        public string Phone { get; set; }

        public string Email { get; set; }

        public int RoomId { get; set; }

        public string RoomNumber { get; set; }

        public string Building { get; set; }

        public string PaymentMethod { get; set; } = "direct"; // bank, e-wallet, direct

        public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }
    }
}
