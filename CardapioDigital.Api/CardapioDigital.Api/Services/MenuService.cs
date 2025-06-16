using AutoMapper;
using CardapioDigital.Api.DTOs.MenuItem;
using CardapioDigital.Api.Models;
using CardapioDigital.Api.Repositories.Interfaces;
using CardapioDigital.Api.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CardapioDigital.Api.Services
{
    public class MenuService : IMenuService
    {
        private readonly IMenuItemRepository _menuItemRepository;
        private readonly ICategoryRepository _categoryRepository;
        private readonly IAddonCategoryRepository _addonCategoryRepository;
        private readonly IMapper _mapper;

        public MenuService(IMenuItemRepository menuItemRepository, ICategoryRepository categoryRepository, IAddonCategoryRepository addonCategoryRepository, IMapper mapper)
        {
            _menuItemRepository = menuItemRepository;
            _categoryRepository = categoryRepository;
            _addonCategoryRepository = addonCategoryRepository;
            _mapper = mapper;
        }

        public async Task<IEnumerable<MenuItemResponse>> GetAllMenuItemsAsync(int? categoryId = null)
        {
            var items = await _menuItemRepository.GetAllWithDetailsAsync(categoryId);
            return _mapper.Map<IEnumerable<MenuItemResponse>>(items);
        }

        public async Task<MenuItemResponse> GetMenuItemByIdAsync(int itemId)
        {
            var item = await _menuItemRepository.GetByIdWithDetailsAsync(itemId);
            if (item == null)
            {
                throw new ApplicationException("Item de menu não encontrado.");
            }
            return _mapper.Map<MenuItemResponse>(item);
        }

        public async Task<MenuItemResponse> CreateMenuItemAsync(MenuItemRequest request)
        {
            var category = await _categoryRepository.GetByIdAsync(request.CategoryId);
            if (category == null)
            {
                throw new ApplicationException("Categoria não encontrada.");
            }

            if (await _menuItemRepository.GetByNameAsync(request.Name) != null)
            {
                throw new ApplicationException("Já existe um item de menu com este nome.");
            }

            var newItem = _mapper.Map<MenuItem>(request);
            newItem.CreatedAt = DateTime.UtcNow;
            newItem.UpdatedAt = DateTime.UtcNow;

            if (request.AddonCategoryIds != null && request.AddonCategoryIds.Any())
            {
                foreach (var acId in request.AddonCategoryIds)
                {
                    var addonCategory = await _addonCategoryRepository.GetByIdAsync(acId);
                    if (addonCategory == null)
                    {
                        throw new ApplicationException($"Categoria de adicional com ID {acId} não encontrada.");
                    }
                    newItem.AddonCategories.Add(addonCategory);
                }
            }

            await _menuItemRepository.AddAsync(newItem);
            await _menuItemRepository.SaveChangesAsync();

            return _mapper.Map<MenuItemResponse>(await _menuItemRepository.GetByIdWithDetailsAsync(newItem.Id));
        }

        public async Task<MenuItemResponse> UpdateMenuItemAsync(int itemId, MenuItemRequest request)
        {
            var item = await _menuItemRepository.GetByIdWithDetailsAsync(itemId); // Carregar com detalhes para atualizar relacionamentos
            if (item == null)
            {
                throw new ApplicationException("Item de menu não encontrado.");
            }

            if (request.Name != item.Name && await _menuItemRepository.GetByNameAsync(request.Name) != null)
            {
                throw new ApplicationException("Já existe outro item de menu com este nome.");
            }

            if (request.CategoryId != item.CategoryId)
            {
                var newCategory = await _categoryRepository.GetByIdAsync(request.CategoryId);
                if (newCategory == null)
                {
                    throw new ApplicationException("Nova categoria não encontrada.");
                }
            }

            _mapper.Map(request, item); 
            item.UpdatedAt = DateTime.UtcNow;

            
            item.AddonCategories.Clear(); 
            if (request.AddonCategoryIds != null && request.AddonCategoryIds.Any())
            {
                foreach (var acId in request.AddonCategoryIds)
                {
                    var addonCategory = await _addonCategoryRepository.GetByIdAsync(acId);
                    if (addonCategory == null)
                    {
                        throw new ApplicationException($"Categoria de adicional com ID {acId} não encontrada.");
                    }
                    item.AddonCategories.Add(addonCategory);
                }
            }

            _menuItemRepository.Update(item);
            await _menuItemRepository.SaveChangesAsync();

            return _mapper.Map<MenuItemResponse>(item); 
        }

        public async Task DeleteMenuItemAsync(int itemId)
        {
            var item = await _menuItemRepository.GetByIdAsync(itemId);
            if (item == null)
            {
                throw new ApplicationException("Item de menu não encontrado.");
            }
            _menuItemRepository.Remove(item);
            await _menuItemRepository.SaveChangesAsync();
        }
    }
}