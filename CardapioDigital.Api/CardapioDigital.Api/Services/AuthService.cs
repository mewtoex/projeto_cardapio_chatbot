using CardapioDigital.Api.Data;
using CardapioDigital.Api.DTOs.Auth;
using CardapioDigital.Api.Models;
using CardapioDigital.Api.Repositories.Interfaces;
using CardapioDigital.Api.Services.Interfaces;
using System;
using System.Threading.Tasks;
using CardapioDigital.Api.Exceptions;
using CardapioDigital.Api.DTOs.Auth.PasswordReset;

namespace CardapioDigital.Api.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IClientRepository _clientRepository; 
        private readonly ISecurityService _securityService;
        private readonly ApplicationDbContext _context;
        private readonly IEmailService _emailService; // NOVO: Injetar IEmailService

        public AuthService(IUserRepository userRepository, IClientRepository clientRepository, ISecurityService securityService, IEmailService emailService, ApplicationDbContext context) // NOVO: emailService
        {
            _userRepository = userRepository;
            _clientRepository = clientRepository; 
            _securityService = securityService;
            _context = context;
            _emailService = emailService;

        }

        public async Task<AuthResponse> RegisterUserAsync(RegisterRequest request, string role = "client")
        {

            var existingUserByUsername = await _userRepository.GetByUsernameAsync(request.Username);
            if (existingUserByUsername != null)
            {
                throw new ApplicationException("Nome de usuário já existe."); 
            }

            var existingUserByEmail = await _userRepository.GetByEmailAsync(request.Email);
            if (existingUserByEmail != null)
            {
                throw new ApplicationException("E-mail já existe."); 
            }

            if (await _clientRepository.GetByCPFAsync(request.ClientData.CPF) != null)
            {
                throw new BadRequestException("CPF já cadastrado.");
            }

            var newUser = new User
            {
                Username = request.Username,
                Email = request.Email,
                PasswordHash = _securityService.HashPassword(request.Password), 
                IsAdmin = false,
                Role = role,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            var newClient = new Client
            {
                FirstName = request.ClientData.FirstName,
                LastName = request.ClientData.LastName,
                CPF = request.ClientData.CPF,
                Telephone = request.ClientData.Telephone,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                User = newUser 
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
                throw new ApplicationException("Credenciais inválidas."); 
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
        public async Task RequestPasswordResetAsync(ForgotPasswordRequest request)
        {
            var user = await _userRepository.GetByEmailAsync(request.UsernameOrEmail);
            if (user == null)
            {
                user = await _userRepository.GetByUsernameAsync(request.UsernameOrEmail);
            }

            if (user == null)
            {
                Console.WriteLine($"Tentativa de reset de senha para usuário/email não encontrado: {request.UsernameOrEmail}");
                return;
            }

            var resetToken = Guid.NewGuid().ToString("N");
            user.PasswordResetToken = resetToken;
            user.PasswordResetTokenExpiresAt = DateTime.UtcNow.AddHours(1);

            _userRepository.Update(user);
            await _userRepository.SaveChangesAsync();

            var resetLink = $"https://seuapp.com/reset-password?token={resetToken}"; 
            var subject = "Redefinição de Senha para Cardápio Digital";
            var body = $"Olá {user.Username},<br/><br/>" +
                       $"Recebemos uma solicitação para redefinir a senha da sua conta.<br/>" +
                       $"Para redefinir sua senha, clique no link abaixo (válido por 1 hora):<br/><br/>" +
                       $"<a href=\"{resetLink}\">{resetLink}</a><br/><br/>" +
                       $"Se você não solicitou isso, pode ignorar este e-mail.<br/><br/>" +
                       $"Atenciosamente,<br/>" +
                       $"Equipe Cardápio Digital";

            try
            {
                await _emailService.SendEmailAsync(user.Email, subject, body);
                Console.WriteLine($"E-mail de reset de senha enviado para: {user.Email}");
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Erro ao enviar e-mail de reset de senha para {user.Email}: {ex.Message}");
            }
        }

        public async Task ResetPasswordAsync(ResetPasswordRequest request)
        {
            var user = await _userRepository.FindAsync(u =>
                u.PasswordResetToken == request.Token &&
                u.PasswordResetTokenExpiresAt.HasValue &&
                u.PasswordResetTokenExpiresAt.Value > DateTime.UtcNow
            );
            var userWithValidToken = user.FirstOrDefault();

            if (userWithValidToken == null)
            {
                throw new BadRequestException("Token de reset de senha inválido ou expirado.");
            }

            userWithValidToken.PasswordHash = _securityService.HashPassword(request.NewPassword);
            userWithValidToken.PasswordResetToken = null;
            userWithValidToken.PasswordResetTokenExpiresAt = null;
            userWithValidToken.UpdatedAt = DateTime.UtcNow;

            _userRepository.Update(userWithValidToken);
            await _userRepository.SaveChangesAsync();
        }

    }
}