using System;

namespace Whale.Shared.Models.Meeting
{
    public class MeetingSpeech
    {
        public Guid UserId { get; set; }
        public string Message { get; set; }
        public DateTimeOffset SpeechDate { get; set; }
    }
}
