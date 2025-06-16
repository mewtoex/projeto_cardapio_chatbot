using CardapioDigital.Api.DTOs.Order;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CardapioDigital.Api.Services.Interfaces
{
    public interface IOrderService
    {
        Task<IEnumerable<OrderResponse>> GetAllOrdersAsync(string status = null);
        Task<IEnumerable<OrderResponse>> GetUserOrdersAsync(int userId, string status = null);
        Task<OrderResponse> GetOrderByIdAsync(int orderId, int? userId = null);
        Task<OrderResponse> CreateOrderAsync(int userId, CreateOrderRequest request);
        Task<OrderResponse> UpdateOrderStatusAsync(int orderId, UpdateOrderStatusRequest request);
        Task CancelOrderAsync(int orderId, int? userId = null);
    }
}