using CardapioDigital.Api.Data; 
using CardapioDigital.Api.DTOs.Auth;
using CardapioDigital.Api.Models;
using CardapioDigital.Api.Repositories.Interfaces;
using CardapioDigital.Api.Services.Interfaces;
using System;
using System.Threading.Tasks;

namespace CardapioDigital.Api.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly ISecurityService _securityService;
        private readonly ApplicationDbContext _context; 

        public AuthService(IUserRepository userRepository, ISecurityService securityService, ApplicationDbContext context)
        {
            _userRepository = userRepository;
            _securityService = securityService;
            _context = context;   
        }

        public async Task<AuthResponse> RegisterUserAsync(RegisterRequest request, string role = "client")
        {

            var existingUserByUsername = await _userRepository.GetByUsernameAsync(request.Username);
            if (existingUserByUsername != null)
            {
                throw new ApplicationException("Nome de usuário já existe."); // Usar exceções customizadas depois
            }

            var existingUserByEmail = await _userRepository.GetByEmailAsync(request.Email);
            if (existingUserByEmail != null)
            {
                throw new ApplicationException("E-mail já existe."); // Usar exceções customizadas depois
            }

            // Criar novo usuário
            var newUser = new User
            {
                Username = request.Username,
                Email = request.Email,
                PasswordHash = _securityService.HashPassword(request.Password), 
                IsAdmin = false,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _userRepository.AddAsync(newUser);
            await _userRepository.SaveChangesAsync(); 

            var token = _securityService.GenerateJwtToken(newUser);

            return new AuthResponse
            {
                UserId = newUser.Id,
                Username = newUser.Username,
                Email = newUser.Email,
                IsAdmin = newUser.IsAdmin,
                Token = token
            };
        }

        public async Task<AuthResponse> LoginUserAsync(LoginRequest request)
        {
            User user = null;

            if (request.UsernameOrEmail.Contains("@")) 
            {
                user = await _userRepository.GetByEmailAsync(request.UsernameOrEmail);
            }
            else
            {
                user = await _userRepository.GetByUsernameAsync(request.UsernameOrEmail);
            }

            if (user == null || !_securityService.VerifyPassword(request.Password, user.PasswordHash))
            {
                throw new ApplicationException("Credenciais inválidas."); // Usar exceções customizadas depois
            }

            var token = _securityService.GenerateJwtToken(user);

            return new AuthResponse
            {
                UserId = user.Id,
                Username = user.Username,
                Email = user.Email,
                IsAdmin = user.IsAdmin,
                Token = token
            };
        }
    }
}