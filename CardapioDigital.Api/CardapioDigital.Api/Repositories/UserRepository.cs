// CardapioDigital.Api/Repositories/UserRepository.cs
using Microsoft.EntityFrameworkCore;
using CardapioDigital.Api.Data;
using CardapioDigital.Api.Models;
using CardapioDigital.Api.Repositories.Interfaces;
using System.Linq; // Adicione este using
using System.Threading.Tasks;

namespace CardapioDigital.Api.Repositories
{
    public class UserRepository : GenericRepository<User>, IUserRepository
    {
        public UserRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<User> GetByUsernameAsync(string username)
        {
            return await _dbSet.Include(u => u.Client).FirstOrDefaultAsync(u => u.Username == username); 
        }

        public async Task<User> GetByEmailAsync(string email)
        {
            return await _dbSet.Include(u => u.Client).FirstOrDefaultAsync(u => u.Email == email); 
        }

        public new async Task<User> GetByIdAsync(int id)
        {
            return await _dbSet.Include(u => u.Client).FirstOrDefaultAsync(u => u.Id == id);
        }
    }
}