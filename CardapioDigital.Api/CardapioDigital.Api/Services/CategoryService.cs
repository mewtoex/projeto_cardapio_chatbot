using AutoMapper;
using CardapioDigital.Api.DTOs.Category;
using CardapioDigital.Api.Models;
using CardapioDigital.Api.Repositories.Interfaces;
using CardapioDigital.Api.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq; 

namespace CardapioDigital.Api.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly ICategoryRepository _categoryRepository;
        private readonly IMapper _mapper;

        public CategoryService(ICategoryRepository categoryRepository, IMapper mapper)
        {
            _categoryRepository = categoryRepository;
            _mapper = mapper;
        }

        public async Task<IEnumerable<CategoryResponse>> GetAllCategoriesAsync()
        {
            var categories = await _categoryRepository.GetAllAsync();
            return _mapper.Map<IEnumerable<CategoryResponse>>(categories);
        }

        public async Task<CategoryResponse> GetCategoryByIdAsync(int categoryId)
        {
            var category = await _categoryRepository.GetByIdAsync(categoryId);
            if (category == null)
            {
                throw new ApplicationException("Categoria não encontrada.");
            }
            return _mapper.Map<CategoryResponse>(category);
        }

        public async Task<CategoryResponse> CreateCategoryAsync(CategoryRequest request)
        {
            if (await _categoryRepository.GetByNameAsync(request.Name) != null)
            {
                throw new ApplicationException("Já existe uma categoria com este nome.");
            }

            var newCategory = _mapper.Map<Category>(request);
            newCategory.CreatedAt = DateTime.UtcNow;
            newCategory.UpdatedAt = DateTime.UtcNow;

            await _categoryRepository.AddAsync(newCategory);
            await _categoryRepository.SaveChangesAsync();

            return _mapper.Map<CategoryResponse>(newCategory);
        }

        public async Task<CategoryResponse> UpdateCategoryAsync(int categoryId, CategoryRequest request)
        {
            var category = await _categoryRepository.GetByIdAsync(categoryId);
            if (category == null)
            {
                throw new ApplicationException("Categoria não encontrada.");
            }

            if (request.Name != category.Name && await _categoryRepository.GetByNameAsync(request.Name) != null)
            {
                throw new ApplicationException("Já existe outra categoria com este nome.");
            }

            _mapper.Map(request, category); 
            category.UpdatedAt = DateTime.UtcNow;

            _categoryRepository.Update(category);
            await _categoryRepository.SaveChangesAsync();

            return _mapper.Map<CategoryResponse>(category);
        }

        public async Task DeleteCategoryAsync(int categoryId)
        {
            var category = await _categoryRepository.GetByIdAsync(categoryId);
            if (category == null)
            {
                throw new ApplicationException("Categoria não encontrada.");
            }
            _categoryRepository.Remove(category);
            await _categoryRepository.SaveChangesAsync();
        }
    }
}