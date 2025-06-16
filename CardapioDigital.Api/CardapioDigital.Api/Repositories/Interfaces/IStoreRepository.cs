using CardapioDigital.Api.Models;
using System.Threading.Tasks;

namespace CardapioDigital.Api.Repositories.Interfaces
{
    public interface IStoreRepository : IGenericRepository<Store>
    {
        Task<Store> GetFirstStoreAsync(); 
        Task<Store> GetByNameAsync(string name); 
        Task<Store> GetByPhoneNumberAsync(string phoneNumber);
    }
}