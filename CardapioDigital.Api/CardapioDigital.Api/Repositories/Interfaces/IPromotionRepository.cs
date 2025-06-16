using CardapioDigital.Api.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CardapioDigital.Api.Repositories.Interfaces
{
    public interface IPromotionRepository : IGenericRepository<Promotion>
    {
        Task<Promotion> GetByNameAsync(string name);
        Task<IEnumerable<Promotion>> GetActivePromotionsAsync();
    }
}