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
                configBuilder.AddInMemoryCollection(new Dictionary<string, string?>
                {
                    { "ConnectionStrings:DefaultConnection", _msSqlContainer.GetConnectionString() },
                    { "JwtSettings:Key", "super-secret-key-that-is-very-long-for-testing" },
                    { "JwtSettings:Issuer", "TestIssuer" },
                    { "JwtSettings:Audience", "TestAudience" }
                });
            });

            builder.ConfigureServices(services =>
            {
                // Replace the real email sender with a mock to prevent sending real emails during integration tests
                services.RemoveAll<IEmailSender>();
                services.AddScoped(_ => EmailSenderMock.Object);
            });
        }

        public async Task InitializeAsync()
        {
            await _msSqlContainer.StartAsync();
        }

        public new async Task DisposeAsync()
        {
            await _msSqlContainer.DisposeAsync();
        }
    }
}
