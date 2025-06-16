using Microsoft.EntityFrameworkCore;
using CardapioDigital.Api.Data;
using CardapioDigital.Api.Models;
using CardapioDigital.Api.Repositories.Interfaces;
using System.Threading.Tasks;
using System.Linq; 

namespace CardapioDigital.Api.Repositories
{
    public class AddonCategoryRepository : GenericRepository<AddonCategory>, IAddonCategoryRepository
    {
        public AddonCategoryRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<AddonCategory> GetByNameAsync(string name)
        {
            return await _dbSet.FirstOrDefaultAsync(ac => ac.Name == name);
        }

        public async Task<AddonCategory> GetByIdWithAddonsAsync(int id)
        {
            return await _dbSet
                .Include(ac => ac.Addons) 
                .FirstOrDefaultAsync(ac => ac.Id == id);
        }
    }
}