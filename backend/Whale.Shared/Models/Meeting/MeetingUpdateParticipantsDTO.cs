using System;
using System.Collections.Generic;

namespace Whale.Shared.Models.Meeting
{
    public class MeetingUpdateParticipantsDTO
    {
        public Guid Id { get; set; }
        public List<string> ParticipantsEmails { get; set; }
        public string CreatorEmail { get; set; }
        public DateTimeOffset StartTime { get; set; }
    }
}
