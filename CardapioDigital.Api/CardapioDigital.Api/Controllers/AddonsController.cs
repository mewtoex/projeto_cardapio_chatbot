using Microsoft.AspNetCore.Mvc;
using CardapioDigital.Api.DTOs.Addon;
using CardapioDigital.Api.DTOs.AddonCategory;
using CardapioDigital.Api.Services.Interfaces;
using System.Threading.Tasks;
using System;
using CardapioDigital.Api.Exceptions;
using Microsoft.AspNetCore.Authorization; 

namespace CardapioDigital.Api.Controllers
{
    [ApiController]
    [Route("api/addons")] 
    public class AddonsController : ControllerBase
    {
        private readonly IAddonService _addonService;

        public AddonsController(IAddonService addonService)
        {
            _addonService = addonService;
        }


        [HttpGet("categories")]
        [AllowAnonymous] 
        public async Task<IActionResult> GetAllAddonCategories()
        {
            try
            {
                var categories = await _addonService.GetAllAddonCategoriesAsync();
                return Ok(categories);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Ocorreu um erro interno ao buscar categorias de adicionais." });
            }
        }

        [HttpPost("categories")]
        [Authorize(Roles = "Admin")] 
        public async Task<IActionResult> CreateAddonCategory([FromBody] AddonCategoryRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var newCategory = await _addonService.CreateAddonCategoryAsync(request);
                return CreatedAtAction(nameof(GetAddonCategoryById), new { categoryId = newCategory.Id }, newCategory);
            }
            catch (ApplicationException ex) 
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Ocorreu um erro interno ao criar categoria de adicional." });
            }
        }

        [HttpGet("categories/{categoryId}")]
        [AllowAnonymous] 
        public async Task<IActionResult> GetAddonCategoryById(int categoryId)
        {
            try
            {
                var category = await _addonService.GetAddonCategoryByIdAsync(categoryId);
                return Ok(category);
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Ocorreu um erro interno ao buscar categoria de adicional." });
            }
        }

        [HttpPut("categories/{categoryId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateAddonCategory(int categoryId, [FromBody] AddonCategoryRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var updatedCategory = await _addonService.UpdateAddonCategoryAsync(categoryId, request);
                return Ok(updatedCategory);
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (ApplicationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Ocorreu um erro interno ao atualizar categoria de adicional." });
            }
        }

        [HttpDelete("categories/{categoryId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteAddonCategory(int categoryId)
        {
            try
            {
                await _addonService.DeleteAddonCategoryAsync(categoryId);
                return NoContent(); 
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (ApplicationException ex) 
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Ocorreu um erro interno ao deletar categoria de adicional." });
            }
        }


        [HttpPost("categories/{categoryId}/options")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateAddonOption(int categoryId, [FromBody] AddonRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            if (request.AddonCategoryId != 0 && request.AddonCategoryId != categoryId)
            {
                return BadRequest(new { message = "O ID da categoria de adicional no corpo da requisição não corresponde ao ID da rota." });
            }
            request.AddonCategoryId = categoryId;

            try
            {
                var newOption = await _addonService.CreateAddonAsync(request);
                return CreatedAtAction(nameof(GetAddonOptionById), new { optionId = newOption.Id }, newOption);
            }
            catch (NotFoundException ex) 
            {
                return NotFound(new { message = ex.Message });
            }
            catch (ApplicationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Ocorreu um erro interno ao criar opção de adicional." });
            }
        }

        [HttpGet("options/{optionId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetAddonOptionById(int optionId)
        {
            try
            {
                var option = await _addonService.GetAddonByIdAsync(optionId);
                return Ok(option);
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Ocorreu um erro interno ao buscar opção de adicional." });
            }
        }

        [HttpPut("options/{optionId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateAddonOption(int optionId, [FromBody] AddonRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var updatedOption = await _addonService.UpdateAddonAsync(optionId, request);
                return Ok(updatedOption);
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (ApplicationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Ocorreu um erro interno ao atualizar opção de adicional." });
            }
        }

        [HttpDelete("options/{optionId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteAddonOption(int optionId)
        {
            try
            {
                await _addonService.DeleteAddonAsync(optionId);
                return NoContent(); 
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (ApplicationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Ocorreu um erro interno ao deletar opção de adicional." });
            }
        }
    }
}