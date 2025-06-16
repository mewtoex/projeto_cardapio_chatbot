using CardapioDigital.Api.DTOs.DeliveryArea;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CardapioDigital.Api.Services.Interfaces
{
    public interface IDeliveryService
    {
        Task<IEnumerable<DeliveryAreaResponse>> GetAllDeliveryAreasAsync();
        Task<DeliveryAreaResponse> GetDeliveryAreaByIdAsync(int areaId);
        Task<DeliveryAreaResponse> CreateDeliveryAreaAsync(DeliveryAreaRequest request);
        Task<DeliveryAreaResponse> UpdateDeliveryAreaAsync(int areaId, DeliveryAreaRequest request);
        Task DeleteDeliveryAreaAsync(int areaId);
    }
}