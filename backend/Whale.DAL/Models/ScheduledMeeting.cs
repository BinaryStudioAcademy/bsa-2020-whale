using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;
using Whale.DAL.Abstraction;

namespace Whale.DAL.Models
{
    public class ScheduledMeeting : BaseEntity
    {
        public Guid MeetingId { get; set; }
        public Guid CreatorId { get; set; }
        public string ParticipantsEmails { get; set; }
        [NotMapped]
        public IEnumerable<AgendaPoint> AgendaPoints { get; set; }
    }
}
