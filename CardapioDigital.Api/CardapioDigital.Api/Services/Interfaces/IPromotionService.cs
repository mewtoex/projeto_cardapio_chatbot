using CardapioDigital.Api.DTOs.Promotion;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CardapioDigital.Api.Services.Interfaces
{
    public interface IPromotionService
    {
        Task<IEnumerable<PromotionResponse>> GetAllPromotionsAsync(bool includeInactive = false);
        Task<PromotionResponse> GetPromotionByIdAsync(int promotionId);
        Task<PromotionResponse> CreatePromotionAsync(PromotionRequest request);
        Task<PromotionResponse> UpdatePromotionAsync(int promotionId, PromotionRequest request);
        Task DeletePromotionAsync(int promotionId);
    }
}