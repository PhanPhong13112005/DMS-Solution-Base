using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DMS.Shared
{
    public interface IInvoicePaidEvent
    {
        int ContractId { get; }
        string StudentId { get; }
        decimal Amount { get; }
    }
}
