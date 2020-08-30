using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Whale.SignalR.Models.Reaction
{
    public class ReactionDTO
    {
        public string MeetingId { get; set; }
        public Guid UserId { get; set; }
        public string Reaction { get; set; }
    }
}
