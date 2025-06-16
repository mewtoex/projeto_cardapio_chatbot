using System.ComponentModel.DataAnnotations;

namespace CardapioDigital.Api.DTOs.BotMessage
{
    public class BotMessageRequest
    {
        [Required(ErrorMessage = "A chave da mensagem é obrigatória.")]
        [StringLength(100)]
        public string MessageKey { get; set; }

        [Required(ErrorMessage = "O conteúdo da mensagem é obrigatório.")]
        public string Content { get; set; } 
    }
}