using System.ComponentModel.DataAnnotations;

namespace CardapioDigital.Api.DTOs.Auth.PasswordReset
{
    public class ResetPasswordRequest
    {
        [Required(ErrorMessage = "O token de reset de senha é obrigatório.")]
        public string Token { get; set; }

        [Required(ErrorMessage = "A nova senha é obrigatória.")]
        [MinLength(6, ErrorMessage = "A nova senha deve ter no mínimo 6 caracteres.")]
        public string NewPassword { get; set; }
    }
}