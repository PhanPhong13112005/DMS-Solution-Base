namespace DMS.Shared
{
    public interface IRoomTransferApprovedEvent
    {
        Guid RequestId { get; }
        Guid StudentId { get; }
        int FromRoomId { get; }
        int ToRoomId { get; }
        decimal FromRoomPrice { get; }  // Thêm giá phòng cũ
        decimal ToRoomPrice { get; }    // Thêm giá phòng mới
        string FromRoomNumber { get; }  // Thêm số phòng cũ (để ghi hóa đơn nếu cần)
        string ToRoomNumber { get; }
    }
}