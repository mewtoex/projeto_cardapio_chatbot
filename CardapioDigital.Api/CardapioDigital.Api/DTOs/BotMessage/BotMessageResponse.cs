using System;

namespace CardapioDigital.Api.DTOs.BotMessage
{
    public class BotMessageResponse
    {
        public int Id { get; set; }
        public string MessageKey { get; set; }
        public string Content { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}