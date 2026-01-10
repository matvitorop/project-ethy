
namespace server.Infrastructure.ImageStoring
{
    public class TemporaryFileCleanupService : BackgroundService
    {
        private readonly IWebHostEnvironment _env;
        private readonly ILogger<TemporaryFileCleanupService> _logger;
        private readonly TimeSpan _checkInterval = TimeSpan.FromHours(1);
        private readonly TimeSpan _fileTtl = TimeSpan.FromHours(1);

        public TemporaryFileCleanupService(IWebHostEnvironment env, ILogger<TemporaryFileCleanupService> logger)
        {
            _env = env;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    CleanupTempFiles();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred while cleaning up temp files.");
                }

                await Task.Delay(_checkInterval, stoppingToken);
            }
        }

        private void CleanupTempFiles()
        {
            var tempPath = Path.Combine(_env.WebRootPath, "uploads", "temp");
            if (!Directory.Exists(tempPath)) return;

            var files = Directory.GetFiles(tempPath);
            foreach (var file in files)
            {
                var fileInfo = new FileInfo(file);

                // file deleting if their age less than TTL
                if (fileInfo.CreationTimeUtc < DateTime.UtcNow.Subtract(_fileTtl))
                {
                    try
                    {
                        fileInfo.Delete();
                        _logger.LogInformation($"Deleted orphaned file: {fileInfo.Name}");
                    }
                    catch (IOException)
                    {
                        // busy file, skip
                    }
                }
            }
        }
    }
}
