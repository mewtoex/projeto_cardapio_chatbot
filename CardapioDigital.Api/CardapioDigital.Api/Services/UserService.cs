using AutoMapper; 
using CardapioDigital.Api.DTOs.Address;
using CardapioDigital.Api.DTOs.User;
using CardapioDigital.Api.Exceptions;
using CardapioDigital.Api.Models;
using CardapioDigital.Api.Repositories.Interfaces;
using CardapioDigital.Api.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq; 
using System.Threading.Tasks;

namespace CardapioDigital.Api.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly IAddressRepository _addressRepository;
        private readonly ISecurityService _securityService; 
        private readonly IMapper _mapper; 

        public UserService(IUserRepository userRepository, IAddressRepository addressRepository, ISecurityService securityService, IMapper mapper)
        {
            _userRepository = userRepository;
            _addressRepository = addressRepository;
            _securityService = securityService;
            _mapper = mapper;
        }

        public async Task<UserProfileResponse> GetUserProfileAsync(int userId)
        {
            var user = await _userRepository.FindAsync(u => u.Id == userId);
            var userWithAddresses = user.FirstOrDefault(); 

            if (userWithAddresses == null)
            {
                throw new ApplicationException("Usuário não encontrado."); 
            }
            var userProfileResponse = _mapper.Map<UserProfileResponse>(userWithAddresses);

            userProfileResponse.Addresses = _mapper.Map<ICollection<AddressResponse>>(
                await _addressRepository.GetAddressesByUserIdAsync(userId)
            );

            return userProfileResponse;
        }

        public async Task<UserProfileResponse> UpdateUserProfileAsync(int userId, UpdateUserProfileRequest request)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                throw new ApplicationException("Usuário não encontrado.");
            }

            if (!string.IsNullOrEmpty(request.Username) && request.Username != user.Username)
            {
                if (await _userRepository.GetByUsernameAsync(request.Username) != null)
                {
                    throw new ApplicationException("Nome de usuário já existe.");
                }
                user.Username = request.Username;
            }
            if (!string.IsNullOrEmpty(request.Email) && request.Email != user.Email)
            {
                if (await _userRepository.GetByEmailAsync(request.Email) != null)
                {
                    throw new ApplicationException("E-mail já existe.");
                }
                user.Email = request.Email;
            }

            user.UpdatedAt = DateTime.UtcNow;
            _userRepository.Update(user);
            await _userRepository.SaveChangesAsync();

            return _mapper.Map<UserProfileResponse>(user);
        }

        public async Task ChangeUserPasswordAsync(int userId, ChangePasswordRequest request)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                throw new ApplicationException("Usuário não encontrado.");
            }

            if (!_securityService.VerifyPassword(request.CurrentPassword, user.PasswordHash))
            {
                throw new ApplicationException("Senha atual incorreta.");
            }

            user.PasswordHash = _securityService.HashPassword(request.NewPassword);
            user.UpdatedAt = DateTime.UtcNow;
            _userRepository.Update(user);
            await _userRepository.SaveChangesAsync();
        }

        public async Task<AddressResponse> AddUserAddressAsync(int userId, AddressRequest request)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                throw new ApplicationException("Usuário não encontrado.");
            }

            var newAddress = _mapper.Map<Address>(request);
            newAddress.UserId = userId; 
            newAddress.CreatedAt = DateTime.UtcNow;
            newAddress.UpdatedAt = DateTime.UtcNow;

            await _addressRepository.AddAsync(newAddress);
            await _addressRepository.SaveChangesAsync();

            return _mapper.Map<AddressResponse>(newAddress);
        }

        public async Task<IEnumerable<AddressResponse>> GetUserAddressesAsync(int userId)
        {
            var addresses = await _addressRepository.GetAddressesByUserIdAsync(userId);
            return _mapper.Map<IEnumerable<AddressResponse>>(addresses);
        }

        public async Task<AddressResponse> UpdateUserAddressAsync(int userId, int addressId, AddressRequest request)
        {
            var address = await _addressRepository.GetByIdAsync(addressId);
            if (address == null || address.UserId != userId)
            {
                throw new ApplicationException("Endereço não encontrado ou não pertence a este usuário.");
            }

            address.Street = request.Street;
            address.Number = request.Number;
            address.Complement = request.Complement;
            address.Neighborhood = request.Neighborhood;
            address.City = request.City;
            address.State = request.State;
            address.ZipCode = request.ZipCode;
            address.IsDefault = request.IsDefault;
            address.UpdatedAt = DateTime.UtcNow;

            _addressRepository.Update(address);
            await _addressRepository.SaveChangesAsync();

            return _mapper.Map<AddressResponse>(address);
        }

        public async Task DeleteUserAddressAsync(int userId, int addressId)
        {
            var address = await _addressRepository.GetByIdAsync(addressId);
            if (address == null || address.UserId != userId)
            {
                throw new ApplicationException("Endereço não encontrado ou não pertence a este usuário.");
            }

            _addressRepository.Remove(address);
            await _addressRepository.SaveChangesAsync();
        }
        public async Task<IEnumerable<UserProfileResponse>> GetAllUsersAsync()
        {
            var users = await _userRepository.GetAllAsync();
            return _mapper.Map<IEnumerable<UserProfileResponse>>(users);
        }

        public async Task<UserProfileResponse> UpdateUserRoleAsync(int userId, string newRole)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                throw new NotFoundException("Usuário não encontrado.");
            }

            string[] validRoles = { "client", "admin" };
            if (!validRoles.Contains(newRole.ToLower()))
            {
                throw new BadRequestException("Role inválida. As roles permitidas são 'client' e 'admin'.");
            }

            user.IsAdmin = newRole.ToLower() == "Admin";
            user.UpdatedAt = DateTime.UtcNow;
            _userRepository.Update(user);
            await _userRepository.SaveChangesAsync();

            return _mapper.Map<UserProfileResponse>(user);
        }
    }
}