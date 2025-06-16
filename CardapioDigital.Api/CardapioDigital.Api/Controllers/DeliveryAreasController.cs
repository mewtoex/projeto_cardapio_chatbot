using Microsoft.AspNetCore.Mvc;
using CardapioDigital.Api.DTOs.DeliveryArea;
using CardapioDigital.Api.Services.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using CardapioDigital.Api.Exceptions;

namespace CardapioDigital.Api.Controllers
{
    [ApiController]
    [Route("api/delivery-areas")] 
    public class DeliveryAreasController : ControllerBase
    {
        private readonly IDeliveryService _deliveryService;

        public DeliveryAreasController(IDeliveryService deliveryService)
        {
            _deliveryService = deliveryService;
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateDeliveryArea([FromBody] DeliveryAreaRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var newArea = await _deliveryService.CreateDeliveryAreaAsync(request);
            return StatusCode(201, newArea);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllDeliveryAreas()
        {
            var areas = await _deliveryService.GetAllDeliveryAreasAsync();
            return Ok(areas);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetDeliveryAreaById(int id)
        {
            var area = await _deliveryService.GetDeliveryAreaByIdAsync(id);
            return Ok(area);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")] 
        public async Task<IActionResult> UpdateDeliveryArea(int id, [FromBody] DeliveryAreaRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updatedArea = await _deliveryService.UpdateDeliveryAreaAsync(id, request);
            return Ok(updatedArea);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")] 
        public async Task<IActionResult> DeleteDeliveryArea(int id)
        {
            await _deliveryService.DeleteDeliveryAreaAsync(id);
            return NoContent(); 
        }
    }
}