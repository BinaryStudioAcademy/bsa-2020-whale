using System;
using Whale.Shared.Models.Meeting;

namespace Whale.SignalR.Models.Call
{
    public class StartCallDTO
    {
        public Guid ContactId { get; set; }
        public MeetingCreateDTO Meeting { get; set; }

    }
}
