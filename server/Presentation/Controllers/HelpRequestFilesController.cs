using GraphQL;
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
    }
}
