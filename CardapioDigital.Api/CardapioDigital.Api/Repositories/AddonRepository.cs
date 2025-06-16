// CardapioDigital.Api/Repositories/AddonRepository.cs
using Microsoft.EntityFrameworkCore;
using CardapioDigital.Api.Data;
using CardapioDigital.Api.Models;
using CardapioDigital.Api.Repositories.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CardapioDigital.Api.Repositories
{
    public class AddonRepository : GenericRepository<Addon>, IAddonRepository
    {
        public AddonRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Addon>> GetAddonsByCategoryIdAsync(int categoryId)
        {
            return await _dbSet.Where(a => a.AddonCategoryId == categoryId).ToListAsync();
        }
    }
}