using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Whale.API.Services;
using System;
using Whale.Shared.Models.Meeting;
using Whale.API.Models.Slack;

namespace Whale.API.Controllers.Slack
{
    public class SlackController : ControllerBase
    {
        private readonly SlackService _slackService;
        private readonly HttpService _httpService;
        private readonly string _baseURL;

        public SlackController(SlackService slackService, HttpService httpService)
        {
            _slackService = slackService;
            _httpService = httpService;

            _baseURL = "http://bsa2020-whale.westeurope.cloudapp.azure.com";
        }

        [Route("/api/slack/startMeeting")]
        [HttpPost]
        [Produces("application/json")]
        public async Task StartMeeting(SlackCommand userData)
        {
            var userEmail = userData.text;

            if (userEmail == null) await _slackService.SendSlackReplyAsync("You should to specify email. (ex. /whale user@gmail.com)", userData.channel_id);

            var meetingDTO = new MeetingCreateDTO() { CreatorEmail = userEmail, IsScheduled = false };

            try
            {
                var meetingLinkDTO = await _httpService.PostAsync<MeetingCreateDTO, MeetingLinkDTO>("api/meeting", meetingDTO);
                var link = $"{_baseURL}/meeting-page/%3Fid%3D{meetingLinkDTO.Id}&pwd%3D{meetingLinkDTO.Password}";

                await _slackService.SendSlackReplyAsync(link, userData.channel_id);
            }
            catch(Exception)
            {
                await _slackService.SendSlackReplyAsync("Some troubles happened", userData.channel_id);
            }
        }
    }
}
