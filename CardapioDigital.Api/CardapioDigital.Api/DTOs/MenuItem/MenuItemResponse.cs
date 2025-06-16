using System;
using System.Collections.Generic;
using CardapioDigital.Api.DTOs.Category;
using CardapioDigital.Api.DTOs.AddonCategory; 

namespace CardapioDigital.Api.DTOs.MenuItem
{
    public class MenuItemResponse
    {
        public int Id { get; set; }
        public int CategoryId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }
        public string ImageUrl { get; set; }
        public bool IsAvailable { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        public CategoryResponse Category { get; set; }
        public ICollection<AddonCategoryResponse> AddonCategories { get; set; }
    }
}