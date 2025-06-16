using System;

namespace CardapioDigital.Api.DTOs.DeliveryArea
{
    public class DeliveryAreaResponse
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public decimal MinOrderValue { get; set; }
        public decimal DeliveryFee { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}