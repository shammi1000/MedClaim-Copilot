using Microsoft.AspNetCore.Mvc;
using MedClaimCopilot.API.Models;

namespace MedClaimCopilot.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public class AuthController : ControllerBase
    {
        private static readonly List<User> _users = new()
        {
            new User { Id = "USR-001", Name = "Dr. Sarah Mitchell", Email = "sarah.mitchell@medclaim.com", PasswordHash = "hashed_password", Role = UserRole.Admin, Department = "Claims Processing", Phone = "+1 (555) 234-5678", JoinDate = DateTime.Parse("2021-03-15") },
            new User { Id = "USR-002", Name = "Mark Johnson", Email = "mark.johnson@medclaim.com", PasswordHash = "hashed_password", Role = UserRole.Adjuster, Department = "Claims Review", Phone = "+1 (555) 345-6789", JoinDate = DateTime.Parse("2022-07-01") }
        };

        /// <summary>Login and receive JWT token</summary>
        [HttpPost("login")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public IActionResult Login([FromBody] LoginRequest req)
        {
            var user = _users.FirstOrDefault(u => u.Email.Equals(req.Email, StringComparison.OrdinalIgnoreCase));
            if (user == null || string.IsNullOrEmpty(req.Password))
                return Unauthorized(new { message = "Invalid credentials." });

            // In production: verify password hash
            var token = GenerateMockToken(user);
            return Ok(new { token, user = new { user.Id, user.Name, user.Email, user.Role, user.Department } });
        }

        /// <summary>Get current user profile</summary>
        [HttpGet("me")]
        [ProducesResponseType(typeof(User), StatusCodes.Status200OK)]
        public IActionResult GetMe()
        {
            var user = _users.First();
            return Ok(new { user.Id, user.Name, user.Email, user.Role, user.Department, user.Phone, user.JoinDate, user.Notifications });
        }

        private static string GenerateMockToken(User user)
        {
            return $"mock-jwt-{user.Id}-{DateTime.UtcNow.Ticks}";
        }
    }

    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
