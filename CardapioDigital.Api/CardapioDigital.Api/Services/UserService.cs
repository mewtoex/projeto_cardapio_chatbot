using AutoMapper;
using CardapioDigital.Api.DTOs.Address;
using CardapioDigital.Api.DTOs.User;
using CardapioDigital.Api.DTOs.Client; 
using CardapioDigital.Api.Models;
using CardapioDigital.Api.Repositories.Interfaces;
using CardapioDigital.Api.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CardapioDigital.Api.Exceptions; 

namespace CardaphoDigital.Api.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly IClientRepository _clientRepository;
        private readonly IAddressRepository _addressRepository;
        private readonly ISecurityService _securityService;
        private readonly IMapper _mapper;

        public UserService(IUserRepository userRepository, IClientRepository clientRepository, IAddressRepository addressRepository, ISecurityService securityService, IMapper mapper) // NOVO: clientRepository
        {
            _userRepository = userRepository;
            _clientRepository = clientRepository; 
            _addressRepository = addressRepository;
            _securityService = securityService;
            _mapper = mapper;
        }

        public async Task<UserProfileResponse> GetUserProfileAsync(int userId)
        {
            var user = await _userRepository.GetByIdAsync(userId); 
            if (user == null)
            {
                throw new NotFoundException("Usuário não encontrado.");
            }

            var userProfileResponse = _mapper.Map<UserProfileResponse>(user);
            if (user.Client != null)
            {
                var clientWithAddresses = await _clientRepository.GetByIdWithDetailsAsync(user.Client.Id);
                userProfileResponse.Client = _mapper.Map<ClientResponse>(clientWithAddresses);
            }

            return userProfileResponse;
        }

        public async Task<ClientResponse> UpdateClientProfileAsync(int userId, UpdateClientProfileRequest request)
        {
            var client = await _clientRepository.GetByUserIdAsync(userId);
            if (client == null)
            {
                throw new NotFoundException("Cliente não encontrado para o usuário especificado.");
            }

            if (!string.IsNullOrEmpty(request.CPF) && request.CPF != client.CPF)
            {
                if (await _clientRepository.GetByCPFAsync(request.CPF) != null)
                {
                    throw new BadRequestException("CPF já cadastrado para outro cliente.");
                }
                client.CPF = request.CPF;
            }

            _mapper.Map(request, client);
            client.UpdatedAt = DateTime.UtcNow;

            _clientRepository.Update(client);
            await _clientRepository.SaveChangesAsync();

            return _mapper.Map<ClientResponse>(client);
        }


        public async Task ChangeUserPasswordAsync(int userId, ChangePasswordRequest request)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                throw new NotFoundException("Usuário não encontrado.");
            }

            if (!_securityService.VerifyPassword(request.CurrentPassword, user.PasswordHash))
            {
                throw new BadRequestException("Senha atual incorreta.");
            }

            user.PasswordHash = _securityService.HashPassword(request.NewPassword);
            user.UpdatedAt = DateTime.UtcNow;
            _userRepository.Update(user);
            await _userRepository.SaveChangesAsync();
        }

        public async Task<AddressResponse> AddClientAddressAsync(int userId, AddressRequest request)
        {
            var client = await _clientRepository.GetByUserIdAsync(userId);
            if (client == null)
            {
                throw new NotFoundException("Cliente não encontrado para o usuário especificado.");
            }

            var newAddress = _mapper.Map<Address>(request);
            newAddress.ClientId = client.Id; 
            newAddress.CreatedAt = DateTime.UtcNow;
            newAddress.UpdatedAt = DateTime.UtcNow;

            await _addressRepository.AddAsync(newAddress);
            await _addressRepository.SaveChangesAsync();

            return _mapper.Map<AddressResponse>(newAddress);
        }

        public async Task<IEnumerable<AddressResponse>> GetClientAddressesAsync(int userId)
        {
            var client = await _clientRepository.GetByUserIdAsync(userId);
            if (client == null)
            {
                throw new NotFoundException("Cliente não encontrado para o usuário especificado.");
            }
            var addresses = await _addressRepository.GetAddressesByClientIdAsync(client.Id);
            return _mapper.Map<IEnumerable<AddressResponse>>(addresses);
        }

        public async Task<AddressResponse> UpdateClientAddressAsync(int userId, int addressId, AddressRequest request)
        {
            var client = await _clientRepository.GetByUserIdAsync(userId);
            if (client == null)
            {
                throw new NotFoundException("Cliente não encontrado para o usuário especificado.");
            }

            var address = await _addressRepository.GetByIdAsync(addressId);
            if (address == null || address.ClientId != client.Id) 
            {
                throw new NotFoundException("Endereço não encontrado ou não pertence a este cliente.");
            }

            _mapper.Map(request, address);
            address.UpdatedAt = DateTime.UtcNow;

            _addressRepository.Update(address);
            await _addressRepository.SaveChangesAsync();

            return _mapper.Map<AddressResponse>(address);
        }

        public async Task DeleteClientAddressAsync(int userId, int addressId)
        {
            var client = await _clientRepository.GetByUserIdAsync(userId);
            if (client == null)
            {
                throw new NotFoundException("Cliente não encontrado para o usuário especificado.");
            }

            var address = await _addressRepository.GetByIdAsync(addressId);
            if (address == null || address.ClientId != client.Id) 
            {
                throw new NotFoundException("Endereço não encontrado ou não pertence a este cliente.");
            }

            _addressRepository.Remove(address);
            await _addressRepository.SaveChangesAsync();
        }

        public async Task<IEnumerable<UserProfileResponse>> GetAllUsersAsync()
        {
            var users = await _userRepository.GetAllAsync(); 
                                                            
            foreach (var user in users)
            {
                if (user.Client != null)
                {
                    var clientWithDetails = await _clientRepository.GetByIdWithDetailsAsync(user.Client.Id);
                    user.Client = clientWithDetails; 
                }
            }
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

            user.Role = newRole.ToLower();
            user.UpdatedAt = DateTime.UtcNow;
            _userRepository.Update(user);
            await _userRepository.SaveChangesAsync();

            return _mapper.Map<UserProfileResponse>(user);
        }
    }
}