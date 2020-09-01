using System;
using System.Collections.Generic;
using System.Linq;
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

        public async Task<string> StartScheduledMeeting(ScheduledMeetingExternal scheduledMeetingExternal)
        {
            if (string.IsNullOrEmpty(scheduledMeetingExternal.Email) || !await ValidateUser(scheduledMeetingExternal.Email))
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
            var link = await _httpService.PostStringAsync("api/meeting/scheduled", meetingDTO);
            return $"{BaseUrl}/redirection/{link}";
        }

        public async Task<bool> ValidateUser(string userEmail)
        {
            var user = await _userService.GetUserByEmail(userEmail);
            return user != null;
        }
    }
}
