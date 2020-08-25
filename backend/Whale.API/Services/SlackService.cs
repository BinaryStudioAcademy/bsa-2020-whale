using System.Threading.Tasks;
using SlackAPI;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;

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

        public async Task SendSlackReplyAsync(string text, string channel, string url = null)
        {
            var listBlock = new List<Block>();

            if (url != null)
            {
                var block = new Block()
                {
                    type = "actions",
                    elements = new Element[] { new Element() {
                    type = "button",
                    text = new Text() {type = "plain_text", text = "Join a Meeting"},
                    style = "",
                    url = url
                    } }
                };
                listBlock.Add(block);
            }

            await _slackClient.PostMessageAsync(channel, text, null, null, false, listBlock.ToArray());
        }
    }
}
