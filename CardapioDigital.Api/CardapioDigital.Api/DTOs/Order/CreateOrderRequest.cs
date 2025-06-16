using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using CardapioDigital.Api.DTOs.OrderItem; 
namespace CardapioDigital.Api.DTOs.Order
{
    public class CreateOrderRequest
    {
        [Required(ErrorMessage = "O ID do endereço é obrigatório.")]
        public int AddressId { get; set; }

        [Required(ErrorMessage = "O método de pagamento é obrigatório.")]
        [StringLength(50)]
        public string PaymentMethod { get; set; } 
        
        [Required(ErrorMessage = "O tipo de entrega é obrigatório.")]
        [StringLength(50)]
        public string DeliveryType { get; set; } = "delivery"; // Ex: "delivery", "pickup"

        [StringLength(500)]
        public string Notes { get; set; }

        [Required(ErrorMessage = "Os itens do pedido são obrigatórios.")]
        [MinLength(1, ErrorMessage = "O pedido deve conter pelo menos um item.")]
        public List<OrderItemRequest> Items { get; set; }
    }
}