using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace CardapioDigital.Api.DTOs.Addon
{
    public class AddonResponse
    {
        public int Id { get; set; }
        public int AddonCategoryId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        [Column(TypeName = "decimal(18, 2)")]
        public decimal Price { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}