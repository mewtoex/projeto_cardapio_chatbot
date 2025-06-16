using System;
using System.Collections.Generic;
using CardapioDigital.Api.DTOs.User; 
using CardapioDigital.Api.DTOs.Address;
using CardapioDigital.Api.DTOs.OrderItem;
using CardapioDigital.Api.DTOs.Client; 

namespace CardapioDigital.Api.DTOs.Order
{
    public class OrderResponse
    {
        public int Id { get; set; }
        public int ClientId { get; set; } 
        public int AddressId { get; set; }
        public decimal TotalAmount { get; set; }
        public string Status { get; set; }
        public string PaymentMethod { get; set; }
        public string DeliveryType { get; set; }
        public string Notes { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        public ClientResponse Client { get; set; } 
        public AddressResponse Address { get; set; }
        public ICollection<OrderItemResponse> Items { get; set; }

    }
}