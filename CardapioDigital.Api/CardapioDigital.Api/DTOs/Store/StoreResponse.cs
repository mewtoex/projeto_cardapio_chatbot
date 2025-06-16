using System;

namespace CardapioDigital.Api.DTOs.Store
{
    public class StoreResponse
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string PhoneNumber { get; set; }
        public string Address { get; set; }
        public string OperatingStatus { get; set; }
        public string OpeningTime { get; set; } 
        public string ClosingTime { get; set; } 
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}