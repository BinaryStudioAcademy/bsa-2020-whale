using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Nest;
using Whale.Shared.Models.Statistics;
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

        [HttpGet]
        public async Task<ActionResult<IEnumerable<DateHistogramBucket>>> GetByUser()
        {
            var email = HttpContext?.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value;
            return Ok(await _elasticSearchService.SearchStatistics(email));
        }
    }
}