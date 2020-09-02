using System;
using Whale.Shared.Models.User;

namespace Whale.Shared.Models.Meeting
{
    public class MeetingSpeechDTO
    {
        public UserDTO User { get; set; }
        public string Message { get; set; }
        public DateTimeOffset SpeechDate { get; set; }
    }
}
