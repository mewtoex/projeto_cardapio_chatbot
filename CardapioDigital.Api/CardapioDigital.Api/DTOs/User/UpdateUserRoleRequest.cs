using System.ComponentModel.DataAnnotations;

namespace CardapioDigital.Api.DTOs.User
{
    public class UpdateUserRoleRequest
    {
        [Required(ErrorMessage = "A nova role é obrigatória.")]
        [StringLength(50)]
        [RegularExpression("^(client|admin)$", ErrorMessage = "Role inválida. As roles permitidas são 'client' e 'admin'.")]
        public string NewRole { get; set; }
    }
}