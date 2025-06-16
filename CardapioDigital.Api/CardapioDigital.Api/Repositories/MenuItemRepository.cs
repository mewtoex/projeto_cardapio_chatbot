// CardapioDigital.Api/Repositories/MenuItemRepository.cs
using Microsoft.EntityFrameworkCore;
using CardapioDigital.Api.Data;
using CardapioDigital.Api.Models;
using CardapioDigital.Api.Repositories.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CardapioDigital.Api.Repositories
{
    public class MenuItemRepository : GenericRepository<MenuItem>, IMenuItemRepository
    {
        public MenuItemRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<MenuItem> GetByNameAsync(string name)
        {
            return await _dbSet.FirstOrDefaultAsync(mi => mi.Name == name);
        }

        public async Task<MenuItem> GetByIdWithDetailsAsync(int id)
        {
            return await _dbSet
                .Include(mi => mi.Category)
                .Include(mi => mi.AddonCategories)
                    .ThenInclude(ac => ac.Addons) 
                .FirstOrDefaultAsync(mi => mi.Id == id);
        }

        public async Task<IEnumerable<MenuItem>> GetAllWithDetailsAsync(int? categoryId = null)
        {
            IQueryable<MenuItem> query = _dbSet
                .Include(mi => mi.Category)
                .Include(mi => mi.AddonCategories)
                    .ThenInclude(ac => ac.Addons);

            if (categoryId.HasValue)
            {
                query = query.Where(mi => mi.CategoryId == categoryId.Value);
            }

            return await query.ToListAsync();
        }
    }
}