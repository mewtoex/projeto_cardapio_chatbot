using System.ComponentModel.DataAnnotations;

namespace CardapioDigital.Api.DTOs.User
{
    public class UpdateUserProfileRequest
    {
        [StringLength(80, MinimumLength = 3, ErrorMessage = "O nome de usuário deve ter entre 3 e 80 caracteres.")]
        public string Username { get; set; }

        [EmailAddress(ErrorMessage = "Formato de e-mail inválido.")]
        [StringLength(120, ErrorMessage = "O e-mail não pode exceder 120 caracteres.")]
        public string Email { get; set; }

    }
}