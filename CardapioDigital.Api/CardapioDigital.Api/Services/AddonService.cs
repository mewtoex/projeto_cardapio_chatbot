using AutoMapper;
using CardapioDigital.Api.DTOs.Addon;
using CardapioDigital.Api.DTOs.AddonCategory;
using CardapioDigital.Api.Models;
using CardapioDigital.Api.Repositories.Interfaces;
using CardapioDigital.Api.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq; 
using System.Threading.Tasks;

namespace CardapioDigital.Api.Services
{
    public class AddonService : IAddonService
    {
        private readonly IAddonCategoryRepository _addonCategoryRepository;
        private readonly IAddonRepository _addonRepository;
        private readonly IMenuItemRepository _menuItemRepository; 
        private readonly IMapper _mapper;

        public AddonService(IAddonCategoryRepository addonCategoryRepository,
                            IAddonRepository addonRepository,
                            IMenuItemRepository menuItemRepository, 
                            IMapper mapper)
        {
            _addonCategoryRepository = addonCategoryRepository;
            _addonRepository = addonRepository;
            _menuItemRepository = menuItemRepository;
            _mapper = mapper;
        }

        public async Task<IEnumerable<AddonCategoryResponse>> GetAllAddonCategoriesAsync()
        {
            var categories = await _addonCategoryRepository.GetAllAsync();
            return _mapper.Map<IEnumerable<AddonCategoryResponse>>(categories);
        }

        public async Task<AddonCategoryResponse> GetAddonCategoryByIdAsync(int categoryId)
        {
            var category = await _addonCategoryRepository.GetByIdWithAddonsAsync(categoryId); // Carrega addons também
            if (category == null)
            {
                throw new ApplicationException("Categoria de Adicional não encontrada.");
            }
            return _mapper.Map<AddonCategoryResponse>(category);
        }

        public async Task<AddonCategoryResponse> CreateAddonCategoryAsync(AddonCategoryRequest request)
        {
            if (await _addonCategoryRepository.GetByNameAsync(request.Name) != null)
            {
                throw new ApplicationException("Categoria de Adicional com este nome já existe.");
            }

            var newCategory = _mapper.Map<AddonCategory>(request);
            newCategory.CreatedAt = DateTime.UtcNow;
            newCategory.UpdatedAt = DateTime.UtcNow;

            await _addonCategoryRepository.AddAsync(newCategory);
            await _addonCategoryRepository.SaveChangesAsync();
            return _mapper.Map<AddonCategoryResponse>(newCategory);
        }

        public async Task<AddonCategoryResponse> UpdateAddonCategoryAsync(int categoryId, AddonCategoryRequest request)
        {
            var category = await _addonCategoryRepository.GetByIdAsync(categoryId);
            if (category == null)
            {
                throw new ApplicationException("Categoria de Adicional não encontrada.");
            }

            if (request.Name != category.Name)
            {
                if (await _addonCategoryRepository.GetByNameAsync(request.Name) != null)
                {
                    throw new ApplicationException("Categoria de Adicional com este nome já existe.");
                }
            }

            _mapper.Map(request, category); 
            category.UpdatedAt = DateTime.UtcNow;

            _addonCategoryRepository.Update(category);
            await _addonCategoryRepository.SaveChangesAsync();
            return _mapper.Map<AddonCategoryResponse>(category);
        }

        public async Task DeleteAddonCategoryAsync(int categoryId)
        {
            var category = await _addonCategoryRepository.GetByIdAsync(categoryId);
            if (category == null)
            {
                throw new ApplicationException("Categoria de Adicional não encontrada.");
            }

            _addonCategoryRepository.Remove(category);
            await _addonCategoryRepository.SaveChangesAsync();
        }

        // Addon operations
        public async Task<IEnumerable<AddonResponse>> GetAllAddonsAsync()
        {
            var addons = await _addonRepository.GetAllAsync();
            return _mapper.Map<IEnumerable<AddonResponse>>(addons);
        }

        public async Task<AddonResponse> GetAddonByIdAsync(int addonId)
        {
            var addon = await _addonRepository.GetByIdAsync(addonId);
            if (addon == null)
            {
                throw new ApplicationException("Adicional não encontrado.");
            }
            return _mapper.Map<AddonResponse>(addon);
        }

        public async Task<AddonResponse> CreateAddonAsync(AddonRequest request)
        {
            var addonCategory = await _addonCategoryRepository.GetByIdAsync(request.AddonCategoryId);
            if (addonCategory == null)
            {
                throw new ApplicationException("Categoria de Adicional não encontrada para o ID fornecido.");
            }


            var newAddon = _mapper.Map<Addon>(request);
            newAddon.CreatedAt = DateTime.UtcNow;
            newAddon.UpdatedAt = DateTime.UtcNow;

            await _addonRepository.AddAsync(newAddon);
            await _addonRepository.SaveChangesAsync();
            return _mapper.Map<AddonResponse>(newAddon);
        }

        public async Task<AddonResponse> UpdateAddonAsync(int addonId, AddonRequest request)
        {
            var addon = await _addonRepository.GetByIdAsync(addonId);
            if (addon == null)
            {
                throw new ApplicationException("Adicional não encontrado.");
            }

            if (request.AddonCategoryId != addon.AddonCategoryId)
            {
                var newAddonCategory = await _addonCategoryRepository.GetByIdAsync(request.AddonCategoryId);
                if (newAddonCategory == null)
                {
                    throw new ApplicationException("Nova Categoria de Adicional não encontrada.");
                }
            }

            
            _mapper.Map(request, addon); 
            addon.UpdatedAt = DateTime.UtcNow;

            _addonRepository.Update(addon);
            await _addonRepository.SaveChangesAsync();
            return _mapper.Map<AddonResponse>(addon);
        }

        public async Task DeleteAddonAsync(int addonId)
        {
            var addon = await _addonRepository.GetByIdAsync(addonId);
            if (addon == null)
            {
                throw new ApplicationException("Adicional não encontrado.");
            }

            _addonRepository.Remove(addon);
            await _addonRepository.SaveChangesAsync();
        }

        public async Task LinkAddonCategoryToMenuItemAsync(int menuItemId, int addonCategoryId)
        {
            var menuItem = await _menuItemRepository.GetByIdWithDetailsAsync(menuItemId); 
            if (menuItem == null)
            {
                throw new ApplicationException("Item de Menu não encontrado.");
            }

            var addonCategory = await _addonCategoryRepository.GetByIdAsync(addonCategoryId);
            if (addonCategory == null)
            {
                throw new ApplicationException("Categoria de Adicional não encontrada.");
            }

            if (!menuItem.AddonCategories.Any(ac => ac.Id == addonCategoryId))
            {
                menuItem.AddonCategories.Add(addonCategory);
                _menuItemRepository.Update(menuItem);
                await _menuItemRepository.SaveChangesAsync();
            }
        }

        public async Task UnlinkAddonCategoryFromMenuItemAsync(int menuItemId, int addonCategoryId)
        {
            var menuItem = await _menuItemRepository.GetByIdWithDetailsAsync(menuItemId);
            if (menuItem == null)
            {
                throw new ApplicationException("Item de Menu não encontrado.");
            }

            var addonCategoryToRemove = menuItem.AddonCategories.FirstOrDefault(ac => ac.Id == addonCategoryId);
            if (addonCategoryToRemove != null)
            {
                menuItem.AddonCategories.Remove(addonCategoryToRemove);
                _menuItemRepository.Update(menuItem);
                await _menuItemRepository.SaveChangesAsync();
            }
        }
    }
}