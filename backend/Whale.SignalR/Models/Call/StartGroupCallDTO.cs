using System;
using Whale.Shared.Models.Meeting;

namespace Whale.SignalR.Models.Call
{
    public class StartGroupCallDTO
    {
        public Guid GroupId { get; set; }
        public MeetingCreateDTO Meeting { get; set; }
    }
}
