using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using server.Application.IServices;
using System.Collections.Generic;
using System.Threading.Tasks;
using Testcontainers.MsSql;
using Xunit;
using Moq;

namespace server.IntegrationTests
{
    public class CustomWebApplicationFactory : WebApplicationFactory<Program>, IAsyncLifetime
    {
        private readonly MsSqlContainer _msSqlContainer;
        public Mock<IEmailSender> EmailSenderMock { get; } = new Mock<IEmailSender>();
        public Mock<IImageStorageService> ImageStorageMock { get; } = new Mock<IImageStorageService>();

        public CustomWebApplicationFactory()
        {
            _msSqlContainer = new MsSqlBuilder()
                .WithImage("mcr.microsoft.com/mssql/server:2022-latest")
                .Build();
        }

        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.ConfigureAppConfiguration((context, configBuilder) =>
            {
                // Config is now passed via Environment Variables in InitializeAsync
                // to ensure Program.cs reads it at the very start of top-level statements.
            });

            builder.ConfigureServices(services =>
            {
                // Replace the real email sender with a mock to prevent sending real emails during integration tests
                services.RemoveAll<IEmailSender>();
                services.AddScoped(_ => EmailSenderMock.Object);

                // Replace the real image storage with a mock to prevent Cloudinary calls during integration tests
                services.RemoveAll<IImageStorageService>();
                services.AddScoped(_ => ImageStorageMock.Object);
            });

            // Setup mock behavior
            ImageStorageMock
                .Setup(x => x.CommitHelpRequestImagesAsync(It.IsAny<IEnumerable<string>>()))
                .ReturnsAsync((IEnumerable<string> urls) => urls?.ToList() ?? new List<string>());
        }

        public async Task InitializeAsync()
        {
            await _msSqlContainer.StartAsync();
            // We set these as environment variables so they are available immediately
            // when builder.Configuration is initialized in Program.cs
            System.Environment.SetEnvironmentVariable("ConnectionStrings__DefaultConnection", _msSqlContainer.GetConnectionString());
            System.Environment.SetEnvironmentVariable("JwtSettings__Key", "super-secret-key-that-is-very-long-for-testing");
            System.Environment.SetEnvironmentVariable("JwtSettings__Issuer", "TestIssuer");
            System.Environment.SetEnvironmentVariable("JwtSettings__Audience", "TestAudience");
            System.Environment.SetEnvironmentVariable("AdminSeed__Email", "admin@test.com");
            System.Environment.SetEnvironmentVariable("AdminSeed__Password", "AdminPassword123!");
        }

        public new async Task DisposeAsync()
        {
            await _msSqlContainer.DisposeAsync();
            System.Environment.SetEnvironmentVariable("ConnectionStrings__DefaultConnection", null);
            System.Environment.SetEnvironmentVariable("JwtSettings__Key", null);
            System.Environment.SetEnvironmentVariable("JwtSettings__Issuer", null);
            System.Environment.SetEnvironmentVariable("JwtSettings__Audience", null);
            System.Environment.SetEnvironmentVariable("AdminSeed__Email", null);
            System.Environment.SetEnvironmentVariable("AdminSeed__Password", null);
        }
    }
}
