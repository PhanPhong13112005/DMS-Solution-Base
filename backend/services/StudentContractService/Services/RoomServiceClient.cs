using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using StudentContractService.DTOs;

namespace StudentContractService.Services
{
    public class RoomServiceClient
    {
        private readonly HttpClient _httpClient;

        public RoomServiceClient(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<bool> CheckRoomAvailableAsync(int roomId)
        {
            try
            {
                // Gọi qua API Gateway (Port 5000), Gateway sẽ tự định tuyến đến Nhóm 1
                var response = await _httpClient.GetAsync($"/api/g1/rooms/{roomId}/check");
                if (response.IsSuccessStatusCode)
                {
                    var result = await response.Content.ReadFromJsonAsync<RoomCheckResponse>();
                    return result != null && result.IsAvailable;
                }
                return false;
            }
            catch
            {
                // Nếu chưa bật Gateway, tạm trả về true để bạn test các logic nội bộ của Nhóm 2 trước
                return true;
            }
        }
    }
}