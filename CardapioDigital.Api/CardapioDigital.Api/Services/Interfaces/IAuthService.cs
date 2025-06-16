using CardapioDigital.Api.DTOs.Auth;
using System.Threading.Tasks;

namespace CardapioDigital.Api.Services.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResponse> RegisterUserAsync(RegisterRequest request, string role = "client");
        Task<AuthResponse> LoginUserAsync(LoginRequest request);
    }
}