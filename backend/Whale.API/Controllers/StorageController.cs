using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Whale.API.Providers;

namespace Whale.API.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class StorageController : ControllerBase
    {
        private readonly FileStorageProvider _storageProvider;

        public StorageController(FileStorageProvider storageProvider)
        {
            _storageProvider = storageProvider;
        }

        [HttpPost]
        [RequestSizeLimit(500_000_000)]
        [Route("save")]
        public async Task<ActionResult<string>> Save()
        {
            var file = Request.Form.Files[0];
            return Ok(await _storageProvider.UploadFileAsync(file));
        }

        [HttpPost]
        [Route("save/mp3")]
        public async Task<ActionResult<string>> SaveAudio()
        {
            var file = Request.Form.Files[0];
            return Ok(await _storageProvider.UploadAudioFileAsync(file));
        }
    }
}
