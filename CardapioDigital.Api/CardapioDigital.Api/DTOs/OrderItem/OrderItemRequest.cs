using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CardapioDigital.Api.DTOs.OrderItem
{
    public class OrderItemRequest
    {
        [Required(ErrorMessage = "O ID do item de menu é obrigatório.")]
        public int MenuItemId { get; set; }

        [Required(ErrorMessage = "A quantidade é obrigatória.")]
        [Range(1, int.MaxValue, ErrorMessage = "A quantidade deve ser no mínimo 1.")]
        public int Quantity { get; set; }

        [StringLength(255)]
        public string Notes { get; set; }

        public List<int> AddonIds { get; set; } 
    }
}