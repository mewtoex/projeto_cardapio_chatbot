using CardapioDigital.Api.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CardapioDigital.Api.Repositories.Interfaces
{
    public interface IAddressRepository : IGenericRepository<Address>
    {
        Task<IEnumerable<Address>> GetAddressesByUserIdAsync(int userId);
    }
}