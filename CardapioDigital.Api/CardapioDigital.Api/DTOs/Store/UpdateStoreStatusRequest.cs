using System.ComponentModel.DataAnnotations;

namespace CardapioDigital.Api.DTOs.Store
{
    public class UpdateStoreStatusRequest
    {
        [Required(ErrorMessage = "O status de operação é obrigatório.")]
        [StringLength(50)]
        [RegularExpression("^(open|closed|busy)$", ErrorMessage = "Status de operação inválido.")]
        public string Status { get; set; }
    }
}