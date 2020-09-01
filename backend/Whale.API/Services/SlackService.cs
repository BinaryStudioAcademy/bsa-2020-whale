using Microsoft.Extensions.Configuration;
using SlackAPI;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Whale.API.Models.Slack;
using Whale.Shared.Services;
using SlackUser = SlackAPI.User;

namespace Whale.API.Services
{
    public class SlackService
    {
        private readonly SlackTaskClient _slackClient;
        private readonly IConfiguration _configuration;
        private readonly HttpClient _httpClient;
        private readonly UserService _userService;
        private string _slackUrl = "https://slack.com/api";

        public SlackService(IConfiguration configuration, HttpClient httpClient, UserService userService)
        {
            _configuration = configuration;
            _slackClient = new SlackTaskClient(_configuration.GetValue<string>("WhaleSlackBotToken"));
            _httpClient = httpClient;
            _userService = userService;
        }

        public async Task SendSlackReplyAsync(string text, string channel, string url = null, string meetingName = null)
        {
            var listBlock = new List<Block>();
            var innerMeetingName = string.Empty;

            _ = string.IsNullOrEmpty(meetingName) ? innerMeetingName = "Join a Meeting" : innerMeetingName = "Join a " + meetingName;

            if (url != null)
            {
                var block = new Block()
                {
                    type = "actions",
                    elements = new Element[] { new Element() {
                    type = "button",
                    text = new Text() {type = "plain_text", text = innerMeetingName},
                    style = "primary",
                    url = url
                    } }
                };
                listBlock.Add(block);
            }

            await _slackClient.PostMessageAsync(channel, text, null, null, false, listBlock.ToArray());
        }

        public async Task SendInvitationAsync(string channel, string url)
        {
            var listBlock = new List<Block>();

            if (url != null)
            {
                var firstBlock = new Block()
                {
                    type = "section",
                    text = new Text()
                    {
                        type = "mrkdwn",
                        text = @"Hello, unfortunately, we could not identify your credentials in the Whale application.       *Please sign up using the link below:*"
                    }
                };
                listBlock.Add(firstBlock);

                var secondBlock = new Block()
                {
                    type = "actions",
                    elements = new Element[] { new Element() {
                    type = "button",
                    text = new Text() {type = "plain_text", text = "Whale Meetings & Chat"},
                    style = "primary",
                    url = url
                    } }
                };
                listBlock.Add(secondBlock);
            }

            await _slackClient.PostMessageAsync(channel, "", null, null, false, listBlock.ToArray());
        }

        public async Task<SlackUser> GetUserProfileAsync(string userId)
        {
            var response = await _httpClient.GetAsync($"{_slackUrl}/users.profile.get?token={_configuration.GetValue<string>("WhaleSlackBotToken")}&user={userId}&pretty=1");
            if (response.StatusCode != HttpStatusCode.OK)
                throw new Exception($"{response.StatusCode}: {await response.Content.ReadAsStringAsync()}");
            return await response.Content.ReadAsAsync<SlackUser>();
        }

        public async Task<bool> ValidateUser(string userEmail)
        {
            var users = await _userService.GetAllUsers();
            return users.Where(x => x.Email.Equals(userEmail, StringComparison.InvariantCultureIgnoreCase)).Count() > 0;
        }

        public ExternalResponse GetExternalMessage(string text, string url)
        {
            var response = new ExternalResponse
            {
                Text = text,
                Url = url
            };

            return response;
        }
    }
}
