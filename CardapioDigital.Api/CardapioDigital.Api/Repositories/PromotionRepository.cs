using Microsoft.EntityFrameworkCore;
using CardapioDigital.Api.Data;
using CardapioDigital.Api.Models;
using CardapioDigital.Api.Repositories.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System;

namespace CardapioDigital.Api.Repositories
{
    public class PromotionRepository : GenericRepository<Promotion>, IPromotionRepository
    {
        public PromotionRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<Promotion> GetByNameAsync(string name)
        {
            return await _dbSet.FirstOrDefaultAsync(p => p.Name == name);
        }

        public async Task<IEnumerable<Promotion>> GetActivePromotionsAsync()
        {
            var now = DateTime.UtcNow;
            return await _dbSet.Where(p => p.IsActive && p.StartDate <= now && p.EndDate >= now).ToListAsync();
        }
    }
}