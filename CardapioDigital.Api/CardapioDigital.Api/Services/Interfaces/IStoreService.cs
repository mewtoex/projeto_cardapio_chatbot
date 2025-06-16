using CardapioDigital.Api.DTOs.Store;
using System.Threading.Tasks;

namespace CardapioDigital.Api.Services.Interfaces
{
    public interface IStoreService
    {
        Task<StoreResponse> GetStoreInfoAsync();
        Task<StoreResponse> CreateOrUpdateStoreInfoAsync(StoreRequest request);
        Task<StoreResponse> UpdateStoreStatusAsync(UpdateStoreStatusRequest request);
        Task<StoreOperatingStatusResponse> GetOperatingStatusAsync();
    }
}