using Microsoft.EntityFrameworkCore;
using CardapioDigital.Api.Data;
using CardapioDigital.Api.Models;
using CardapioDigital.Api.Repositories.Interfaces;
using System.Linq;
using System.Threading.Tasks;

namespace CardapioDigital.Api.Repositories
{
    public class BotMessageRepository : GenericRepository<BotMessage>, IBotMessageRepository
    {
        public BotMessageRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<BotMessage> GetByMessageKeyAsync(string messageKey)
        {
            return await _dbSet.FirstOrDefaultAsync(bm => bm.MessageKey == messageKey);
        }
    }
}