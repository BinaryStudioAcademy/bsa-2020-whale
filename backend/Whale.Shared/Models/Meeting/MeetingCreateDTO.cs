using System;

namespace Whale.Shared.Models.Meeting
{
    public class MeetingCreateDTO
    {
        public string Settings { get; set; }
        public DateTimeOffset StartTime { get; set; }
        public int AnonymousCount { get; set; }
        public bool IsScheduled { get; set; }
        public bool IsRecurrent { get; set; }
        public bool IsVideoAllowed { get; set; }
        public bool IsAudioAllowed { get; set; }
        public bool IsWhiteboard { get; set; }
        public bool IsPoll { get; set; }
        public bool IsAllowedToChooseRoom { get; set; }
        public string CreatorEmail { get; set; }
    }
}
