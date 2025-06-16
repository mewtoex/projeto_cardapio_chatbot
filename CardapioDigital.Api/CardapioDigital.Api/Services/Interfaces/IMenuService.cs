using CardapioDigital.Api.DTOs.MenuItem;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CardapioDigital.Api.Services.Interfaces
{
    public interface IMenuService
    {
        Task<IEnumerable<MenuItemResponse>> GetAllMenuItemsAsync(int? categoryId = null);
        Task<MenuItemResponse> GetMenuItemByIdAsync(int itemId);
        Task<MenuItemResponse> CreateMenuItemAsync(MenuItemRequest request);
        Task<MenuItemResponse> UpdateMenuItemAsync(int itemId, MenuItemRequest request);
        Task DeleteMenuItemAsync(int itemId);
    }
}