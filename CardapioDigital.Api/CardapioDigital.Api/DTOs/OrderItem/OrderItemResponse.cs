using System;
using System.Collections.Generic;
using CardapioDigital.Api.DTOs.Addon;
using CardapioDigital.Api.DTOs.MenuItem; 
namespace CardapioDigital.Api.DTOs.OrderItem
{
    public class OrderItemResponse
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        public int MenuItemId { get; set; }
        public int Quantity { get; set; }
        public decimal Price { get; set; } public string Notes { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        public MenuItemResponse MenuItem { get; set; } 
        public ICollection<AddonResponse> Addons { get; set; } // Adicionais específicos deste item no pedido
    }
}