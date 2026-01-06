using server.Application.IServices;

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
            var root = Path.Combine(_env.WebRootPath, "uploads", "help-requests");

            if (!Directory.Exists(root))
            {
                Directory.CreateDirectory(root);
            }

            foreach (var file in files)
            {
                if (file.Length == 0) continue;

                var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
                if (string.IsNullOrEmpty(ext) || !_allowedExtensions.Contains(ext))
                {
                    throw new ArgumentException($"Invalid file extension: {ext}. Allowed: {string.Join(", ", _allowedExtensions)}");
                }

                var fileName = $"{Guid.NewGuid()}{ext}";
                var fullPath = Path.Combine(root, fileName);

                await using var stream = File.Create(fullPath);
                await file.CopyToAsync(stream, ct);

                result.Add($"/uploads/help-requests/{fileName}");
            }

            return result;
        }
    }
}