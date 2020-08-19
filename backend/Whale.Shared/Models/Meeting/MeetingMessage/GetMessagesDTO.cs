using System;
using System.Collections.Generic;
using System.Text;

namespace Whale.Shared.Models.Meeting.MeetingMessage
{
    public class GetMessagesDTO
    {
        public string MeetingId { get; set; }
        public string Email { get; set; }
    }
}
