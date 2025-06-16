using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema; 

namespace CardapioDigital.Api.DTOs.Addon
{
    public class AddonRequest
    {
        [Required(ErrorMessage = "O ID da categoria de adicional é obrigatório.")]
        public int AddonCategoryId { get; set; }

        [Required(ErrorMessage = "O nome do adicional é obrigatório.")]
        [StringLength(100, ErrorMessage = "O nome não pode exceder 100 caracteres.")]
        public string Name { get; set; }

        [StringLength(255, ErrorMessage = "A descrição não pode exceder 255 caracteres.")]
        public string Description { get; set; }

        [Column(TypeName = "decimal(18, 2)")] 
        [Range(0, double.MaxValue, ErrorMessage = "O preço deve ser um valor não negativo.")]
        public decimal Price { get; set; } = 0.0m;

        public bool IsActive { get; set; } = true;
    }
}