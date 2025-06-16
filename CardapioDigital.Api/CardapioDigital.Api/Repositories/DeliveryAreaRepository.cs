using Microsoft.EntityFrameworkCore;
using CardapioDigital.Api.Data;
using CardapioDigital.Api.Models;
using CardapioDigital.Api.Repositories.Interfaces;
using System.Linq;
using System.Threading.Tasks;

namespace CardapioDigital.Api.Repositories
{
    public class DeliveryAreaRepository : GenericRepository<DeliveryArea>, IDeliveryAreaRepository
    {
        public DeliveryAreaRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<DeliveryArea> GetByNameAsync(string name)
        {
            return await _dbSet.FirstOrDefaultAsync(da => da.Name == name);
        }
    }
}