using AutoMapper;
using CardapioDigital.Api.DTOs.Store;
using CardapioDigital.Api.Models;
using CardapioDigital.Api.Repositories.Interfaces;
using CardapioDigital.Api.Services.Interfaces;
using System;
using System.Threading.Tasks;

namespace CardapioDigital.Api.Services
{
    public class StoreService : IStoreService
    {
        private readonly IStoreRepository _storeRepository;
        private readonly IMapper _mapper;

        public StoreService(IStoreRepository storeRepository, IMapper mapper)
        {
            _storeRepository = storeRepository;
            _mapper = mapper;
        }

        public async Task<StoreResponse> GetStoreInfoAsync()
        {
            var store = await _storeRepository.GetFirstStoreAsync();
            if (store == null)
            {
                throw new ApplicationException("Informações da loja não configuradas."); // Usar NotFoundException
            }
            return _mapper.Map<StoreResponse>(store);
        }

        public async Task<StoreResponse> CreateOrUpdateStoreInfoAsync(StoreRequest request)
        {
            var store = await _storeRepository.GetFirstStoreAsync();

            if (store == null)
            {
                var newStore = _mapper.Map<Store>(request);
                newStore.CreatedAt = DateTime.UtcNow;
                newStore.UpdatedAt = DateTime.UtcNow;

                if (!string.IsNullOrEmpty(request.OpeningTime))
                {
                    newStore.OpeningTime = TimeSpan.Parse(request.OpeningTime);
                }
                if (!string.IsNullOrEmpty(request.ClosingTime))
                {
                    newStore.ClosingTime = TimeSpan.Parse(request.ClosingTime);
                }

                await _storeRepository.AddAsync(newStore);
                await _storeRepository.SaveChangesAsync();
                return _mapper.Map<StoreResponse>(newStore);
            }
            else
            {
                if (request.Name != store.Name && await _storeRepository.GetByNameAsync(request.Name) != null)
                {
                    throw new ApplicationException("Já existe outra loja com este nome.");
                }
                if (request.PhoneNumber != store.PhoneNumber && await _storeRepository.GetByPhoneNumberAsync(request.PhoneNumber) != null)
                {
                    throw new ApplicationException("Já existe outra loja com este número de telefone.");
                }

                _mapper.Map(request, store); store.UpdatedAt = DateTime.UtcNow;

                if (!string.IsNullOrEmpty(request.OpeningTime))
                {
                    store.OpeningTime = TimeSpan.Parse(request.OpeningTime);
                }
                else
                {
                    store.OpeningTime = null; 
                }
                if (!string.IsNullOrEmpty(request.ClosingTime))
                {
                    store.ClosingTime = TimeSpan.Parse(request.ClosingTime);
                }
                else
                {
                    store.ClosingTime = null;  }

                _storeRepository.Update(store);
                await _storeRepository.SaveChangesAsync();
                return _mapper.Map<StoreResponse>(store);
            }
        }

        public async Task<StoreResponse> UpdateStoreStatusAsync(UpdateStoreStatusRequest request)
        {
            var store = await _storeRepository.GetFirstStoreAsync();
            if (store == null)
            {
                throw new ApplicationException("Informações da loja não configuradas."); // Usar NotFoundException
            }

            store.OperatingStatus = request.Status;
            store.UpdatedAt = DateTime.UtcNow;

            _storeRepository.Update(store);
            await _storeRepository.SaveChangesAsync();

            return _mapper.Map<StoreResponse>(store);
        }

        public async Task<StoreOperatingStatusResponse> GetOperatingStatusAsync()
        {
            var store = await _storeRepository.GetFirstStoreAsync();
            if (store == null)
            {
                return new StoreOperatingStatusResponse { Status = "closed", Message = "Informações da loja não configuradas." };
            }

            var currentTime = DateTime.Now.TimeOfDay;

            string message = "A loja está fechada.";
            string status = "closed";

            if (store.OpeningTime.HasValue && store.ClosingTime.HasValue)
            {
                if (currentTime >= store.OpeningTime.Value && currentTime <= store.ClosingTime.Value)
                {
                    if (store.OperatingStatus == "open")
                    {
                        status = "open";
                        message = "A loja está aberta!";
                    }
                    else if (store.OperatingStatus == "busy")
                    {
                        status = "busy";
                        message = "A loja está com muitos pedidos no momento. Pode haver atrasos.";
                    }
                    else 
                    {
                        status = "closed";
                        message = "A loja está temporariamente fechada.";
                    }
                }
                else
                {
                    status = "closed";
                    message = "A loja está fechada (fora do horário de funcionamento).";
                }
            }
            else
            {
                if (store.OperatingStatus == "open")
                {
                    status = "open";
                    message = "A loja está aberta!";
                }
                else if (store.OperatingStatus == "busy")
                {
                    status = "busy";
                    message = "A loja está com muitos pedidos no momento. Pode haver atrasos.";
                }
                else
                {
                    status = "closed";
                    message = "A loja está fechada.";
                }
            }

            return new StoreOperatingStatusResponse { Status = status, Message = message };
        }
    }
}