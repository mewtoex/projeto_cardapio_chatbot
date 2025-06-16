using CardapioDigital.Api.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CardapioDigital.Api.Repositories.Interfaces
{
    public interface IMenuItemRepository : IGenericRepository<MenuItem>
    {
        Task<MenuItem> GetByNameAsync(string name);
        Task<MenuItem> GetByIdWithDetailsAsync(int id); 
        Task<IEnumerable<MenuItem>> GetAllWithDetailsAsync(int? categoryId = null); 
    }
}