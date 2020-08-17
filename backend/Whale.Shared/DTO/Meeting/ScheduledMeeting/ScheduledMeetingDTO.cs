using System;

namespace Whale.Shared.DTO.Meeting.ScheduledMeeting
{
    public class ScheduledMeetingDTO
    {
        public Guid Id { get; set; }
        public string Settings { get; set; }
        public DateTimeOffset ScheduledTime { get; set; }
        public int AnonymousCount { get; set; }
    }
}
