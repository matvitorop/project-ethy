using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Moq;
using server.Application.Handlers.RegisterUser;
using server.Application.IRepositories;
using server.Application.IServices;
using server.Application.Services;
using server.Domain;
using server.Domain.UserAndVolunteer;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace server.UnitTests.Application.Handlers
{
    public class RegisterUserHandlerTests
    {
        private readonly Mock<IUserRepository> _userRepositoryMock;
        private readonly Mock<IPasswordHasher> _passwordHasherMock;
        private readonly Mock<IEmailVerificationTokenRepository> _tokenRepositoryMock;
        private readonly Mock<IEmailSender> _emailSenderMock;
        private readonly Mock<IConfiguration> _configMock;

        private readonly RegisterUserHandler _handler;

        public RegisterUserHandlerTests()
        {
            _userRepositoryMock = new Mock<IUserRepository>();
            _passwordHasherMock = new Mock<IPasswordHasher>();
            _tokenRepositoryMock = new Mock<IEmailVerificationTokenRepository>();
            _emailSenderMock = new Mock<IEmailSender>();
            _configMock = new Mock<IConfiguration>();

            _handler = new RegisterUserHandler(
                _userRepositoryMock.Object,
                _passwordHasherMock.Object,
                _tokenRepositoryMock.Object,
                _emailSenderMock.Object,
                _configMock.Object);
        }

        [Fact]
        public async Task Handle_ShouldReturnFailure_WhenUserAlreadyExists()
        {
            // Arrange
            var command = new RegisterUserCommand("testuser", "test@example.com", "password123");
            
            // Mock existing user
            var existingUser = new User("existing", command.Email, "hash", "salt", UserRole.User);
            _userRepositoryMock.Setup(repo => repo.GetByEmailAsync(command.Email))
                .ReturnsAsync(existingUser);

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            result.IsSuccess.Should().BeFalse();
            result.Error.Code.Should().Be("User.USER_ALREADY_EXISTS");
            _userRepositoryMock.Verify(repo => repo.AddAsync(It.IsAny<User>()), Times.Never);
        }

        [Fact]
        public async Task Handle_ShouldReturnSuccess_WhenUserIsNew()
        {
            // Arrange
            var command = new RegisterUserCommand("newuser", "new@example.com", "password123");
            
            _userRepositoryMock.Setup(repo => repo.GetByEmailAsync(command.Email))
                .ReturnsAsync((User?)null);

            _passwordHasherMock.Setup(h => h.Hash(command.Password))
                .Returns(("hashed_password", "salt"));

            _configMock.Setup(c => c["Smtp:FrontendBaseUrl"]).Returns("http://localhost:5173");

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            result.IsSuccess.Should().BeTrue();
            result.Value.Should().BeEmpty(); // Because JWT is not returned until verification

            // Verify user was added
            _userRepositoryMock.Verify(repo => repo.AddAsync(It.Is<User>(u => 
                u.Email == command.Email && 
                u.Username == command.Username && 
                u.PasswordHash == "hashed_password")), Times.Once);

            // Verify token was saved
            _tokenRepositoryMock.Verify(repo => repo.AddAsync(It.IsAny<EmailVerificationToken>(), It.IsAny<CancellationToken>()), Times.Once);

            // Verify email was sent
            _emailSenderMock.Verify(sender => sender.SendEmailVerificationAsync(command.Email, command.Username, It.Is<string>(link => link.Contains("verify-email"))), Times.Once);
        }
    }
}
