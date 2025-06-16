using AutoMapper;
using CardapioDigital.Api.DTOs.Order;
using CardapioDigital.Api.DTOs.OrderItem;
using CardapioDigital.Api.Models;
using CardapioDigital.Api.Repositories.Interfaces;
using CardapioDigital.Api.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CardapioDigital.Api.Services
{
    public class OrderService : IOrderService
    {
        private readonly IOrderRepository _orderRepository;
        private readonly IUserRepository _userRepository;
        private readonly IAddressRepository _addressRepository;
        private readonly IMenuItemRepository _menuItemRepository;
        private readonly IAddonRepository _addonRepository;
        private readonly IMapper _mapper;

        public OrderService(IOrderRepository orderRepository, IUserRepository userRepository, IAddressRepository addressRepository, IMenuItemRepository menuItemRepository, IAddonRepository addonRepository, IMapper mapper)
        {
            _orderRepository = orderRepository;
            _userRepository = userRepository;
            _addressRepository = addressRepository;
            _menuItemRepository = menuItemRepository;
            _addonRepository = addonRepository;
            _mapper = mapper;
        }

        public async Task<IEnumerable<OrderResponse>> GetAllOrdersAsync(string status = null)
        {
            var orders = await _orderRepository.GetAllOrdersWithDetailsAsync(status);
            return _mapper.Map<IEnumerable<OrderResponse>>(orders);
        }

        public async Task<IEnumerable<OrderResponse>> GetUserOrdersAsync(int userId, string status = null)
        {
            var orders = await _orderRepository.GetUserOrdersWithDetailsAsync(userId, status);
            return _mapper.Map<IEnumerable<OrderResponse>>(orders);
        }

        public async Task<OrderResponse> GetOrderByIdAsync(int orderId, int? userId = null)
        {
            var order = await _orderRepository.GetByIdWithDetailsAsync(orderId);
            if (order == null)
            {
                throw new ApplicationException("Pedido não encontrado."); // Trocar por NotFoundException
            }
            if (userId.HasValue && order.UserId != userId.Value)
            {
                throw new UnauthorizedAccessException("Você não tem permissão para visualizar este pedido."); // Trocar por ForbiddenException
            }
            return _mapper.Map<OrderResponse>(order);
        }

        public async Task<OrderResponse> CreateOrderAsync(int userId, CreateOrderRequest request)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                throw new ApplicationException("Usuário não encontrado.");
            }

            var address = await _addressRepository.GetByIdAsync(request.AddressId);
            if (address == null || address.UserId != userId)
            {
                throw new ApplicationException("Endereço inválido ou não pertence ao usuário.");
            }

            if (request.Items == null || !request.Items.Any())
            {
                throw new ApplicationException("O pedido deve conter pelo menos um item.");
            }

            var newOrder = new Order
            {
                UserId = userId,
                AddressId = request.AddressId,
                PaymentMethod = request.PaymentMethod,
                DeliveryType = request.DeliveryType,
                Notes = request.Notes,
                Status = "pending", 
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            decimal totalAmount = 0;

            foreach (var itemRequest in request.Items)
            {
                var menuItem = await _menuItemRepository.GetByIdAsync(itemRequest.MenuItemId);
                if (menuItem == null || !menuItem.IsAvailable)
                {
                    throw new ApplicationException($"Item de menu com ID {itemRequest.MenuItemId} não encontrado ou indisponível.");
                }

                var orderItem = new OrderItem
                {
                    MenuItemId = itemRequest.MenuItemId,
                    Quantity = itemRequest.Quantity,
                    Price = menuItem.Price, 
                    Notes = itemRequest.Notes,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                decimal itemTotal = menuItem.Price * itemRequest.Quantity;

                if (itemRequest.AddonIds != null && itemRequest.AddonIds.Any())
                {
                    foreach (var addonId in itemRequest.AddonIds)
                    {
                        var addon = await _addonRepository.GetByIdAsync(addonId);
                        if (addon == null || !addon.IsActive)
                        {
                            throw new ApplicationException($"Adicional com ID {addonId} não encontrado ou indisponível.");
                        }
                        orderItem.Addons.Add(addon);
                        itemTotal += addon.Price * itemRequest.Quantity; // Adiciona o preço do addon ao item total
                    }
                }
                newOrder.Items.Add(orderItem);
                totalAmount += itemTotal;
            }

            newOrder.TotalAmount = totalAmount;

            await _orderRepository.AddAsync(newOrder);
            await _orderRepository.SaveChangesAsync();

            return _mapper.Map<OrderResponse>(await _orderRepository.GetByIdWithDetailsAsync(newOrder.Id));
        }

        public async Task<OrderResponse> UpdateOrderStatusAsync(int orderId, UpdateOrderStatusRequest request)
        {
            var order = await _orderRepository.GetByIdAsync(orderId);
            if (order == null)
            {
                throw new ApplicationException("Pedido não encontrado.");
            }

            string[] validStatuses = { "pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled" };
            if (!validStatuses.Contains(request.Status))
            {
                throw new ApplicationException("Status de pedido inválido.");
            }

            order.Status = request.Status;
            order.UpdatedAt = DateTime.UtcNow;

            _orderRepository.Update(order);
            await _orderRepository.SaveChangesAsync();

            return _mapper.Map<OrderResponse>(order);
        }

        public async Task CancelOrderAsync(int orderId, int? userId = null)
        {
            var order = await _orderRepository.GetByIdAsync(orderId);
            if (order == null)
            {
                throw new ApplicationException("Pedido não encontrado.");
            }

            if (userId.HasValue && order.UserId != userId.Value)
            {
                throw new UnauthorizedAccessException("Você não tem permissão para cancelar este pedido.");
            }

            if (order.Status == "delivered" || order.Status == "cancelled")
            {
                throw new ApplicationException($"Não é possível cancelar um pedido com status '{order.Status}'.");
            }

            order.Status = "cancelled";
            order.UpdatedAt = DateTime.UtcNow;

            _orderRepository.Update(order);
            await _orderRepository.SaveChangesAsync();
        }
    }
}