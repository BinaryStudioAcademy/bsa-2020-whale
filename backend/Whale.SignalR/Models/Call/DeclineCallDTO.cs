
using System;

namespace Whale.SignalR.Models.Call
{
    public class DeclineCallDTO
    {
        public Guid UserId { get; set; }
        public string MeetingId { get; set; }
        public string Email { get; set; }
    }
}
