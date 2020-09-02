using System;

namespace Whale.Shared.Models.Meeting
{
    public class MeetingSpeechCreateDTO
    {
        public Guid UserId { get; set; }
        public Guid MeetingId { get; set; }
        public string Message { get; set; }
    }
}
