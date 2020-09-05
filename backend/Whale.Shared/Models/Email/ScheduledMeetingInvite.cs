using System;
using System.Collections.Generic;

namespace Whale.Shared.Models.Email
{
    public class ScheduledMeetingInvite
    {
        public string MeetingLink { get; set; }
        public Guid MeetingId { get; set; }
        public IEnumerable<string> ReceiverEmails { get; set; }
    }
}
