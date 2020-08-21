using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Whale.API.Models;
using Whale.API.Services;

namespace Whale.API.Controllers
{
    public class SlackController : ControllerBase
    {
        private readonly SlackService _slackService;

        public SlackController(SlackService slackService)
        {
            _slackService = slackService;
        }

        [Route("/api/slack/command")]
        [HttpPost]
        [Produces("application/json")]
        public async Task<string> StartMeeting(SlackCommand userData)
        {
            var userEmail = userData.Text;

            var isValidEmail = _slackService.IsValidEmail(userEmail);

            if (isValidEmail)
                return "Correct email";

            return "Incorrect email";
        }
    }
}
