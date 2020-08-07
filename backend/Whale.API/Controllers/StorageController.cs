using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Whale.BLL.Providers;

namespace Whale.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StorageController : ControllerBase
    {
        private readonly FileStorageProvider _storageProvider;

        public StorageController(FileStorageProvider storageProvider)
        {
            _storageProvider = storageProvider;
        }

        [HttpPost]
        [Route("save")]
        public async Task<ActionResult<string>> Save()
        {
            var file = Request.Form.Files[0];
            return Ok(await _storageProvider.UploadFileAsync(file));
        }
    }
}
