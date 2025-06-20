﻿using System.Threading.Tasks;

namespace CardapioDigital.Api.Services.Interfaces
{
    public interface IEmailService
    {
        Task SendEmailAsync(string toEmail, string subject, string message);
    }
}