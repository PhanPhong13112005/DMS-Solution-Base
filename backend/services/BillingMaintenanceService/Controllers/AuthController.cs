using Microsoft.AspNetCore.Mvc;
using BillingMaintenanceService.Application;

namespace BillingMaintenanceService.Controllers
{
    [ApiController]
    [Route("api/v1/auth")]
    public class AuthController : ControllerBase
    {
        private readonly AuthAppService _authService;

        public AuthController(AuthAppService authService)
        {
            _authService = authService;
        }

        public class LoginRequest
        {
            public string Username { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest req)
        {
            var (token, user, error) = _authService.Login(req.Username, req.Password);
            
            if (error != null)
            {
                return Unauthorized(new { IsSuccess = false, Message = error });
            }

            return Ok(new
            {
                IsSuccess = true,
                Message = "Đăng nhập thành công!",
                Data = new
                {
                    Token = token,
                    Username = user!.Username,
                    Role = user.Role,
                    ReferenceId = user.ReferenceId
                }
            });
        }
    }
}
