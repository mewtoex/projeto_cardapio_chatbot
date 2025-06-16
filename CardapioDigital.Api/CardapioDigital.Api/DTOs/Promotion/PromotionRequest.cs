using System;
using System.ComponentModel.DataAnnotations;

namespace CardapioDigital.Api.DTOs.Promotion
{
    public class PromotionRequest : IValidatableObject
    {
        [Required(ErrorMessage = "O nome da promoção é obrigatório.")]
        [StringLength(100)]
        public string Name { get; set; }

        [StringLength(255)]
        public string Description { get; set; }

        [Range(0.0, 100.0, ErrorMessage = "A porcentagem de desconto deve estar entre 0 e 100.")]
        public decimal? DiscountPercentage { get; set; }

        [Range(0.0, double.MaxValue, ErrorMessage = "O valor de desconto deve ser um número não negativo.")]
        public decimal? DiscountAmount { get; set; }

        [Required(ErrorMessage = "A data de início é obrigatória.")]
        public DateTime StartDate { get; set; }

        [Required(ErrorMessage = "A data de término é obrigatória.")]
        public DateTime EndDate { get; set; }

        public bool IsActive { get; set; } = true;

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            if (DiscountPercentage.HasValue && DiscountAmount.HasValue)
            {
                yield return new ValidationResult("Não é possível fornecer porcentagem e valor de desconto ao mesmo tempo. Escolha um.", new[] { nameof(DiscountPercentage), nameof(DiscountAmount) });
            }

            if (!DiscountPercentage.HasValue && !DiscountAmount.HasValue)
            {
                yield return new ValidationResult("Deve fornecer porcentagem ou valor de desconto.", new[] { nameof(DiscountPercentage), nameof(DiscountAmount) });
            }

            if (EndDate < StartDate)
            {
                yield return new ValidationResult("A data de término não pode ser anterior à data de início.", new[] { nameof(StartDate), nameof(EndDate) });
            }
        }
    }
}