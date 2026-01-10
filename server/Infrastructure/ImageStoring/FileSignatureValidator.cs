namespace server.Infrastructure.ImageStoring
{
    public static class FileSignatureValidator
    {
        private static readonly Dictionary<string, List<byte[]>> _fileSignatures = new()
    {
        { ".jpeg", new List<byte[]> { new byte[] { 0xFF, 0xD8, 0xFF } } },
        { ".jpg",  new List<byte[]> { new byte[] { 0xFF, 0xD8, 0xFF } } },
        { ".png",  new List<byte[]> { new byte[] { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A } } },
        { ".gif",  new List<byte[]> { new byte[] { 0x47, 0x49, 0x46, 0x38 } } },
        { ".webp", new List<byte[]> { new byte[] { 0x52, 0x49, 0x46, 0x46 } } }
    };

        public static bool IsValidImage(Stream fileStream, string extension)
        {
            if (string.IsNullOrEmpty(extension)) return false;

            var ext = extension.ToLowerInvariant();
            if (!_fileSignatures.ContainsKey(ext)) return false;

            // read the beginning of the file
            fileStream.Position = 0;

            using var reader = new BinaryReader(fileStream, System.Text.Encoding.Default, leaveOpen: true);
            var headerBytes = reader.ReadBytes(_fileSignatures[ext].Max(m => m.Length));

            // reset stream position after reading
            fileStream.Position = 0;

            // if any signature matches
            return _fileSignatures[ext].Any(signature =>
                headerBytes.Take(signature.Length).SequenceEqual(signature)
            );
        }
    }
}
