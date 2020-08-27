using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Whale.SignalR.Models.Room
{
    public class RoomDTO
    {
        public string RoomId { get; set; }
        public ICollection<string> ParticipantsIds { get; set; }
    }
}
