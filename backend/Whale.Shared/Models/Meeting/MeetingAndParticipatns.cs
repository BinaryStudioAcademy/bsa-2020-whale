using System;
using System.Collections.Generic;
using System.Text;
using Whale.DAL.Models;

namespace Whale.Shared.Models.Meeting
{
    public class MeetingAndParticipants
    {
        public DAL.Models.Meeting Meeting { get; set; }
        public string CreatorEmail { get; set; }
        public List<string> ParticipantsEmails { get; set; }

    }
}
