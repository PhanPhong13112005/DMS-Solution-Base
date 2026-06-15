using System.Collections.Generic;
using System.Threading.Tasks;
using RoomBuildingService.Models;

namespace RoomBuildingService.Services
{
    public interface IRoomService
    {
        Task<IEnumerable<Room>> GetAllRoomsAsync();

        Task<Room?> GetRoomByIdAsync(int id);

        Task<IEnumerable<Room>> GetAvailableRoomsByGenderAsync(string gender);

        // Đã sửa int? thành string? cho khớp với Database
        Task<bool> UpdateBedStatusAsync(int bedId, bool isAvailable, string? studentId);
    }
}