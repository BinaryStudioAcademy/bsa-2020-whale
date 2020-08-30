using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using Whale.API.Models.Slack;
using Whale.API.Services;
using Whale.Shared.Models.Meeting;

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
            await _slackService.SendSlackReplyAsync("", userData.channel_id);

            var user = await _slackService.GetUserProfileAsync(userData.user_id);

            if (string.IsNullOrEmpty(user.profile.email) || !await _slackService.ValidateUser(user.profile.email))
            {
                await _slackService.SendInvitationAsync(userData.channel_id, _baseURL);
                return;
            }

            var meetingDTO = new MeetingCreateDTO() { CreatorEmail = user.profile.email, IsScheduled = false };

            try
            {
                var meetingLinkDTO = await _httpService.PostAsync<MeetingCreateDTO, MeetingLinkDTO>("api/meeting", meetingDTO);
                var link = $"{_baseURL}/meeting-page/%3Fid%3D{meetingLinkDTO.Id}&pwd%3D{meetingLinkDTO.Password}";

                await _slackService.SendSlackReplyAsync("", userData.channel_id, link);
            }
            catch (Exception)
            {
                await _slackService.SendSlackReplyAsync("Some troubles happened", userData.channel_id);
            }
        }

        [Route("/api/slack/interactivity")]
        [HttpPost]
        [Produces("application/json")]
        public async Task<OkResult> Interactivity(SlackCommand data)
        {
            //TODO the bot more interactive

            return Ok();
        }
    }
}
