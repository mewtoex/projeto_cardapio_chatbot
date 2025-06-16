using System.ComponentModel.DataAnnotations;

namespace CardapioDigital.Api.DTOs.Order
{
    public class UpdateOrderStatusRequest
    {
        [Required(ErrorMessage = "O status do pedido é obrigatório.")]
        [StringLength(50)]

        [RegularExpression("^(pending|confirmed|preparing|out_for_delivery|delivered|cancelled)$", ErrorMessage = "Status inválido.")]
        public string Status { get; set; }
    }
}