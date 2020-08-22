using Flurl.Http;
using System.Threading.Tasks;
using Whale.API.Models.Slack;

namespace Whale.API.Services
{
    public class SlackService
    {
        public async Task SendSlackReplyAsync(string text, string responseUrl)
        {
            var slackReply = new SlackReply() { text = text };

            await responseUrl.PostJsonAsync(slackReply);
        }
    }
}
