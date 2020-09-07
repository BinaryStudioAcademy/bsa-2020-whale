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

        [Route("/slack/startMeeting")]
        [HttpPost]
        [Produces("application/json")]
        public async Task StartMeeting(SlackCommand userData)
        {
            await _slackService.SendSlackReplyAsync("", userData.Channel_id);

            var user = await _slackService.GetUserProfileAsync(userData.User_id);

            if (string.IsNullOrEmpty(user.profile.email) || !await _slackService.ValidateUserAsync(user.profile.email))
            {
                await _slackService.SendInvitationAsync(userData.Channel_id, _baseURL);
                return;
            }

            var meetingDTO = new MeetingCreateDTO() { CreatorEmail = user.profile.email, IsScheduled = false };

            try
            {
                var meetingLinkDTO = await _httpService.PostAsync<MeetingCreateDTO, MeetingLinkDTO>("meeting", meetingDTO);
                var link = $"{_baseURL}/meeting-page/%3Fid%3D{meetingLinkDTO.Id}&pwd%3D{meetingLinkDTO.Password}";

                await _slackService.SendSlackReplyAsync("", userData.Channel_id, link, userData.Text);
            }
            catch (Exception)
            {
                await _slackService.SendSlackReplyAsync("Some troubles happened", userData.Channel_id);
            }
        }

        [Route("/slack/interactivity")]
        [HttpPost]
        [Produces("application/json")]
        public OkResult Interactivity(SlackCommand _)
        {
            //TODO the bot more interactive

            return Ok();
        }

        [Route("/external/startMeeting")]
        [HttpPost]
        [Produces("application/json")]
        public async Task<ActionResult<ExternalResponse>> ExternalStartMeeting([FromBody] ExternalCommand data)
        {
            if (string.IsNullOrEmpty(data.Email) || !await _slackService.ValidateUserAsync(data.Email))
            {
                var result = _slackService.GetExternalMessage("Hello, unfortunately, we could not identify your credentials in the Whale application." +
                                                              "Please sign up using the link below:", _baseURL);
                return Unauthorized(result);
            }

            var meetingDTO = new MeetingCreateDTO() { CreatorEmail = data.Email, IsScheduled = false };

            try
            {
                var meetingLinkDTO = await _httpService.PostAsync<MeetingCreateDTO, MeetingLinkDTO>("meeting", meetingDTO);
                var link = $"{_baseURL}/meeting-page/%3Fid%3D{meetingLinkDTO.Id}&pwd%3D{meetingLinkDTO.Password}";

                return Ok(_slackService.GetExternalMessage("Join a Meeting", link));
            }
            catch (Exception)
            {
               return BadRequest( _slackService.GetExternalMessage("Some troubles happened", ""));
            }
        }
    }
}
