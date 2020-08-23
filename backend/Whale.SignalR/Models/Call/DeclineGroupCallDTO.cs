using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Whale.SignalR.Models.Call
{
    public class DeclineGroupCallDTO
    {
        public Guid GroupId { get; set; }
        public string MeetingId { get; set; }
        public string Email { get; set; }
        public Guid UserId { get; set; }
    }

}

