using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing; 
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System.Linq;
using CardapioDigital.Api.Data; 
using CardapioDigital.Api.Models; 
using CardapioDigital.Api.Services.Interfaces;
using Moq; 
using CardapioDigital.Api.Services.Email;

public class CustomWebApplicationFactory<TProgram> : WebApplicationFactory<TProgram> where TProgram : class
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            var descriptor = services.SingleOrDefault(
                d => d.ServiceType ==
                    typeof(DbContextOptions<ApplicationDbContext>));

            if (descriptor != null)
            {
                services.Remove(descriptor);
            }

            services.AddDbContext<ApplicationDbContext>(options =>
            {
                options.UseInMemoryDatabase("InMemoryDbForTesting");
            });

            var emailServiceDescriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(IEmailService));
            if (emailServiceDescriptor != null)
            {
                services.Remove(emailServiceDescriptor);
            }
            services.AddSingleton(new Mock<IEmailService>().Object); 

            var sp = services.BuildServiceProvider();

            using (var scope = sp.CreateScope())
            {
                var scopedServices = scope.ServiceProvider;
                var db = scopedServices.GetRequiredService<ApplicationDbContext>();
                var logger = scopedServices
                    .GetRequiredService<ILogger<CustomWebApplicationFactory<TProgram>>>();

                db.Database.EnsureDeleted(); 
                db.Database.EnsureCreated(); 

                try
                {
                    // Seed do banco de dados para testes (popula com dados iniciais se precisar)
                    // db.Users.Add(new User { Username = "admin_test", Email = "admin_test@example.com", ... });
                    // db.SaveChanges();
                }
                catch (System.Exception ex)
                {
                    logger.LogError(ex, "An error occurred seeding the database with test data. Error: {Message}", ex.Message);
                }
            }
        });
    }
}