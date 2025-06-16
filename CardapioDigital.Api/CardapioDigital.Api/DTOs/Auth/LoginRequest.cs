using System.ComponentModel.DataAnnotations;

namespace CardapioDigital.Api.DTOs.Auth
{
    public class LoginRequest
    {
        [Required(ErrorMessage = "O nome de usuário ou e-mail é obrigatório.")]
        public string UsernameOrEmail { get; set; } 

        [Required(ErrorMessage = "A senha é obrigatória.")]
        public string Password { get; set; }
    }
}