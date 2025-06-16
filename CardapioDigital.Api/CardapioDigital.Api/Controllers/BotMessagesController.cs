using Microsoft.AspNetCore.Mvc;
using CardapioDigital.Api.DTOs.BotMessage;
using CardapioDigital.Api.Services.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using CardapioDigital.Api.Exceptions;

namespace CardapioDigital.Api.Controllers
{
    [ApiController]
    [Route("api/bot-messages")] 
    public class BotMessagesController : ControllerBase
    {
        private readonly IBotMessageService _botMessageService;

        public BotMessagesController(IBotMessageService botMessageService)
        {
            _botMessageService = botMessageService;
        }

        [HttpPost]
        [Authorize(Roles = "Admin")] 
        public async Task<IActionResult> CreateBotMessage([FromBody] BotMessageRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var newMessage = await _botMessageService.CreateBotMessageAsync(request);
            return StatusCode(201, newMessage);
        }

        [HttpGet]
        [Authorize(Roles = "Admin")] 
        public async Task<IActionResult> GetAllBotMessages()
        {
            var messages = await _botMessageService.GetAllBotMessagesAsync();
            return Ok(messages);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetBotMessageById(int id)
        {
            var message = await _botMessageService.GetBotMessageByIdAsync(id);
            return Ok(message);
        }

        [HttpGet("by-key/{messageKey}")]
        public async Task<IActionResult> GetBotMessageByKey(string messageKey)
        {
            var message = await _botMessageService.GetBotMessageByKeyAsync(messageKey);
            return Ok(message);
        }


        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")] 
        public async Task<IActionResult> UpdateBotMessage(int id, [FromBody] BotMessageRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Exceções tratadas pelo middleware
            var updatedMessage = await _botMessageService.UpdateBotMessageAsync(id, request);
            return Ok(updatedMessage);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteBotMessage(int id)
        {
            await _botMessageService.DeleteBotMessageAsync(id);
            return NoContent(); 
        }
    }
}