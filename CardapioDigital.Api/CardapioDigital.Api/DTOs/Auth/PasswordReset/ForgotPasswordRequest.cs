using System.ComponentModel.DataAnnotations;

namespace CardapioDigital.Api.DTOs.Auth.PasswordReset
{
    public class ForgotPasswordRequest
    {
        [Required(ErrorMessage = "O e-mail ou nome de usuário é obrigatório.")]
        public string UsernameOrEmail { get; set; }
    }
}