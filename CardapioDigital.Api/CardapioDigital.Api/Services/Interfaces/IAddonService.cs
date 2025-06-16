using CardapioDigital.Api.DTOs.Addon;
using CardapioDigital.Api.DTOs.AddonCategory;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CardapioDigital.Api.Services.Interfaces
{
    public interface IAddonService
    {
        Task<IEnumerable<AddonCategoryResponse>> GetAllAddonCategoriesAsync();
        Task<AddonCategoryResponse> GetAddonCategoryByIdAsync(int categoryId);
        Task<AddonCategoryResponse> CreateAddonCategoryAsync(AddonCategoryRequest request);
        Task<AddonCategoryResponse> UpdateAddonCategoryAsync(int categoryId, AddonCategoryRequest request);
        Task DeleteAddonCategoryAsync(int categoryId);

        Task<IEnumerable<AddonResponse>> GetAllAddonsAsync();
        Task<AddonResponse> GetAddonByIdAsync(int addonId);
        Task<AddonResponse> CreateAddonAsync(AddonRequest request);
        Task<AddonResponse> UpdateAddonAsync(int addonId, AddonRequest request);
        Task DeleteAddonAsync(int addonId);

        Task LinkAddonCategoryToMenuItemAsync(int menuItemId, int addonCategoryId);
        Task UnlinkAddonCategoryFromMenuItemAsync(int menuItemId, int addonCategoryId);
    }
}