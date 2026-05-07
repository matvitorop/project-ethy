namespace server.Application.IServices
{
    public interface IImageStorageService
    {
        Task<IReadOnlyList<string>> SaveHelpRequestImagesAsync(IReadOnlyList<IFormFile> files, CancellationToken ct);
        Task<IReadOnlyList<string>> CommitHelpRequestImagesAsync(IEnumerable<string> tempFileNames);
        Task<string> SaveReportImageAsync(IFormFile file, CancellationToken ct);
        Task<string> MoveReportImageFromTempAsync(string fileName, CancellationToken ct);
        Task<string> MoveVolunteerDocumentFromTempAsync(string fileName, CancellationToken ct);
    }
}
