using System;

namespace StudentContractService.Models
{
    // Đây là tin nhắn (Event) sẽ được bắn đi khi có hợp đồng mới
    public class ContractCreated
    {
        public Guid Id { get; set; }
        public Guid StudentId { get; set; }
        public int RoomId { get; set; }
        public decimal RoomPrice { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
    }
}