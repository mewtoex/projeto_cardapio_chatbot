using Microsoft.AspNetCore.Mvc;
using CardapioDigital.Api.DTOs.Promotion;
using CardapioDigital.Api.Services.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using CardapioDigital.Api.Exceptions;

namespace CardapioDigital.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PromotionsController : ControllerBase
    {
        private readonly IPromotionService _promotionService;

        public PromotionsController(IPromotionService promotionService)
        {
            _promotionService = promotionService;
        }

        [HttpPost]
        [Authorize(Roles = "Admin")] 
        public async Task<IActionResult> CreatePromotion([FromBody] PromotionRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var newPromotion = await _promotionService.CreatePromotionAsync(request);
            return StatusCode(201, newPromotion); 
        }

        [HttpGet]
        public async Task<IActionResult> GetAllPromotions([FromQuery] bool includeInactive = false)
        {
            var promotions = await _promotionService.GetAllPromotionsAsync(includeInactive);
            return Ok(promotions);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetPromotionById(int id)
        {
            var promotion = await _promotionService.GetPromotionByIdAsync(id);
            return Ok(promotion);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")] 
        public async Task<IActionResult> UpdatePromotion(int id, [FromBody] PromotionRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updatedPromotion = await _promotionService.UpdatePromotionAsync(id, request);
            return Ok(updatedPromotion);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")] 
        public async Task<IActionResult> DeletePromotion(int id)
        {
            await _promotionService.DeletePromotionAsync(id);
            return NoContent(); 
        }
    }
}