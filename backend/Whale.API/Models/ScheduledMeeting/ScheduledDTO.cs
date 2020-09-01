using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Whale.Shared.Models.Meeting;
using Whale.Shared.Models.User;

namespace Whale.API.Models.ScheduledMeeting
{
    public class ScheduledDTO
    {
        public Guid Id { get; set; }
        public MeetingDTO Meeting { get; set; }
        public UserDTO Creator { get; set; }
        public List<UserDTO> Participants { get; set; }
        public string Link { get; set; }
    }
}
