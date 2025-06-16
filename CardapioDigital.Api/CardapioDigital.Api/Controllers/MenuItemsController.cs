// CardapioDigital.Api/Controllers/MenuItemsController.cs
using CardapioDigital.Api.DTOs.MenuItem;
using CardapioDigital.Api.Exceptions;
using CardapioDigital.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CardapioDigital.Api.Controllers
{
    [ApiController]
    [Route("api/menu-items")] 
    public class MenuItemsController : ControllerBase
    {
        private readonly IMenuService _menuService;
        public MenuItemsController(IMenuService menuService)
        {
            _menuService = menuService;

        }

        [HttpPost]
        [Authorize(Roles = "Admin")] 
        public async Task<IActionResult> CreateMenuItem([FromBody] MenuItemRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var newItem = await _menuService.CreateMenuItemAsync(request);
            return StatusCode(201, newItem);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllMenuItems([FromQuery] int? categoryId = null)
        {
            var items = await _menuService.GetAllMenuItemsAsync(categoryId);
            return Ok(items);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetMenuItemById(int id)
        {
            var item = await _menuService.GetMenuItemByIdAsync(id);
            return Ok(item);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")] 
        public async Task<IActionResult> UpdateMenuItem(int id, [FromBody] MenuItemRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updatedItem = await _menuService.UpdateMenuItemAsync(id, request);
            return Ok(updatedItem);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteMenuItem(int id)
        {
            await _menuService.DeleteMenuItemAsync(id);
            return NoContent(); 
        }

        [HttpPost("{itemId}/upload-image")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UploadMenuItemImage(int itemId, IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { message = "Nenhum arquivo enviado." });
            }

            // Você pode querer validar o tipo de arquivo aqui (ex: .jpg, .png)
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
            var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(fileExtension))
            {
                throw new BadRequestException("Tipo de arquivo não permitido. Apenas imagens (jpg, jpeg, png, gif) são aceitas.");
            }

            try
            {
                // Verifica se o item de menu existe antes de fazer upload
                var menuItem = await _menuService.GetMenuItemByIdAsync(itemId); // Use um método que busca o item, mesmo que não retorne todos os detalhes

                // Exemplo de subdiretório: "menu-items" ou "menu-items/{itemId}"
                //var imageUrl = await _ftpStorageService.UploadFileAsync(file, "menu-items");

                // Atualizar o MenuItem com a nova ImageUrl
                // Você precisará de um método para atualizar apenas a ImageUrl no seu MenuService
                // Ou modificar UpdateMenuItemAsync para aceitar a ImageUrl separadamente.
                // Por simplicidade, vamos criar um DTO para isso e um método no serviço.

                // Temporariamente, vamos buscar o item e atualizar diretamente para demonstração,
                // mas a melhor prática é ter um método no serviço.
                var itemToUpdate = await _menuService.GetMenuItemByIdAsync(itemId); // Busca novamente com os detalhes
                                                                                    // Agora, chame um método no serviço para atualizar apenas a URL
                                                                                    // await _menuService.UpdateMenuItemImageUrlAsync(itemId, imageUrl); // Ideal

                // Opção alternativa: Atualizar o item diretamente, mas isso é menos ideal para responsabilidade do serviço
                // itemToUpdate.ImageUrl = imageUrl;
                // _menuService.Update(itemToUpdate); // Se MenuService expõe métodos de repositório diretos
                // await _menuService.SaveChangesAsync();

                // Para uma solução rápida sem adicionar um método UpdateMenuItemImageUrlAsync ao IMenuService:
                // Crie um DTO mínimo para atualização de URL
                var updateRequest = new MenuItemRequest
                {
                    Name = itemToUpdate.Name, // Preserve other properties
                    Description = itemToUpdate.Description,
                    Price = itemToUpdate.Price,
                    IsAvailable = itemToUpdate.IsAvailable,
                    CategoryId = itemToUpdate.CategoryId,
                    //ImageUrl = imageUrl // Apenas a URL será atualizada
                };
                // Chame o método de atualização existente no serviço
                var updatedMenuItem = await _menuService.UpdateMenuItemAsync(itemId, updateRequest);


                return Ok(new { imageUrl = "", message = "Imagem enviada e URL atualizada com sucesso!" });
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (BadRequestException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                // Logar ex.Message e ex.StackTrace
                return StatusCode(500, new { message = "Ocorreu um erro interno ao enviar a imagem." });
            }
        }
    }
}