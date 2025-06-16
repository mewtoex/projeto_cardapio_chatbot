using System.ComponentModel.DataAnnotations;

namespace CardapioDigital.Api.DTOs.Category
{
    public class CategoryRequest
    {
        [Required(ErrorMessage = "O nome da categoria é obrigatório.")]
        [StringLength(100)]
        public string Name { get; set; }

        [StringLength(255)]
        public string Description { get; set; }

        public bool IsActive { get; set; } = true;
    }
}