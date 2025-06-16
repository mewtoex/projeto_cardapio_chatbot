using System;
using System.ComponentModel.DataAnnotations;

namespace CardapioDigital.Api.DTOs.Store
{
    public class StoreRequest
    {
        [Required(ErrorMessage = "O nome da loja é obrigatório.")]
        [StringLength(100)]
        public string Name { get; set; }

        public string Description { get; set; }

        [Required(ErrorMessage = "O número de telefone é obrigatório.")]
        [StringLength(20)]
        public string PhoneNumber { get; set; }

        [StringLength(255)]
        public string Address { get; set; }

        [StringLength(50)]
        [RegularExpression("^(open|closed|busy)$", ErrorMessage = "Status de operação inválido.")]
        public string OperatingStatus { get; set; } = "closed"; // Padrão

        [RegularExpression("^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$", ErrorMessage = "Formato de hora de abertura inválido (HH:mm).")]
        public string OpeningTime { get; set; } 
        
        [RegularExpression("^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$", ErrorMessage = "Formato de hora de fechamento inválido (HH:mm).")]
        public string ClosingTime { get; set; } 

        public bool IsActive { get; set; } = true;
    }
}