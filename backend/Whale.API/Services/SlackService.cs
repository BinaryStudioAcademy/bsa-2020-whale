using System.Threading.Tasks;
using SlackAPI;
using Microsoft.Extensions.Configuration;

namespace Whale.API.Services
{
    public class SlackService
    {
        private readonly SlackTaskClient _slackClient;
        private readonly IConfiguration _configuration;

        public SlackService(IConfiguration configuration)
        {
            _configuration = configuration;

            _slackClient = new SlackTaskClient(_configuration.GetValue<string>("WhaleSlackBotToken"));
        }

        public async Task SendSlackReplyAsync(string text, string channel)
        {
            await _slackClient.PostMessageAsync(channel, text);
        }
    }
}
