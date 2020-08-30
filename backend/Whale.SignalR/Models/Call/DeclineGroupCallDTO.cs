using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Whale.Shared.Models.User;

namespace Whale.SignalR.Models.Call
{
    public class DeclineGroupCallDTO
    {
        public Guid GroupId { get; set; }
        public string MeetingId { get; set; }
        public UserDTO CallCreator { get; set; }
        public Guid UserId { get; set; }
    }

}

