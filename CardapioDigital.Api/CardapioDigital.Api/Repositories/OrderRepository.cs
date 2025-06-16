using Microsoft.EntityFrameworkCore;
using CardapioDigital.Api.Data;
using CardapioDigital.Api.Models;
using CardapioDigital.Api.Repositories.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CardapioDigital.Api.Repositories
{
    public class OrderRepository : GenericRepository<Order>, IOrderRepository
    {
        public OrderRepository(ApplicationDbContext context) : base(context)
        {
        }

        private IQueryable<Order> IncludeAllDetails(IQueryable<Order> query)
        {
            return query
                .Include(o => o.Client) 
                    .ThenInclude(c => c.User) 
                .Include(o => o.Address)
                .Include(o => o.Items)
                    .ThenInclude(oi => oi.MenuItem)
                .Include(o => o.Items)
                    .ThenInclude(oi => oi.Addons);
        }

        public async Task<Order> GetByIdWithDetailsAsync(int id)
        {
            return await IncludeAllDetails(_dbSet).FirstOrDefaultAsync(o => o.Id == id);
        }

        public async Task<IEnumerable<Order>> GetUserOrdersWithDetailsAsync(int clientId, string status = null) 
        {
            IQueryable<Order> query = IncludeAllDetails(_dbSet).Where(o => o.ClientId == clientId); 

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(o => o.Status == status);
            }

            return await query.OrderByDescending(o => o.CreatedAt).ToListAsync();
        }

        public async Task<IEnumerable<Order>> GetAllOrdersWithDetailsAsync(string status = null)
        {
            IQueryable<Order> query = IncludeAllDetails(_dbSet);

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(o => o.Status == status);
            }

            return await query.OrderByDescending(o => o.CreatedAt).ToListAsync();
        }
    }
}