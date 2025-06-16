using Microsoft.AspNetCore.Mvc;
using CardapioDigital.Api.DTOs.Order;
using CardapioDigital.Api.Services.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using CardapioDigital.Api.Exceptions;
using System.Security.Claims; 
namespace CardapioDigital.Api.Controllers
{
    [ApiController]
    [Route("api/orders")] 
    [Authorize] 
    public class OrdersController : ControllerBase
    {
        private readonly IOrderService _orderService;

        public OrdersController(IOrderService orderService)
        {
            _orderService = orderService;
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
            {
                throw new UnauthorizedException("ID do usuário não encontrado no token de autenticação.");
            }
            return int.Parse(userIdClaim);
        }

        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = GetCurrentUserId();
            var newOrder = await _orderService.CreateOrderAsync(userId, request);
            return StatusCode(201, newOrder); 
        }

        [HttpGet]
        public async Task<IActionResult> GetUserOrders([FromQuery] string status = null)
        {
            var userId = GetCurrentUserId();
            var orders = await _orderService.GetUserOrdersAsync(userId, status);
            return Ok(orders);
        }

        [HttpGet("{orderId}")]
        public async Task<IActionResult> GetOrderById(int orderId)
        {
            var userId = GetCurrentUserId();
            var order = await _orderService.GetOrderByIdAsync(orderId, userId);
            return Ok(order);
        }

        [HttpPut("{orderId}/cancel")]
        public async Task<IActionResult> CancelOrder(int orderId)
        {
            var userId = GetCurrentUserId();
            await _orderService.CancelOrderAsync(orderId, userId);
            return Ok(new { message = "Pedido cancelado com sucesso." });
        }


        [HttpGet("admin/all")]
        [Authorize(Roles = "Admin")] 
        public async Task<IActionResult> GetAllOrdersAdmin([FromQuery] string status = null)
        {
            var orders = await _orderService.GetAllOrdersAsync(status);
            return Ok(orders);
        }

        [HttpGet("admin/{orderId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetOrderByIdAdmin(int orderId)
        {
            var order = await _orderService.GetOrderByIdAsync(orderId); // Não passa userId para admin
            return Ok(order);
        }

        [HttpPut("admin/{orderId}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateOrderStatus(int orderId, [FromBody] UpdateOrderStatusRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updatedOrder = await _orderService.UpdateOrderStatusAsync(orderId, request);
            return Ok(updatedOrder);
        }
    }
}