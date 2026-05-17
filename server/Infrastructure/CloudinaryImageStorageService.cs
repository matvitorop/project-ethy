using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using server.Application.IServices;
using server.Infrastructure.ImageStoring;

namespace server.Infrastructure
{
    public class CloudinaryImageStorageService : IImageStorageService
    {
        private readonly Cloudinary _cloudinary;
        private readonly string[] _allowedExtensions = { ".jpg", ".jpeg", ".png", ".gif", ".webp" };

        public CloudinaryImageStorageService(IConfiguration config)
        {
            var account = new Account(
                config["Cloudinary:CloudName"],
                config["Cloudinary:ApiKey"],
                config["Cloudinary:ApiSecret"]
            );
            _cloudinary = new Cloudinary(account);
            _cloudinary.Api.Secure = true;
        }

        // Завантаження у тимчасову папку, повертає ім'я файлу (guid)
        public async Task<IReadOnlyList<string>> SaveHelpRequestImagesAsync(
            IReadOnlyList<IFormFile> files, CancellationToken ct)
        {
            var result = new List<string>();

            foreach (var file in files)
            {
                if (file.Length == 0) continue;

                var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
                if (!_allowedExtensions.Contains(ext))
                    throw new ArgumentException($"Invalid extension: {ext}");

                // Валідація сигнатури файлу
                using (var validationStream = file.OpenReadStream())
                {
                    if (!FileSignatureValidator.IsValidImage(validationStream, ext))
                        throw new ArgumentException(
                            $"File {file.FileName} has invalid content/signature for type {ext}.");
                }

                var fileName = Guid.NewGuid().ToString();
                var publicId = $"ethy/temp/{fileName}";

                await using var uploadStream = file.OpenReadStream();
                var uploadParams = new ImageUploadParams
                {
                    File = new FileDescription(file.FileName, uploadStream),
                    PublicId = publicId,
                    Overwrite = true,
                };

                var uploadResult = await _cloudinary.UploadAsync(uploadParams, ct);
                if (uploadResult.Error != null)
                    throw new InvalidOperationException(
                        $"Cloudinary upload failed: {uploadResult.Error.Message}");

                result.Add(uploadResult.SecureUrl.ToString());
            }

            return result;
        }

        // Переміщення з temp у help-requests, повертає повні URL
        public async Task<IReadOnlyList<string>> CommitHelpRequestImagesAsync(
    IEnumerable<string> tempUrls)
        {
            var committedUrls = new List<string>();

            foreach (var tempUrl in tempUrls)
            {
                var fromPublicIdWithExt = ExtractPublicId(tempUrl); // "ethy/temp/guid.png"
                var fromPublicId = Path.ChangeExtension(fromPublicIdWithExt, null); // "ethy/temp/guid"
                
                var fileName = fromPublicId.Split('/').Last(); // "guid"
                var toPublicId = $"ethy/help-requests/{fileName}";

                var renameResult = await _cloudinary.RenameAsync(fromPublicId, toPublicId);
                if (renameResult.Error != null)
                    throw new InvalidOperationException(
                        $"Cloudinary rename failed: {renameResult.Error.Message}");

                committedUrls.Add(renameResult.SecureUrl.ToString());
            }

            return committedUrls;
        }

        private static string ExtractPublicId(string cloudinaryUrl)
        {
            var uri = new Uri(cloudinaryUrl);
            var path = uri.AbsolutePath;
            var uploadIndex = path.IndexOf("/upload/");
            if (uploadIndex < 0)
                throw new InvalidOperationException($"Not a valid Cloudinary URL: {cloudinaryUrl}");

            var afterUpload = path[(uploadIndex + "/upload/".Length)..];

            // Видалити version якщо є (v1234567890/)
            if (afterUpload.StartsWith('v') && afterUpload.Length > 1 && char.IsDigit(afterUpload[1]))
            {
                var slashIndex = afterUpload.IndexOf('/');
                if (slashIndex >= 0)
                    afterUpload = afterUpload[(slashIndex + 1)..];
            }

            return afterUpload; // "ethy/temp/guid"
        }

        // Завантаження звіту напряму в reports, повертає повний URL
        public async Task<string> SaveReportImageAsync(IFormFile file, CancellationToken ct)
        {
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

            using (var validationStream = file.OpenReadStream())
            {
                if (!FileSignatureValidator.IsValidImage(validationStream, extension))
                    throw new InvalidOperationException("Invalid file signature");
            }

            var publicId = $"ethy/reports/{Guid.NewGuid()}";

            await using var uploadStream = file.OpenReadStream();
            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(file.FileName, uploadStream),
                PublicId = publicId,
                Overwrite = true,
            };

            var uploadResult = await _cloudinary.UploadAsync(uploadParams, ct);
            if (uploadResult.Error != null)
                throw new InvalidOperationException(
                    $"Cloudinary upload failed: {uploadResult.Error.Message}");

            return uploadResult.SecureUrl.ToString();
        }

        // Переміщення звіту з temp у reports, повертає повний URL
        public async Task<string> MoveReportImageFromTempAsync(string tempUrl, CancellationToken ct)
        {
            var fromPublicIdWithExt = ExtractPublicId(tempUrl);
            var fromPublicId = Path.ChangeExtension(fromPublicIdWithExt, null);
            
            var fileName = fromPublicId.Split('/').Last();
            var toPublicId = $"ethy/reports/{fileName}";

            var renameResult = await _cloudinary.RenameAsync(fromPublicId, toPublicId);
            if (renameResult.Error != null)
                throw new InvalidOperationException(
                    $"Cloudinary rename failed: {renameResult.Error.Message}");

            return renameResult.SecureUrl.ToString();
        }

        // Переміщення документа волонтера з temp у volunteer-documents, повертає повний URL
        public async Task<string> MoveVolunteerDocumentFromTempAsync(string tempUrl, CancellationToken ct)
        {
            var fromPublicIdWithExt = ExtractPublicId(tempUrl);
            var fromPublicId = Path.ChangeExtension(fromPublicIdWithExt, null);
            
            var fileName = fromPublicId.Split('/').Last();
            var toPublicId = $"ethy/volunteer-documents/{fileName}";

            var renameResult = await _cloudinary.RenameAsync(fromPublicId, toPublicId);
            if (renameResult.Error != null)
                throw new InvalidOperationException(
                    $"Cloudinary rename failed: {renameResult.Error.Message}");

            return renameResult.SecureUrl.ToString();
        }
    }

}
