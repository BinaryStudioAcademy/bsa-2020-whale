using System;

namespace Whale.Shared.Models.Meeting
{
    public class MediaOnStartDTO
    {
        public Guid MeetingId { get; set; }
        public string RequestingUserEmail { get; set; }
        public bool IsVideoAllowed { get; set; }
        public bool IsAudioAllowed { get; set; }
    }
}