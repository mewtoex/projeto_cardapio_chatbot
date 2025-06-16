using System.ComponentModel.DataAnnotations;

namespace CardapioDigital.Api.DTOs.AddonCategory
{
    public class AddonCategoryRequest
    {
        [Required(ErrorMessage = "O nome da categoria de adicional é obrigatório.")]
        [StringLength(100, ErrorMessage = "O nome não pode exceder 100 caracteres.")]
        public string Name { get; set; }

        [Range(0, int.MaxValue, ErrorMessage = "A seleção mínima deve ser um número não negativo.")]
        public int MinSelection { get; set; } = 0;

        [Range(0, int.MaxValue, ErrorMessage = "A seleção máxima deve ser um número não negativo.")]
        public int MaxSelection { get; set; } = 1;

        public bool IsActive { get; set; } = true;
    }
}