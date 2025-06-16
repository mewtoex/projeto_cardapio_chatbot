using CardapioDigital.Api.DTOs.BotMessage;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CardapioDigital.Api.Services.Interfaces
{
    public interface IBotMessageService
    {
        Task<IEnumerable<BotMessageResponse>> GetAllBotMessagesAsync();
        Task<BotMessageResponse> GetBotMessageByIdAsync(int messageId);
        Task<BotMessageResponse> GetBotMessageByKeyAsync(string messageKey);
        Task<BotMessageResponse> CreateBotMessageAsync(BotMessageRequest request);
        Task<BotMessageResponse> UpdateBotMessageAsync(int messageId, BotMessageRequest request);
        Task DeleteBotMessageAsync(int messageId);
    }
}