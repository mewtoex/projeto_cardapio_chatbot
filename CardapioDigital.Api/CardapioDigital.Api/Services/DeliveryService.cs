using AutoMapper;
using CardapioDigital.Api.DTOs.DeliveryArea;
using CardapioDigital.Api.Models;
using CardapioDigital.Api.Repositories.Interfaces;
using CardapioDigital.Api.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CardapioDigital.Api.Services
{
    public class DeliveryService : IDeliveryService
    {
        private readonly IDeliveryAreaRepository _deliveryAreaRepository;
        private readonly IMapper _mapper;

        public DeliveryService(IDeliveryAreaRepository deliveryAreaRepository, IMapper mapper)
        {
            _deliveryAreaRepository = deliveryAreaRepository;
            _mapper = mapper;
        }

        public async Task<IEnumerable<DeliveryAreaResponse>> GetAllDeliveryAreasAsync()
        {
            var areas = await _deliveryAreaRepository.GetAllAsync();
            return _mapper.Map<IEnumerable<DeliveryAreaResponse>>(areas);
        }

        public async Task<DeliveryAreaResponse> GetDeliveryAreaByIdAsync(int areaId)
        {
            var area = await _deliveryAreaRepository.GetByIdAsync(areaId);
            if (area == null)
            {
                throw new ApplicationException("Área de entrega não encontrada.");
            }
            return _mapper.Map<DeliveryAreaResponse>(area);
        }

        public async Task<DeliveryAreaResponse> CreateDeliveryAreaAsync(DeliveryAreaRequest request)
        {
            if (await _deliveryAreaRepository.GetByNameAsync(request.Name) != null)
            {
                throw new ApplicationException("Já existe uma área de entrega com este nome.");
            }

            var newArea = _mapper.Map<DeliveryArea>(request);
            newArea.CreatedAt = DateTime.UtcNow;
            newArea.UpdatedAt = DateTime.UtcNow;

            await _deliveryAreaRepository.AddAsync(newArea);
            await _deliveryAreaRepository.SaveChangesAsync();

            return _mapper.Map<DeliveryAreaResponse>(newArea);
        }

        public async Task<DeliveryAreaResponse> UpdateDeliveryAreaAsync(int areaId, DeliveryAreaRequest request)
        {
            var area = await _deliveryAreaRepository.GetByIdAsync(areaId);
            if (area == null)
            {
                throw new ApplicationException("Área de entrega não encontrada.");
            }

            if (request.Name != area.Name && await _deliveryAreaRepository.GetByNameAsync(request.Name) != null)
            {
                throw new ApplicationException("Já existe outra área de entrega com este nome.");
            }

            _mapper.Map(request, area); 
            area.UpdatedAt = DateTime.UtcNow;

            _deliveryAreaRepository.Update(area);
            await _deliveryAreaRepository.SaveChangesAsync();

            return _mapper.Map<DeliveryAreaResponse>(area);
        }

        public async Task DeleteDeliveryAreaAsync(int areaId)
        {
            var area = await _deliveryAreaRepository.GetByIdAsync(areaId);
            if (area == null)
            {
                throw new ApplicationException("Área de entrega não encontrada.");
            }
            _deliveryAreaRepository.Remove(area);
            await _deliveryAreaRepository.SaveChangesAsync();
        }
    }
}