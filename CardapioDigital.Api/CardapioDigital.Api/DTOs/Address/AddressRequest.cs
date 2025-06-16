using System.ComponentModel.DataAnnotations;

namespace CardapioDigital.Api.DTOs.Address
{
    public class AddressRequest
    {
        [Required(ErrorMessage = "A rua é obrigatória.")]
        [StringLength(255)]
        public string Street { get; set; }

        [StringLength(50)]
        public string Number { get; set; }

        [StringLength(255)]
        public string Complement { get; set; }

        [Required(ErrorMessage = "O bairro é obrigatório.")]
        [StringLength(255)]
        public string Neighborhood { get; set; }

        [Required(ErrorMessage = "A cidade é obrigatória.")]
        [StringLength(255)]
        public string City { get; set; }

        [Required(ErrorMessage = "O estado é obrigatório.")]
        [StringLength(2, MinimumLength = 2)]
        public string State { get; set; }

        [Required(ErrorMessage = "O CEP é obrigatório.")]
        [StringLength(10)]
        public string ZipCode { get; set; }

        public bool IsDefault { get; set; } = false;
    }
}