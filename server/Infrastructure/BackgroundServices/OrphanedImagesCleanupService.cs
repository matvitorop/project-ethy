using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using server.Application.IRepositories;

namespace server.Infrastructure.BackgroundServices
{
    public class OrphanedImagesCleanupService : BackgroundService
    {
        private readonly Cloudinary _cloudinary;
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<OrphanedImagesCleanupService> _logger;

        public OrphanedImagesCleanupService(
            IConfiguration config,
            IServiceProvider serviceProvider,
            ILogger<OrphanedImagesCleanupService> logger)
        {
            var account = new Account(
                config["Cloudinary:CloudName"],
                config["Cloudinary:ApiKey"],
                config["Cloudinary:ApiSecret"]
            );
            _cloudinary = new Cloudinary(account);
            _cloudinary.Api.Secure = true;
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            await CleanupOrphanedImagesAsync();

            while (!stoppingToken.IsCancellationRequested)
            {
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
                var repository = scope.ServiceProvider
                    .GetRequiredService<IHelpRequestRepository>();

                // URL з БД → витягуємо PublicId
                var allImageUrls = await repository.GetAllImageUrlsAsync();
                var activePublicIds = allImageUrls
                    .Select(url => ExtractPublicId(url))
                    .ToHashSet();

                var nextCursor = (string?)null;
                int deletedCount = 0;

                do
                {
                    var result = await _cloudinary.ListResourcesAsync(
                        new ListResourcesByPrefixParams
                        {
                            Prefix = "ethy/help-requests/",
                            Type = "upload",
                            MaxResults = 100,
                            NextCursor = nextCursor,
                        }
                    );

                    foreach (var resource in result.Resources)
                    {
                        if (!activePublicIds.Contains(resource.PublicId))
                        {
                            var deleteParams = new DeletionParams(resource.PublicId)
                            {
                                ResourceType = ResourceType.Image
                            };
                            await _cloudinary.DestroyAsync(deleteParams);
                            deletedCount++;
                            _logger.LogDebug("Deleted orphaned image: {PublicId}", resource.PublicId);
                        }
                    }

                    nextCursor = result.NextCursor;

                } while (!string.IsNullOrEmpty(nextCursor));

                _logger.LogInformation("Orphaned cleanup finished. Deleted {Count} files.", deletedCount);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred during orphaned images cleanup.");
            }
        }

        private static string ExtractPublicId(string cloudinaryUrl)
        {
            if (string.IsNullOrEmpty(cloudinaryUrl) || !cloudinaryUrl.StartsWith("http"))
                return string.Empty;

            var uri = new Uri(cloudinaryUrl);
            var path = uri.AbsolutePath;
            var uploadIndex = path.IndexOf("/upload/");
            if (uploadIndex < 0) return string.Empty;

            var afterUpload = path[(uploadIndex + "/upload/".Length)..];

            if (afterUpload.StartsWith('v') && afterUpload.Length > 1 && char.IsDigit(afterUpload[1]))
            {
                var slashIndex = afterUpload.IndexOf('/');
                if (slashIndex >= 0)
                    afterUpload = afterUpload[(slashIndex + 1)..];
            }

            // Прибрати розширення — Cloudinary PublicId без нього
            return Path.ChangeExtension(afterUpload, null)
                .Replace('\\', '/');
        }
    }
}
