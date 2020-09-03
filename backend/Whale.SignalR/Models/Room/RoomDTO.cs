using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Whale.Shared.Models.Participant;

namespace Whale.SignalR.Models.Room
{
    public class RoomDTO
    {
        public string RoomId { get; set; }
        public string Name { get; set; }
        public ICollection<ParticipantDTO> Participants { get; set; } = new List<ParticipantDTO>();
    }
}
