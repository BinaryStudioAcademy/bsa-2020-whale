using System;
using System.Collections.Generic;
using System.Text;

namespace Whale.Shared.Models.Room
{
    public class RoomCreate
    {
        public string MeetingId { get; set; }

        public string MeetingLink { get; set; }
        public ICollection<string> ParticipantsIds { get; set; }
    }
}
