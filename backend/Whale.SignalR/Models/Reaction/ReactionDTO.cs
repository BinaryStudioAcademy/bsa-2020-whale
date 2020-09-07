using System;

namespace Whale.SignalR.Models.Reaction
{
    public class ReactionDTO
    {
        public string MeetingId { get; set; }
        public Guid UserId { get; set; }
        public string Reaction { get; set; }
    }
}
