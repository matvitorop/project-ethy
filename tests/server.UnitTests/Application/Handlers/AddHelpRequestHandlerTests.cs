using FluentAssertions;
using Moq;
using server.Application.Handlers.AddHelpRequest;
using server.Application.IRepositories;
using server.Application.IServices;
using server.Domain.HelpRequest;
using server.Domain.Primitives;
using System;
using System.Collections.Generic;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace server.UnitTests.Application.Handlers
{
    public class AddHelpRequestHandlerTests
    {
        private readonly Mock<IHelpRequestRepository> _repositoryMock;
        private readonly Mock<IImageStorageService> _imageStorageMock;
        private readonly Mock<IUserRepository> _userRepositoryMock;
        private readonly AddHelpRequestHandler _handler;

        public AddHelpRequestHandlerTests()
        {
            _repositoryMock = new Mock<IHelpRequestRepository>();
            _imageStorageMock = new Mock<IImageStorageService>();
            _userRepositoryMock = new Mock<IUserRepository>();
            
            _handler = new AddHelpRequestHandler(_repositoryMock.Object, _imageStorageMock.Object, _userRepositoryMock.Object);
        }

        [Fact]
        public async Task Handle_ShouldReturnSuccess_WithValidData()
        {
            // Arrange
            var creatorId = Guid.NewGuid();
            var command = new AddHelpRequestCommand(creatorId, "Test Title", "Test Description", 50.0, 30.0, new List<string> { "temp-image.jpg" });

            var permanentImages = new List<string> { "/uploads/permanent-image.jpg" };
            
            _imageStorageMock.Setup(s => s.CommitHelpRequestImagesAsync(command.ImageUrls))
                .ReturnsAsync(permanentImages);

            _userRepositoryMock.Setup(u => u.GetByIdAsync(creatorId, It.IsAny<CancellationToken>()))
                .ReturnsAsync((server.Domain.User)null); // Not hitting limit logic if null (though in real it should find user)

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            result.IsSuccess.Should().BeTrue();
            result.Value.Should().NotBeNull();
            result.Value.Title.Should().Be(command.Title);
            result.Value.ImageUrls.Should().ContainSingle().Which.Should().Be("/uploads/permanent-image.jpg");
            
            _repositoryMock.Verify(repo => repo.AddAsync(It.Is<HelpRequest>(hr => 
                hr.Title == command.Title && hr.CreatorId == creatorId), It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task Handle_ShouldReturnFailure_WhenImagesExpired()
        {
            // Arrange
            var command = new AddHelpRequestCommand(Guid.NewGuid(), "Title", "Desc", null, null, new List<string> { "expired.jpg" });

            _imageStorageMock.Setup(s => s.CommitHelpRequestImagesAsync(command.ImageUrls))
                .ThrowsAsync(new FileNotFoundException());

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            result.IsSuccess.Should().BeFalse();
            result.Error.Code.Should().Be("HelpRequest.IMAGE_WAS_EXPIRED");
            
            _repositoryMock.Verify(repo => repo.AddAsync(It.IsAny<HelpRequest>(), It.IsAny<CancellationToken>()), Times.Never);
        }
        [Fact]
        public async Task Handle_ShouldReturnFailure_WhenUserReachesLimit()
        {
            // Arrange
            var creatorId = Guid.NewGuid();
            var command = new AddHelpRequestCommand(creatorId, "Title", "Desc", null, null, new List<string>());

            var user = new server.Domain.User("test", "test@test.com", "hash", "salt", server.Domain.UserRole.User);
            
            _userRepositoryMock.Setup(u => u.GetByIdAsync(creatorId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(user);

            _repositoryMock.Setup(r => r.CountActiveRequestsByCreatorAsync(creatorId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(3);

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            result.IsSuccess.Should().BeFalse();
            result.Error.Code.Should().Be("HelpRequest.LIMIT_EXCEEDED");
            
            _repositoryMock.Verify(repo => repo.AddAsync(It.IsAny<HelpRequest>(), It.IsAny<CancellationToken>()), Times.Never);
        }
    }
}
