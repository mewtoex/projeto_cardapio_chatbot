using Xunit;
using Moq;
using System.Threading.Tasks;
using System;
using CardapioDigital.Api.DTOs.Auth;
using CardapioDigital.Api.DTOs.Client;
using CardapioDigital.Api.Models;
using CardapioDigital.Api.Repositories.Interfaces;
using CardapioDigital.Api.Services;
using CardapioDigital.Api.Services.Interfaces;
using CardapioDigital.Api.Exceptions;
using CardapioDigital.Api.Data; 
using Microsoft.EntityFrameworkCore;
using CardapioDigital.Api.Services.Interfaces;
public class AuthServiceTests
{
    private readonly Mock<IUserRepository> _mockUserRepository;
    private readonly Mock<IClientRepository> _mockClientRepository;
    private readonly Mock<ISecurityService> _mockSecurityService;
    private readonly Mock<IEmailService> _mockEmailService;
    private readonly ApplicationDbContext _dbContext;
    private readonly AuthService _authService;

    public AuthServiceTests()
    {
        _mockUserRepository = new Mock<IUserRepository>();
        _mockClientRepository = new Mock<IClientRepository>();
        _mockSecurityService = new Mock<ISecurityService>();
        _mockEmailService = new Mock<IEmailService>(); 

        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        _dbContext = new ApplicationDbContext(options);

        _authService = new AuthService(
            _mockUserRepository.Object,
            _mockClientRepository.Object,
            _mockSecurityService.Object,
            _mockEmailService.Object, 
            _dbContext
        );
    }

    [Fact] 
    public async Task RegisterUserAsync_ShouldCreateUserAndClient_WhenDataIsValidAndUnique()
    {
        var registerRequest = new RegisterRequest
        {
            Username = "testuser",
            Email = "test@example.com",
            Password = "SecurePassword123",
            ClientData = new CreateClientRequest
            {
                FirstName = "Test",
                LastName = "User",
                CPF = "12345678900"
            }
        };

        _mockUserRepository.Setup(r => r.GetByUsernameAsync(It.IsAny<string>())).ReturnsAsync((User)null);
        _mockUserRepository.Setup(r => r.GetByEmailAsync(It.IsAny<string>())).ReturnsAsync((User)null);
        _mockClientRepository.Setup(r => r.GetByCPFAsync(It.IsAny<string>())).ReturnsAsync((Client)null);

        _mockSecurityService.Setup(s => s.HashPassword(It.IsAny<string>())).Returns("hashedpassword");
        _mockSecurityService.Setup(s => s.GenerateJwtToken(It.IsAny<User>())).Returns("mock.jwt.token");

        var result = await _authService.RegisterUserAsync(registerRequest);

        Assert.NotNull(result);
        Assert.Equal("testuser", result.Username);
        Assert.Equal("test@example.com", result.Email);
        Assert.NotNull(result.Token);

        _mockUserRepository.Verify(r => r.AddAsync(It.IsAny<User>()), Times.Once);
        _mockUserRepository.Verify(r => r.SaveChangesAsync(), Times.Once); 
    }

    [Fact]
    public async Task RegisterUserAsync_ShouldThrowBadRequestException_WhenUsernameExists()
    {
        var registerRequest = new RegisterRequest
        {
            Username = "existinguser",
            Email = "test@example.com",
            Password = "SecurePassword123",
            ClientData = new CreateClientRequest { FirstName = "F", LastName = "L", CPF = "123" }
        };
        _mockUserRepository.Setup(r => r.GetByUsernameAsync(It.IsAny<string>())).ReturnsAsync(new User { Username = "existinguser" });

        await Assert.ThrowsAsync<BadRequestException>(() => _authService.RegisterUserAsync(registerRequest));
        _mockUserRepository.Verify(r => r.AddAsync(It.IsAny<User>()), Times.Never); // Garante que AddAsync não foi chamado
    }

    [Fact]
    public async Task LoginUserAsync_ShouldReturnAuthResponse_WhenCredentialsAreValid()
    {
        var loginRequest = new LoginRequest { UsernameOrEmail = "testuser", Password = "ValidPassword123" };
        var user = new User { Id = 1, Username = "testuser", Email = "test@example.com", PasswordHash = "hashedpassword", Role = "client", IsActive = true };

        _mockUserRepository.Setup(r => r.GetByUsernameAsync(It.IsAny<string>())).ReturnsAsync(user);
        _mockSecurityService.Setup(s => s.VerifyPassword("ValidPassword123", "hashedpassword")).Returns(true);
        _mockSecurityService.Setup(s => s.GenerateJwtToken(user)).Returns("valid.jwt.token");

        var result = await _authService.LoginUserAsync(loginRequest);

        Assert.NotNull(result);
        Assert.Equal(user.Id, result.UserId);
        Assert.Equal("valid.jwt.token", result.Token);
    }

    [Fact]
    public async Task LoginUserAsync_ShouldThrowUnauthorizedException_WhenCredentialsAreInvalid()
    {
        var loginRequest = new LoginRequest { UsernameOrEmail = "testuser", Password = "InvalidPassword" };
        var user = new User { Id = 1, Username = "testuser", Email = "test@example.com", PasswordHash = "hashedpassword", IsActive = true };

        _mockUserRepository.Setup(r => r.GetByUsernameAsync(It.IsAny<string>())).ReturnsAsync(user);
        _mockSecurityService.Setup(s => s.VerifyPassword("InvalidPassword", "hashedpassword")).Returns(false);

        await Assert.ThrowsAsync<UnauthorizedException>(() => _authService.LoginUserAsync(loginRequest));
    }

}