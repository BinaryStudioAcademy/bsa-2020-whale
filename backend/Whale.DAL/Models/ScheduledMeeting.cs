using System;
using System.Collections.Generic;
using System.Text;
using Whale.DAL.Abstraction;

namespace Whale.DAL.Models
{
    public class ScheduledMeeting : BaseEntity
    {
        public Guid MeetingId { get; set; }
        public Guid CreatorId { get; set; }
        public string ParticipantsEmails { get; set; }
        public string Link { get; set; }
    }
}
