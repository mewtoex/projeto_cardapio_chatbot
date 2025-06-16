using Microsoft.AspNetCore.Mvc;
using CardapioDigital.Api.DTOs.Store;
using CardapioDigital.Api.Services.Interfaces;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization; 
using CardapioDigital.Api.Exceptions;

namespace CardapioDigital.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")] 
    public class StoreController : ControllerBase
    {
        private readonly IStoreService _storeService;

        public StoreController(IStoreService storeService)
        {
            _storeService = storeService;
        }

        [HttpGet("info")]
        public async Task<IActionResult> GetStoreInfo()
        {
            var storeInfo = await _storeService.GetStoreInfoAsync();
            return Ok(storeInfo);
        }

        [HttpPost("info")] 
        [HttpPut("info")] 
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateOrUpdateStoreInfo([FromBody] StoreRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updatedStore = await _storeService.CreateOrUpdateStoreInfoAsync(request);
            return Ok(updatedStore); 
        }

        [HttpGet("status")]
        public async Task<IActionResult> GetStoreOperatingStatus()
        {
            var statusInfo = await _storeService.GetOperatingStatusAsync();
            return Ok(statusInfo);
        }

        [HttpPut("status")]
        [Authorize(Roles = "Admin")] 
        public async Task<IActionResult> UpdateStoreStatus([FromBody] UpdateStoreStatusRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updatedStore = await _storeService.UpdateStoreStatusAsync(request);
            return Ok(updatedStore);
        }
    }
}