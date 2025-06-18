using System.ComponentModel.DataAnnotations;

namespace CardapioDigital.Api.DTOs.Client
{
    public class CreateClientRequest
    {
        [Required(ErrorMessage = "O nome é obrigatório.")]
        [StringLength(100)]
        public string FirstName { get; set; }

        [Required(ErrorMessage = "O sobrenome é obrigatório.")]
        [StringLength(100)]
        public string LastName { get; set; }

        [Required(ErrorMessage = "O Telefone é obrigatório.")]
        [StringLength(100)]
        public string Telephone { get; set; }

        

        [Required(ErrorMessage = "O CPF é obrigatório.")]
        [StringLength(14, MinimumLength = 11)] 
        public string CPF { get; set; }
    }
}