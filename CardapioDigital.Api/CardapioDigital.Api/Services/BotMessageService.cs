using AutoMapper;
using CardapioDigital.Api.DTOs.BotMessage;
using CardapioDigital.Api.Models;
using CardapioDigital.Api.Repositories.Interfaces;
using CardapioDigital.Api.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CardapioDigital.Api.Services
{
    public class BotMessageService : IBotMessageService
    {
        private readonly IBotMessageRepository _botMessageRepository;
        private readonly IMapper _mapper;

        public BotMessageService(IBotMessageRepository botMessageRepository, IMapper mapper)
        {
            _botMessageRepository = botMessageRepository;
            _mapper = mapper;
        }

        public async Task<IEnumerable<BotMessageResponse>> GetAllBotMessagesAsync()
        {
            var messages = await _botMessageRepository.GetAllAsync();
            return _mapper.Map<IEnumerable<BotMessageResponse>>(messages);
        }

        public async Task<BotMessageResponse> GetBotMessageByIdAsync(int messageId)
        {
            var message = await _botMessageRepository.GetByIdAsync(messageId);
            if (message == null)
            {
                throw new ApplicationException("Mensagem do bot não encontrada.");
            }
            return _mapper.Map<BotMessageResponse>(message);
        }

        public async Task<BotMessageResponse> GetBotMessageByKeyAsync(string messageKey)
        {
            var message = await _botMessageRepository.GetByMessageKeyAsync(messageKey);
            if (message == null)
            {
                throw new ApplicationException("Mensagem do bot com esta chave não encontrada.");
            }
            return _mapper.Map<BotMessageResponse>(message);
        }

        public async Task<BotMessageResponse> CreateBotMessageAsync(BotMessageRequest request)
        {
            if (await _botMessageRepository.GetByMessageKeyAsync(request.MessageKey) != null)
            {
                throw new ApplicationException("Já existe uma mensagem do bot com esta chave.");
            }

            var newMessage = _mapper.Map<BotMessage>(request);
            newMessage.CreatedAt = DateTime.UtcNow;
            newMessage.UpdatedAt = DateTime.UtcNow;

            await _botMessageRepository.AddAsync(newMessage);
            await _botMessageRepository.SaveChangesAsync();

            return _mapper.Map<BotMessageResponse>(newMessage);
        }

        public async Task<BotMessageResponse> UpdateBotMessageAsync(int messageId, BotMessageRequest request)
        {
            var message = await _botMessageRepository.GetByIdAsync(messageId);
            if (message == null)
            {
                throw new ApplicationException("Mensagem do bot não encontrada.");
            }

            if (request.MessageKey != message.MessageKey && await _botMessageRepository.GetByMessageKeyAsync(request.MessageKey) != null)
            {
                throw new ApplicationException("Já existe outra mensagem do bot com esta chave.");
            }

            _mapper.Map(request, message); 
            message.UpdatedAt = DateTime.UtcNow;

            _botMessageRepository.Update(message);
            await _botMessageRepository.SaveChangesAsync();

            return _mapper.Map<BotMessageResponse>(message);
        }

        public async Task DeleteBotMessageAsync(int messageId)
        {
            var message = await _botMessageRepository.GetByIdAsync(messageId);
            if (message == null)
            {
                throw new ApplicationException("Mensagem do bot não encontrada.");
            }
            _botMessageRepository.Remove(message);
            await _botMessageRepository.SaveChangesAsync();
        }
    }
}