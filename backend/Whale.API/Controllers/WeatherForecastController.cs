using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Whale.API.Models;
using Whale.BLL.Services.Storage;

namespace Whale.API.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class WeatherForecastController : ControllerBase
    {
        private static readonly string[] Summaries = new[]
        {
            "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
        };

        private readonly ILogger<WeatherForecastController> _logger;
        private readonly BlobService _blobService;

        public WeatherForecastController(ILogger<WeatherForecastController> logger, BlobService blobService)
        {
            _logger = logger;
            _blobService = blobService;
        }

        [HttpGet]
        public IEnumerable<WeatherForecast> Get()
        {
            var rng = new Random();
            return Enumerable.Range(1, 5).Select(index => new WeatherForecast
            {
                Date = DateTime.Now.AddDays(index),
                TemperatureC = rng.Next(-20, 55),
                Summary = Summaries[rng.Next(Summaries.Length)]
            })
            .ToArray();
        }

        [HttpPost]
        [Route("save")]
        public async Task<ActionResult<string>> Save()
        {
            var file = Request.Form.Files[0];
            return Ok(await _blobService.SaveImage(file));
        }

        [HttpGet]
        [Route("get/{fileName}")]
        public async Task<ActionResult<string>> Save(string fileName)
        {
            return Ok(await _blobService.GetImage(fileName));
        }
    }
}
