using System;

namespace Whale.API.Models.ScheduledMeeting
{
    public class ScheduledMeetingExternal
    {
        public string Email { get; set; }
        public DateTimeOffset ScheduledTime { get; set; }
    }
}
