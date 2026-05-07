using server.Application.IServices;
using server.Infrastructure.ImageStoring;

namespace server.Infrastructure
{
    public class LocalImageStorageService : IImageStorageService
    {
        private readonly IWebHostEnvironment _env;
        private readonly string[] _allowedExtensions = { ".jpg", ".jpeg", ".png", ".gif", ".webp" };

        public LocalImageStorageService(IWebHostEnvironment env)
        {
            _env = env;
        }

        public async Task<IReadOnlyList<string>> SaveHelpRequestImagesAsync(IReadOnlyList<IFormFile> files, CancellationToken ct)
        {
            var result = new List<string>();
            var tempRoot = Path.Combine(_env.WebRootPath, "uploads", "temp");

            if (!Directory.Exists(tempRoot)) Directory.CreateDirectory(tempRoot);

            foreach (var file in files)
            {
                if (file.Length == 0) continue;

                var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
                if (!_allowedExtensions.Contains(ext))
                {
                    throw new ArgumentException($"Invalid extension: {ext}");
                }

                using (var stream = file.OpenReadStream())
                {
                    if (!FileSignatureValidator.IsValidImage(stream, ext))
                    {
                        throw new ArgumentException($"File {file.FileName} has invalid content/signature for type {ext}.");
                    }
                }

                var fileName = $"{Guid.NewGuid()}{ext}";
                var fullPath = Path.Combine(tempRoot, fileName);

                await using var streamDest = File.Create(fullPath);
                await file.CopyToAsync(streamDest, ct);

                result.Add(fileName);
            }

            return result;
        }

        public async Task<IReadOnlyList<string>> CommitHelpRequestImagesAsync(IEnumerable<string> tempFileNames)
        {
            var committedUrls = new List<string>();

            var tempPath = Path.Combine(_env.WebRootPath, "uploads", "temp");
            var finalPath = Path.Combine(_env.WebRootPath, "uploads", "help-requests");

            if (!Directory.Exists(finalPath)) Directory.CreateDirectory(finalPath);

            foreach (var fileName in tempFileNames)
            {
                var sourceFile = Path.Combine(tempPath, fileName);
                var destFile = Path.Combine(finalPath, fileName);

                if (File.Exists(sourceFile))
                {
                    File.Move(sourceFile, destFile);
                    committedUrls.Add($"/uploads/help-requests/{fileName}");
                }
                else
                {
                    throw new FileNotFoundException($"Temporary file not found or expired: {fileName}");
                }
            }

            return committedUrls;
        }

        public async Task<string> SaveReportImageAsync(IFormFile file, CancellationToken ct)
        {
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

            await using var stream = file.OpenReadStream();

            if (!FileSignatureValidator.IsValidImage(stream, extension))
                throw new InvalidOperationException("Invalid file signature");

            var uploadsDir = Path.Combine(_env.WebRootPath, "uploads", "reports");
            Directory.CreateDirectory(uploadsDir);

            var fileName = $"{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(uploadsDir, fileName);

            await using var fileStream = new FileStream(filePath, FileMode.Create);
            await file.CopyToAsync(fileStream, ct);

            return fileName;
        }

        public async Task<string> MoveReportImageFromTempAsync(string fileName, CancellationToken ct)
        {
            var tempPath = Path.Combine(_env.WebRootPath, "uploads", "temp", fileName);
            var reportsDir = Path.Combine(_env.WebRootPath, "uploads", "reports");

            Directory.CreateDirectory(reportsDir);

            var destPath = Path.Combine(reportsDir, fileName);

            if (!File.Exists(tempPath))
                throw new FileNotFoundException($"Temp file not found: {fileName}");

            File.Move(tempPath, destPath, overwrite: true);

            return fileName;
        }

        public async Task<string> MoveVolunteerDocumentFromTempAsync(string fileName, CancellationToken ct)
        {
            var tempPath = Path.Combine(_env.WebRootPath, "uploads", "temp", fileName);
            var destDir = Path.Combine(_env.WebRootPath, "uploads", "volunteer-documents");

            Directory.CreateDirectory(destDir);

            var destPath = Path.Combine(destDir, fileName);

            if (!File.Exists(tempPath))
                throw new FileNotFoundException($"Temp file not found: {fileName}");

            File.Move(tempPath, destPath, overwrite: true);
            return fileName;
        }
    }
}