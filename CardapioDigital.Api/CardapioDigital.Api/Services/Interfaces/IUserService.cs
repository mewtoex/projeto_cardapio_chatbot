using CardapioDigital.Api.DTOs.Address;
using CardapioDigital.Api.DTOs.User;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CardapioDigital.Api.Services.Interfaces
{
    public interface IUserService
    {
        Task<UserProfileResponse> GetUserProfileAsync(int userId);
        Task<UserProfileResponse> UpdateUserProfileAsync(int userId, UpdateUserProfileRequest request);
        Task ChangeUserPasswordAsync(int userId, ChangePasswordRequest request);

        Task<AddressResponse> AddUserAddressAsync(int userId, AddressRequest request);
        Task<IEnumerable<AddressResponse>> GetUserAddressesAsync(int userId);
        Task<AddressResponse> UpdateUserAddressAsync(int userId, int addressId, AddressRequest request);
        Task DeleteUserAddressAsync(int userId, int addressId);
        Task<IEnumerable<UserProfileResponse>> GetAllUsersAsync();
        Task<UserProfileResponse> UpdateUserRoleAsync(int userId, string newRole);

    }
}