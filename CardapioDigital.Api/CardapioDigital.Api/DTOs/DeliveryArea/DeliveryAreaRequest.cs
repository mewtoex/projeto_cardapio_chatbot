using System.ComponentModel.DataAnnotations;

namespace CardapioDigital.Api.DTOs.DeliveryArea
{
    public class DeliveryAreaRequest
    {
        [Required(ErrorMessage = "O nome da área de entrega é obrigatório.")]
        [StringLength(100)]
        public string Name { get; set; }

        [Range(0.0, double.MaxValue, ErrorMessage = "O valor mínimo do pedido deve ser um número não negativo.")]
        public decimal MinOrderValue { get; set; } = 0.0m;

        [Required(ErrorMessage = "A taxa de entrega é obrigatória.")]
        [Range(0.0, double.MaxValue, ErrorMessage = "A taxa de entrega deve ser um valor não negativo.")]
        public decimal DeliveryFee { get; set; }

        public bool IsActive { get; set; } = true;
    }
}