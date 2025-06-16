using Microsoft.AspNetCore.Mvc;
using CardapioDigital.Api.Services.Interfaces;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using CardapioDigital.Api.Exceptions;
using CardapioDigital.Api.DTOs.Order; 
using System.Collections.Generic;

namespace CardapioDigital.Api.Controllers
{
    [ApiController]
    [Route("api/admin/dashboard")] 
    [Authorize(Roles = "Admin")] 
    public class AdminDashboardController : ControllerBase
    {
        private readonly IOrderService _orderService;
        private readonly IUserService _userService;
        private readonly IStoreService _storeService; 
        public AdminDashboardController(IOrderService orderService, IUserService userService, IStoreService storeService)
        {
            _orderService = orderService;
            _userService = userService;
            _storeService = storeService;
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetDashboardSummary()
        {
            try
            {
                var totalOrders = (await _orderService.GetAllOrdersAsync()).Count(); // Exemplo: obter contagem
                var totalUsers = (await _userService.GetAllUsersAsync()).Count(); // Exemplo: obter contagem
                var currentStoreInfo = await _storeService.GetStoreInfoAsync(); // Para exibir nome da loja, status, etc.

                return Ok(new
                {
                    TotalOrders = totalOrders,
                    TotalUsers = totalUsers,
                    StoreName = currentStoreInfo.Name,
                    StoreOperatingStatus = currentStoreInfo.OperatingStatus,
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Ocorreu um erro interno ao buscar o resumo do dashboard." });
            }
        }

        [HttpGet("recent-orders")]
        public async Task<IActionResult> GetRecentOrders([FromQuery] int limit = 10)
        {
            try
            {
                var recentOrders = (await _orderService.GetAllOrdersAsync()).Take(limit);
                return Ok(recentOrders);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Ocorreu um erro interno ao buscar pedidos recentes." });
            }
        }

    }
}