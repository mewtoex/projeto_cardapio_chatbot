using CardapioDigital.Api.Models;
using System.Threading.Tasks;

namespace CardapioDigital.Api.Repositories.Interfaces
{
    public interface IBotMessageRepository : IGenericRepository<BotMessage>
    {
        Task<BotMessage> GetByMessageKeyAsync(string messageKey);
    }
}