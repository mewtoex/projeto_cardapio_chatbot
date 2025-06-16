using Microsoft.AspNetCore.Mvc;
using CardapioDigital.Api.DTOs.Auth;
using CardapioDigital.Api.Services.Interfaces;
using System.Threading.Tasks;
using System;
using CardapioDigital.Api.Exceptions; 

namespace CardapioDigital.Api.Controllers
{
    [ApiController] 
    [Route("api/[controller]")] 
    public class AuthController : ControllerBase 
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")] 
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState); 
            }

            try
            {
                var authResponse = await _authService.RegisterUserAsync(request);
                return StatusCode(201, authResponse);
            }
            catch (BadRequestException ex) 
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Ocorreu um erro interno durante o registro." });
            }
        }

        [HttpPost("login")] 
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var authResponse = await _authService.LoginUserAsync(request);
                return Ok(authResponse); 
            }
            catch (UnauthorizedException ex) 
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (BadRequestException ex) 
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Ocorreu um erro interno durante o login." });
            }
        }
    }
}