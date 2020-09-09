using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using Whale.DAL.Abstraction;

namespace Whale.DAL.Models
{
    public class ScheduledMeeting : BaseEntity
    {
        public Guid MeetingId { get; set; }
        public Meeting Meeting { get; set; }
        public Guid CreatorId { get; set; }
        public User Creator { get; set; }
        public string ParticipantsEmails { get; set; }
        [NotMapped]
        public IEnumerable<AgendaPoint> AgendaPoints { get; set; }
        public string FullURL { get; set; }
        public string ShortURL { get; set; }
        public string Password { get; set; }
        public bool Canceled { get; set; }
    }
}
