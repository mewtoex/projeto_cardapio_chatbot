using System.ComponentModel.DataAnnotations;

namespace CardapioDigital.Api.DTOs.Client
{
    public class UpdateClientProfileRequest
    {
        [StringLength(100)]
        public string FirstName { get; set; }

        [StringLength(100)]
        public string LastName { get; set; }

        [StringLength(14, MinimumLength = 11)]
        public string CPF { get; set; } 
    }
}