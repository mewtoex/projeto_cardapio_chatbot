using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CardapioDigital.Api.DTOs.MenuItem
{
    public class MenuItemRequest
    {
        [Required(ErrorMessage = "O ID da categoria é obrigatório.")]
        public int CategoryId { get; set; }

        [Required(ErrorMessage = "O nome do item é obrigatório.")]
        [StringLength(100)]
        public string Name { get; set; }

        [StringLength(255)]
        public string Description { get; set; }

        [Required(ErrorMessage = "O preço é obrigatório.")]
        [Range(0.0, double.MaxValue, ErrorMessage = "O preço deve ser um valor não negativo.")]
        public decimal Price { get; set; }

        [StringLength(255)]
        public string ImageUrl { get; set; }

        public bool IsAvailable { get; set; } = true;

        public List<int> AddonCategoryIds { get; set; } 
    }
}