using CardapioDigital.Api.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CardapioDigital.Api.Repositories.Interfaces
{
    public interface IAddonRepository : IGenericRepository<Addon>
    {
        Task<IEnumerable<Addon>> GetAddonsByCategoryIdAsync(int categoryId);
    }
}