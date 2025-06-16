using CardapioDigital.Api.DTOs.Category;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CardapioDigital.Api.Services.Interfaces
{
    public interface ICategoryService
    {
        Task<IEnumerable<CategoryResponse>> GetAllCategoriesAsync();
        Task<CategoryResponse> GetCategoryByIdAsync(int categoryId);
        Task<CategoryResponse> CreateCategoryAsync(CategoryRequest request);
        Task<CategoryResponse> UpdateCategoryAsync(int categoryId, CategoryRequest request);
        Task DeleteCategoryAsync(int categoryId);
    }
}