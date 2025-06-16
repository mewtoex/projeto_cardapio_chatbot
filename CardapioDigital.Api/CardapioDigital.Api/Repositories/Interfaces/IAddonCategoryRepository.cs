using CardapioDigital.Api.Models;
using System.Threading.Tasks;

namespace CardapioDigital.Api.Repositories.Interfaces
{
    public interface IAddonCategoryRepository : IGenericRepository<AddonCategory>
    {
        Task<AddonCategory> GetByNameAsync(string name);
        Task<AddonCategory> GetByIdWithAddonsAsync(int id);
    }
}