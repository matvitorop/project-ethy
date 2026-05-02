using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using server.Application.IServices;

namespace server.Presentation.Controllers
{
    [ApiController]
    [Route("api/files/help-requests")]
    [Authorize]
    public class HelpRequestFilesController : ControllerBase
    {
        private readonly IImageStorageService _storage;

        public HelpRequestFilesController(IImageStorageService storage)
        {
            _storage = storage;
        }

        [HttpPost]
        public async Task<IActionResult> Upload([FromForm] List<IFormFile> files, CancellationToken ct)
        {
            if (files.Count == 0)
                return BadRequest("NO_FILES");

            if (files.Count > 5)
                return BadRequest("MAX_5_IMAGES");

            var urls = await _storage.SaveHelpRequestImagesAsync(files, ct);

            return Ok(new
            {
                imageUrls = urls
            });
        }

        [HttpPost("reports")]
        public async Task<IActionResult> UploadReportImage([FromForm] IFormFile file, CancellationToken ct)
        {
            if (file is null)
                return BadRequest("NO_FILE");

            try
            {
                var url = await _storage.SaveReportImageAsync(file, ct);
                return Ok(new { imageUrl = url });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
