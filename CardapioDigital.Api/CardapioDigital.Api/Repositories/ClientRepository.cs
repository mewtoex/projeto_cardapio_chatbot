using Microsoft.EntityFrameworkCore;
using CardapioDigital.Api.Data;
using CardapioDigital.Api.Models;
using CardapioDigital.Api.Repositories.Interfaces;
using System.Linq;
using System.Threading.Tasks;

namespace CardapioDigital.Api.Repositories
{
    public class ClientRepository : GenericRepository<Client>, IClientRepository
    {
        public ClientRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<Client> GetByUserIdAsync(int userId)
        {
            return await _dbSet.FirstOrDefaultAsync(c => c.UserId == userId);
        }

        public async Task<Client> GetByCPFAsync(string cpf)
        {
            return await _dbSet.FirstOrDefaultAsync(c => c.CPF == cpf);
        }

        public async Task<Client> GetByIdWithDetailsAsync(int clientId)
        {
            return await _dbSet
                .Include(c => c.Addresses)
                .Include(c => c.User) 
                .FirstOrDefaultAsync(c => c.Id == clientId);
        }
    }
}