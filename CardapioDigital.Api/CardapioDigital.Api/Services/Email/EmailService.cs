using Microsoft.Extensions.Configuration; 
using System.Net.Mail; 
using System.Net; 
using System.Threading.Tasks;
using CardapioDigital.Api.Services.Interfaces; 
using System;

namespace CardapioDigital.Api.Services.Email
{
    public class EmailService : IEmailService
    {
        private readonly SmtpSettings _smtpSettings;

        public EmailService(IConfiguration configuration)
        {
            _smtpSettings = new SmtpSettings();
            configuration.GetSection("SmtpSettings").Bind(_smtpSettings);

            // Validação básica
            if (string.IsNullOrEmpty(_smtpSettings.Host) || string.IsNullOrEmpty(_smtpSettings.UserName) || string.IsNullOrEmpty(_smtpSettings.Password))
            {
                throw new ArgumentNullException("As configurações de SMTP (Host, UserName, Password) não podem ser nulas ou vazias. Verifique o appsettings.json.");
            }
        }

        public async Task SendEmailAsync(string toEmail, string subject, string message)
        {
            using (var client = new SmtpClient(_smtpSettings.Host, _smtpSettings.Port))
            {
                client.EnableSsl = _smtpSettings.EnableSsl;
                client.Credentials = new NetworkCredential(_smtpSettings.UserName, _smtpSettings.Password);
                client.DeliveryMethod = SmtpDeliveryMethod.Network;

                using (var mailMessage = new MailMessage())
                {
                    mailMessage.From = new MailAddress(_smtpSettings.FromEmail, _smtpSettings.FromName);
                    mailMessage.To.Add(toEmail);
                    mailMessage.Subject = subject;
                    mailMessage.Body = message;
                    mailMessage.IsBodyHtml = true; 

                    await client.SendMailAsync(mailMessage);
                }
            }
        }
    }

    public class SmtpSettings
    {
        public string Host { get; set; }
        public int Port { get; set; }
        public bool EnableSsl { get; set; }
        public string UserName { get; set; }
        public string Password { get; set; }
        public string FromEmail { get; set; }
        public string FromName { get; set; }
    }
}