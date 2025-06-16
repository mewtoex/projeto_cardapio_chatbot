using AutoMapper;
using CardapioDigital.Api.DTOs.Promotion;
using CardapioDigital.Api.Models;
using CardapioDigital.Api.Repositories.Interfaces;
using CardapioDigital.Api.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CardapioDigital.Api.Services
{
    public class PromotionService : IPromotionService
    {
        private readonly IPromotionRepository _promotionRepository;
        private readonly IMapper _mapper;

        public PromotionService(IPromotionRepository promotionRepository, IMapper mapper)
        {
            _promotionRepository = promotionRepository;
            _mapper = mapper;
        }

        public async Task<IEnumerable<PromotionResponse>> GetAllPromotionsAsync(bool includeInactive = false)
        {
            IEnumerable<Promotion> promotions;
            if (includeInactive)
            {
                promotions = await _promotionRepository.GetAllAsync();
            }
            else
            {
                promotions = await _promotionRepository.GetActivePromotionsAsync();
            }
            return _mapper.Map<IEnumerable<PromotionResponse>>(promotions);
        }

        public async Task<PromotionResponse> GetPromotionByIdAsync(int promotionId)
        {
            var promotion = await _promotionRepository.GetByIdAsync(promotionId);
            if (promotion == null)
            {
                throw new ApplicationException("Promoção não encontrada.");
            }
            return _mapper.Map<PromotionResponse>(promotion);
        }

        public async Task<PromotionResponse> CreatePromotionAsync(PromotionRequest request)
        {
            if (await _promotionRepository.GetByNameAsync(request.Name) != null)
            {
                throw new ApplicationException("Já existe uma promoção com este nome.");
            }

            var newPromotion = _mapper.Map<Promotion>(request);
            newPromotion.CreatedAt = DateTime.UtcNow;
            newPromotion.UpdatedAt = DateTime.UtcNow;

            await _promotionRepository.AddAsync(newPromotion);
            await _promotionRepository.SaveChangesAsync();

            return _mapper.Map<PromotionResponse>(newPromotion);
        }

        public async Task<PromotionResponse> UpdatePromotionAsync(int promotionId, PromotionRequest request)
        {
            var promotion = await _promotionRepository.GetByIdAsync(promotionId);
            if (promotion == null)
            {
                throw new ApplicationException("Promoção não encontrada.");
            }

            if (request.Name != promotion.Name && await _promotionRepository.GetByNameAsync(request.Name) != null)
            {
                throw new ApplicationException("Já existe outra promoção com este nome.");
            }

            _mapper.Map(request, promotion); 
            promotion.UpdatedAt = DateTime.UtcNow;

            _promotionRepository.Update(promotion);
            await _promotionRepository.SaveChangesAsync();

            return _mapper.Map<PromotionResponse>(promotion);
        }

        public async Task DeletePromotionAsync(int promotionId)
        {
            var promotion = await _promotionRepository.GetByIdAsync(promotionId);
            if (promotion == null)
            {
                throw new ApplicationException("Promoção não encontrada.");
            }
            _promotionRepository.Remove(promotion);
            await _promotionRepository.SaveChangesAsync();
        }
    }
}