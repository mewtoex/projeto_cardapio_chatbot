using CardapioDigital.Api.Data;
using CardapioDigital.Api.DTOs.Auth;
using CardapioDigital.Api.DTOs.Client;
using CardapioDigital.Api.Models;
using CardapioDigital.Api.Services.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.VisualStudio.TestPlatform.TestHost;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Xunit;

public class AuthControllerTests : IClassFixture<CustomWebApplicationFactory<Program>>
{
    private readonly HttpClient _client;
    private readonly CustomWebApplicationFactory<Program> _factory;

    public AuthControllerTests(CustomWebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Register_ShouldReturnCreatedAndCreateUser_WhenDataIsValid()
    {
        // Arrange
        var request = new RegisterRequest
        {
            Username = "newtestuser",
            Email = "newtest@example.com",
            Password = "NewSecurePassword123",
            ClientData = new CreateClientRequest
            {
                FirstName = "New",
                LastName = "Client",
                CPF = "00011122233"
            }
        };
        var content = new StringContent(JsonSerializer.Serialize(request), Encoding.UTF8, "application/json");

        // Act
        var response = await _client.PostAsync("/api/Auth/register", content);

        // Assert
        response.EnsureSuccessStatusCode();
        var responseString = await response.Content.ReadAsStringAsync();
        var authResponse = JsonSerializer.Deserialize<AuthResponse>(responseString, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });

        Assert.NotNull(authResponse);
        Assert.Equal("newtestuser", authResponse.Username);
        Assert.NotNull(authResponse.Token);

        using (var scope = _factory.Services.CreateScope())
        {
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var userInDb = dbContext.Users.FirstOrDefault(u => u.Username == "newtestuser");
            Assert.NotNull(userInDb);
            Assert.Equal("newtest@example.com", userInDb.Email);

            var clientInDb = dbContext.Clients.FirstOrDefault(c => c.UserId == userInDb.Id);
            Assert.NotNull(clientInDb);
            Assert.Equal("New", clientInDb.FirstName);
        }
    }

    [Fact]
    public async Task Register_ShouldReturnBadRequest_WhenUsernameAlreadyExists()
    {
        using (var scope = _factory.Services.CreateScope())
        {
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var securityService = scope.ServiceProvider.GetRequiredService<ISecurityService>();

            dbContext.Users.Add(new User { Username = "existinguser", Email = "existing@example.com", PasswordHash = securityService.HashPassword("Password123"), Role = "client", IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow });
            dbContext.Clients.Add(new Client { FirstName = "Existing", LastName = "User", CPF = "11122233344", UserId = 1, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow }); // Link to user 1 (assuming ID will be 1 if DB is clean)
            await dbContext.SaveChangesAsync();
        }

        var request = new RegisterRequest
        {
            Username = "existinguser",
            Email = "another@example.com",
            Password = "AnotherPassword",
            ClientData = new CreateClientRequest { FirstName = "A", LastName = "B", CPF = "99988877766" }
        };
        var content = new StringContent(JsonSerializer.Serialize(request), Encoding.UTF8, "application/json");

        var response = await _client.PostAsync("/api/Auth/register", content);

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var responseString = await response.Content.ReadAsStringAsync();
        Assert.Contains("Nome de usuário já existe.", responseString);
    }

}