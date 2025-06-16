using BCrypt.Net; 
using Microsoft.Extensions.Configuration; 
using Microsoft.IdentityModel.Tokens;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using CardapioDigital.Api.Models; 
using CardapioDigital.Api.Services.Interfaces;

namespace CardapioDigital.Api.Services
{
    public class SecurityService : ISecurityService
    {
        private readonly IConfiguration _configuration;
        private readonly string _jwtSecret;
        private readonly string _jwtIssuer;
        private readonly string _jwtAudience;

        public SecurityService(IConfiguration configuration)
        {
            _configuration = configuration;
            _jwtSecret = _configuration["Jwt:Key"];
            _jwtIssuer = _configuration["Jwt:Issuer"];
            _jwtAudience = _configuration["Jwt:Audience"];

            if (string.IsNullOrEmpty(_jwtSecret) || string.IsNullOrEmpty(_jwtIssuer) || string.IsNullOrEmpty(_jwtAudience))
            {
                throw new ArgumentNullException("As configurações JWT (Key, Issuer, Audience) não podem ser nulas ou vazias. Verifique o appsettings.json.");
            }
        }

        public string HashPassword(string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password);
        }

        public bool VerifyPassword(string password, string hashedPassword)
        {
            return BCrypt.Net.BCrypt.Verify(password, hashedPassword);
        }

        public string GenerateJwtToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_jwtSecret);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.IsAdmin ? "Admin" : "User")

            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddHours(24), 
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature),
                Issuer = _jwtIssuer,
                Audience = _jwtAudience
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}