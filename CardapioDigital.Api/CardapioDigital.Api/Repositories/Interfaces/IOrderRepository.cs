using CardapioDigital.Api.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CardapioDigital.Api.Repositories.Interfaces
{
    public interface IOrderRepository : IGenericRepository<Order>
    {
        Task<Order> GetByIdWithDetailsAsync(int id); 
        Task<IEnumerable<Order>> GetUserOrdersWithDetailsAsync(int userId, string status = null);
        Task<IEnumerable<Order>> GetAllOrdersWithDetailsAsync(string status = null);
    }
}