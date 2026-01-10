namespace server.Application.IServices
{
    public interface IImageStorageService
    {
        Task<IReadOnlyList<string>> SaveHelpRequestImagesAsync(IReadOnlyList<IFormFile> files, CancellationToken ct);
        Task<IReadOnlyList<string>> CommitHelpRequestImagesAsync(IEnumerable<string> tempFileNames);
    }
}
