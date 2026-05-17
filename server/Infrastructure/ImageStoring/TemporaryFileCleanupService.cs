
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;

namespace server.Infrastructure.ImageStoring
{
    public class TemporaryFileCleanupService : BackgroundService
    {
        private readonly Cloudinary _cloudinary;
        private readonly ILogger<TemporaryFileCleanupService> _logger;
        private readonly TimeSpan _checkInterval = TimeSpan.FromHours(1);
        private readonly TimeSpan _fileTtl = TimeSpan.FromHours(1);

        public TemporaryFileCleanupService(IConfiguration config, ILogger<TemporaryFileCleanupService> logger)
        {
            var account = new Account(
                config["Cloudinary:CloudName"],
                config["Cloudinary:ApiKey"],
                config["Cloudinary:ApiSecret"]
            );
            _cloudinary = new Cloudinary(account);
            _cloudinary.Api.Secure = true;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await CleanupTempFilesAsync(stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred while cleaning up temp files.");
                }

                await Task.Delay(_checkInterval, stoppingToken);
            }
        }

        private async Task CleanupTempFilesAsync(CancellationToken ct)
        {
            var cutoff = DateTime.UtcNow.Subtract(_fileTtl);
            var nextCursor = (string?)null;

            do
            {
                var result = await _cloudinary.ListResourcesAsync(
                    new ListResourcesByPrefixParams
                    {
                        Prefix = "ethy/temp/",
                        Type = "upload",
                        MaxResults = 100,
                        NextCursor = nextCursor,
                    },
                    ct
                );

                foreach (var resource in result.Resources)
                {
                    if (DateTime.TryParseExact(
                        resource.CreatedAt,
                        "MM/dd/yyyy HH:mm:ss",
                        System.Globalization.CultureInfo.InvariantCulture,
                        System.Globalization.DateTimeStyles.AssumeUniversal |
                        System.Globalization.DateTimeStyles.AdjustToUniversal,
                        out var createdAt))
                    {
                        var createdAtUtc = createdAt.ToUniversalTime();

                        if (createdAtUtc < cutoff)
                        {
                            var deleteParams = new DeletionParams(resource.PublicId)
                            {
                                ResourceType = ResourceType.Image
                            };
                            var deleteResult = await _cloudinary.DestroyAsync(deleteParams);
                            _logger.LogInformation("Deleted temp file: {PublicId}", resource.PublicId);
                        }
                    }
                }

                nextCursor = result.NextCursor;
            } while (!string.IsNullOrEmpty(nextCursor));
        }
    }
}
