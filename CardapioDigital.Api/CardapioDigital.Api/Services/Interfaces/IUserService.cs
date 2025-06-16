using CardapioDigital.Api.DTOs.Address;
using CardapioDigital.Api.DTOs.User;
using CardapioDigital.Api.DTOs.Client;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CardapioDigital.Api.Services.Interfaces
{
    public interface IUserService
    {
        Task<UserProfileResponse> GetUserProfileAsync(int userId); 
        Task<ClientResponse> UpdateClientProfileAsync(int userId, UpdateClientProfileRequest request); 
        Task ChangeUserPasswordAsync(int userId, ChangePasswordRequest request);

        Task<AddressResponse> AddClientAddressAsync(int userId, AddressRequest request); 
        Task<IEnumerable<AddressResponse>> GetClientAddressesAsync(int userId); 
        Task<AddressResponse> UpdateClientAddressAsync(int userId, int addressId, AddressRequest request); 
        Task DeleteClientAddressAsync(int userId, int addressId); 

        Task<IEnumerable<UserProfileResponse>> GetAllUsersAsync();
        Task<UserProfileResponse> UpdateUserRoleAsync(int userId, string newRole);
    }
}