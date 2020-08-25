using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Whale.Shared.Models.Meeting;

namespace Whale.SignalR.Models.Call
{
    public class StartGroupCallDTO
    {
        public Guid GroupId { get; set; }
        public MeetingCreateDTO Meeting { get; set; }
    }
}
