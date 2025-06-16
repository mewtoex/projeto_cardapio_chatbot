using System.ComponentModel.DataAnnotations;
using CardapioDigital.Api.DTOs.Client; 

namespace CardapioDigital.Api.DTOs.Auth
{
    public class RegisterRequest
    {
        [Required(ErrorMessage = "O nome de usuário é obrigatório.")]
        [StringLength(80, MinimumLength = 3, ErrorMessage = "O nome de usuário deve ter entre 3 e 80 caracteres.")]
        public string Username { get; set; }

        [Required(ErrorMessage = "O e-mail é obrigatório.")]
        [EmailAddress(ErrorMessage = "Formato de e-mail inválido.")]
        [StringLength(120, ErrorMessage = "O e-mail não pode exceder 120 caracteres.")]
        public string Email { get; set; }

        [Required(ErrorMessage = "A senha é obrigatória.")]
        [MinLength(6, ErrorMessage = "A senha deve ter no mínimo 6 caracteres.")]
        public string Password { get; set; }

        [Required(ErrorMessage = "Os dados do cliente são obrigatórios.")]
        public CreateClientRequest ClientData { get; set; } 
    }
}