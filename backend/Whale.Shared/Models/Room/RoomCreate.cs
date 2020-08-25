using System;
using System.Collections.Generic;
using System.Text;

namespace Whale.Shared.Models.Room
{
    public class RoomCreate
    {
        public string MeetingId { get; set; }

        public string MeetingLink { get; set; }
        public int Duration { get; set; } = 10;
        public ICollection<string> ParticipantsIds { get; set; }
    }
}
