using System.Collections.Generic;
using System.Threading.Tasks;
using Whale.API.Models.ScheduledMeeting;
using Whale.Shared.Exceptions;
using Whale.Shared.Models.Meeting;
using Whale.Shared.Services;

namespace Whale.API.Services
{
    public class ExternalScheduledMeetingService
    {
        private readonly UserService _userService;
        private readonly HttpService _httpService;

        public static string BaseUrl { get; } = "http://bsa2020-whale.westeurope.cloudapp.azure.com";

        public ExternalScheduledMeetingService(UserService userService, HttpService httpService)
        {
            _userService = userService;
            _httpService = httpService;
        }

        public async Task<string> StartScheduledMeetingAsync(ScheduledMeetingExternal scheduledMeetingExternal)
        {
            if (string.IsNullOrEmpty(scheduledMeetingExternal.Email) || !await ValidateUserAsync(scheduledMeetingExternal.Email))
            {
                throw new NotFoundException("User", scheduledMeetingExternal.Email);
            }

            var meetingDTO = new MeetingCreateDTO() {
                CreatorEmail = scheduledMeetingExternal.Email,
                IsScheduled = true,
                IsRecurrent = false,
                StartTime = scheduledMeetingExternal.ScheduledTime,
                ParticipantsEmails = new List<string>()
            };
            var link = await _httpService.PostStringAsync("meeting/scheduled", meetingDTO);
            return $"{BaseUrl}/redirection/{link}";
        }

        public async Task<bool> ValidateUserAsync(string userEmail)
        {
            var user = await _userService.GetUserByEmailAsync(userEmail);
            return user != null;
        }
    }
}
