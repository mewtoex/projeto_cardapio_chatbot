using CardapioDigital.Api.Models;
using System.Threading.Tasks;

namespace CardapioDigital.Api.Repositories.Interfaces
{
    public interface IClientRepository : IGenericRepository<Client>
    {
        Task<Client> GetByUserIdAsync(int userId);
        Task<Client> GetByCPFAsync(string cpf);
        Task<Client> GetByIdWithDetailsAsync(int clientId);
    }
}