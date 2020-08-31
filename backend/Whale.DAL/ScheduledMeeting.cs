using System;
using System.Collections.Generic;
using System.Text;
using Whale.DAL.Abstraction;

namespace Whale.DAL
{
    public class ScheduledMeeting : BaseEntity
    {
        public Guid MeetingId { get; set; }
        public Guid CreatorId { get; set; }
    }
}
