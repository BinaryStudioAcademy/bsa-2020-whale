using System;

namespace Whale.Shared.DTO.Meeting.ScheduledMeeting
{
    public class ScheduledMeetingCreateDTO
    {
        public string Settings { get; set; }
        public DateTime ScheduledTime { get; set; }
        public int AnonymousCount { get; set; }
    }
}
