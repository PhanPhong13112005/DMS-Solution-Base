using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using RoomBuildingService.Data;
using RoomBuildingService.Models;

namespace RoomBuildingService.Services
{
    public class RoomService : IRoomService
    {
        private readonly RoomDbContext _context;

        public RoomService(RoomDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Room>> GetAllRoomsAsync()
        {
            return await _context.Rooms.Include(r => r.Building).ToListAsync();
        }

        public async Task<Room?> GetRoomByIdAsync(int id)
        {
            return await _context.Rooms
                .Include(r => r.Building)
                .Include(r => r.Beds)
                .Include(r => r.RoomAmenities)
                .FirstOrDefaultAsync(r => r.Id == id); // Đã sửa RoomId thành Id
        }

        // Đã sửa: Tìm phòng trống dựa trên GenderRestriction của Tòa nhà
        public async Task<IEnumerable<Room>> GetAvailableRoomsByGenderAsync(string gender)
        {
            return await _context.Rooms
                .Include(r => r.Building)
                .Include(r => r.Beds)
                .Where(r => r.Building != null &&
                            r.Building.GenderRestriction == gender &&
                            r.Beds != null &&
                            r.Beds.Any(b => b.IsAvailable == true))
                .ToListAsync();
        }

        // Đã sửa: studentId chuyển sang kiểu string để khớp với DB
        public async Task<bool> UpdateBedStatusAsync(int bedId, bool isAvailable, string? studentId)
        {
            var bed = await _context.Beds.FindAsync(bedId);
            if (bed == null) return false;

            bed.IsAvailable = isAvailable;
            bed.AssignedStudentId = studentId;

            await _context.SaveChangesAsync();
            return true;
        }
    }
}