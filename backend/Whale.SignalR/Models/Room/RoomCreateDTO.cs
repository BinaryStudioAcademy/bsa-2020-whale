using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Whale.SignalR.Models.Room
{
    public class RoomCreateDTO
    {
        public string MeetingId { get; set; }
        public string MeetingLink { get; set; }
        public int Duration { get; set; } = 10;
        public ICollection<string> ParticipantsIds { get; set; }
    }
}
