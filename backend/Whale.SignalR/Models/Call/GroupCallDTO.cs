using Whale.Shared.Models.Group;
using Whale.Shared.Models.Meeting;
using Whale.Shared.Models.User;

namespace Whale.SignalR.Models.Call
{
    public class GroupCallDTO
    {
        public MeetingLinkDTO MeetingLink { get; set; }
        public GroupDTO Group { get; set; }
        public UserDTO Caller{ get; set; }
    }
}
