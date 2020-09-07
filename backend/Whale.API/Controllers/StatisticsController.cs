using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Nest;
using Whale.Shared.Models.ElasticModels.Statistics;
using Whale.Shared.Services;

namespace Whale.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class StatisticsController : ControllerBase
    {
        private readonly ElasticSearchService _elasticSearchService;

        public StatisticsController(ElasticSearchService elasticSearchService)
        {
            _elasticSearchService = elasticSearchService;
        }

        [HttpGet("{startDate}/{endDate}")]
        public async Task<ActionResult<IEnumerable<DateHistogramBucket>>> GetByUser(long startDate, long endDate)
        {
            var email = HttpContext?.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value;
            var offset = DateTime.Now.Subtract(DateTime.UtcNow);
            return Ok(await _elasticSearchService.SearchStatistics(email, new DateTime(startDate).Add(offset), new DateTime(endDate).Add(offset)));
        }
    }
}