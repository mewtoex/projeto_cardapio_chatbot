using System.Collections.Generic; 
using CardapioDigital.Api.Models; 

namespace CardapioDigital.Api.Services.Interfaces
{
    public interface ISecurityService
    {
        string HashPassword(string password);
        bool VerifyPassword(string password, string hashedPassword);
        string GenerateJwtToken(User user);
    }
}