using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.DependencyInjection;
using server.Application.IRepositories;

namespace server.Infrastructure.BackgroundServices
{
    public class OrphanedImagesCleanupService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<OrphanedImagesCleanupService> _logger;
        private readonly string _webRoot;

        public OrphanedImagesCleanupService(
            IServiceProvider serviceProvider,
            ILogger<OrphanedImagesCleanupService> logger,
            IWebHostEnvironment env)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
            _webRoot = env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Orphaned Images Cleanup Service is starting.");

            // Run once on startup
            await CleanupOrphanedImagesAsync();

            while (!stoppingToken.IsCancellationRequested)
            {
                // Run every 24 hours
                await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
                await CleanupOrphanedImagesAsync();
            }
        }

        private async Task CleanupOrphanedImagesAsync()
        {
            _logger.LogInformation("Starting orphaned images cleanup...");

            try
            {
                using var scope = _serviceProvider.CreateScope();
                var repository = scope.ServiceProvider.GetRequiredService<IHelpRequestRepository>();

                // 1. Get all image URLs from database
                var allImageUrls = await repository.GetAllImageUrlsAsync();
                var activeFileNames = allImageUrls
                    .Select(url => Path.GetFileName(url))
                    .ToHashSet();

                // 2. Scan help-requests directory
                var helpRequestsDir = Path.Combine(_webRoot, "uploads", "help-requests");
                if (!Directory.Exists(helpRequestsDir))
                {
                    _logger.LogInformation("Directory {Directory} does not exist. Skipping.", helpRequestsDir);
                    return;
                }

                var filesOnDisk = Directory.GetFiles(helpRequestsDir);
                int deletedCount = 0;

                foreach (var filePath in filesOnDisk)
                {
                    var fileName = Path.GetFileName(filePath);
                    if (!activeFileNames.Contains(fileName))
                    {
                        try
                        {
                            File.Delete(filePath);
                            deletedCount++;
                            _logger.LogDebug("Deleted orphaned image: {FileName}", fileName);
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex, "Failed to delete file {FilePath}", filePath);
                        }
                    }
                }

                _logger.LogInformation("Orphaned images cleanup finished. Deleted {Count} files.", deletedCount);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred during orphaned images cleanup.");
            }
        }
    }
}
