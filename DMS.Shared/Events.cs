using System;

namespace DMS.Shared
{
    public interface IRoomTransferApprovedEvent
    {
        Guid RequestId { get; }
        Guid StudentId { get; }
        int FromRoomId { get; }
        int ToRoomId { get; }
        decimal FromRoomPrice { get; }
        decimal ToRoomPrice { get; }
    }

    public interface IContractApprovedEvent
    {
        int ContractId { get; }
        string StudentId { get; }
        int RoomId { get; }
        decimal Amount { get; }
        string Content { get; }
        DateTime StartDate { get; }
    }

    public interface IInvoicePaidEvent
    {
        string StudentId { get; }
        decimal Amount { get; }
    }
}
