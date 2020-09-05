using System;

namespace Whale.API.Models.ScheduledMeeting
{
    public class ScheduledMeetingDTO
    {
        public Guid Id { get; set; }
        public string Settings { get; set; }
        public DateTimeOffset ScheduledTime { get; set; }
        public int AnonymousCount { get; set; }
    }
}
