using System;
using System.Collections.Generic;
using CardapioDigital.Api.DTOs.Addon; 

namespace CardapioDigital.Api.DTOs.AddonCategory
{
    public class AddonCategoryResponse
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int MinSelection { get; set; }
        public int MaxSelection { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public ICollection<AddonResponse> Addons { get; set; } 
    }
}