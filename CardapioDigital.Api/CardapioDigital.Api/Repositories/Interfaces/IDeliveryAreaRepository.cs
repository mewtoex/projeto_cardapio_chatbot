using CardapioDigital.Api.Models;
using System.Threading.Tasks;

namespace CardapioDigital.Api.Repositories.Interfaces
{
    public interface IDeliveryAreaRepository : IGenericRepository<DeliveryArea>
    {
        Task<DeliveryArea> GetByNameAsync(string name);
    }
}