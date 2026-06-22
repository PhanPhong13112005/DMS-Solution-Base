using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace DMS.Shared
{
    public interface IContractApprovedEvent
    {
        int ContractId { get; }
        string StudentId { get; }
        int RoomId { get; }
        decimal PricePerMonth { get; }
        DateTime StartDate { get; }
        DateTime EndDate { get; }
    }
}
