using Microsoft.EntityFrameworkCore;
using CardapioDigital.Api.Data;
using CardapioDigital.Api.Models;
using CardapioDigital.Api.Repositories.Interfaces;
using System.Threading.Tasks;
using System.Linq;

namespace CardapioDigital.Api.Repositories
{
    public class CategoryRepository : GenericRepository<Category>, ICategoryRepository
    {
        public CategoryRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<Category> GetByNameAsync(string name)
        {
            return await _dbSet.FirstOrDefaultAsync(c => c.Name == name);
        }
    }
}